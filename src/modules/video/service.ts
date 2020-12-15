import * as puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Video } from './model';
import fb = require('fb-video-downloader');

export default class VideoService {
    private option:any = {
        ignoreDefaultArgs: [
            '--disable-extensions',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
        ],
        headless: false,
    };

    async getFacebookVideos(query: string): Promise<Video[]> {
        const browser = await puppeteer.launch(this.option);
        const page = await browser.newPage();
        
        await page.goto('https://www.facebook.com/');
        await page.type('input[name=email]', 'eagle19243@gmail.com');
        await page.type('input[name=pass]', '#Eagle19243');
        await page.click('button[name=login]');
        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.goto(`https://www.facebook.com/search/videos?q=${query}`);
        await page.waitForSelector('div[role=article] a');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const linkEls:any  = await page.$$('div[role=article] a');
        const data:Video[] = [];
        
        for (const linkEl of linkEls) {
            const link      = await page.evaluate(el => el.getAttribute('href'), linkEl);
            const re:RegExp = /\/watch\/\?ref=search&v=(\d+)/g;
            const match     = re.exec(link);
            
            if (match === null) {
                continue;
            }
            
            const id        = match[1];
            const thumbnail = await page.evaluate(e => {
                return e.querySelector('img').getAttribute('src');
            }, linkEl);
            const title     = await page.evaluate(e => {
                return e.querySelector('div.linoseic h2').textContent;
            }, linkEl);
            
            data.push({
                id, 
                title, 
                thumbnail, 
                url: `https://www.facebook.com${link}`
            });
        }

        browser.close();

        return data;
    }

    async downloadFacebookVideo(url: string) {
        const data = await fb.getInfo(url);
        return data.download.hd || data.download.sd;
    }

    async getInstagramVideos(query: string): Promise<Video[]> {
        const data: Video[] = [];
        const browser = await puppeteer.launch(this.option);
        const page = await browser.newPage();
        
        await page.goto('https://www.instagram.com/');
        await page.waitForSelector('input[name=username]');
        await page.type('input[name=username]', 'eagle19243@gmail.com');
        await page.type('input[name=password]', '#Eagleinstagram19243');
        await page.click('button[type=submit]');
        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.waitForSelector('input[placeholder="Search"][autocapitalize="none"]');
        await page.type('input[placeholder="Search"][autocapitalize="none"]', query);
        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.waitForSelector('a[href^="/explore/tags/"]');
        await page.click('a[href^="/explore/tags/"]');
        await page.waitForSelector('article div[style^="flex-direction"] a[href^="/p/"][href$="/"]');
        
        const videos = await page.evaluate(async () => {
            const distance = 600;
            const delay    = 500;
            let videos     = [];
            let linkEls    = [];
            let stopScroll = false;

            setTimeout(() => {
                stopScroll = true;
            }, 10000);
            
            while (!stopScroll) {
                const els = document.querySelectorAll('article div[style^="flex-direction"] a[href^="/p/"][href$="/"]');
                linkEls = linkEls.concat(Array.from(els));
                document.scrollingElement.scrollBy(0, distance);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            for (const linkEl of linkEls) {
                const spanEl = linkEl.querySelector('span[aria-label="Video"]');
                if (!spanEl) {
                    continue;
                }

                const id = linkEl.getAttribute('href');
                const imgEl = linkEl.querySelector('img');
                const title = imgEl.getAttribute('alt');
                const thumbnail = imgEl.getAttribute('src');
                videos.push({
                    id,
                    title: title.length > 170 ? 
                        `${title.substr(0, 170)}...` : title,
                    thumbnail,
                    url: `https://www.instagram.com${id}`
                });
            }
            
            videos = videos.filter((item, pos) => {
                const s = JSON.stringify(item);
                return pos === videos.findIndex(obj => {
                    return JSON.stringify(obj) === s;
                });
            });
            
            return videos;
        });

        browser.close();
        
        return videos;
    }

    async downloadInstagramVideo(url: string) {
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);
        return $("meta[property='og:video']").attr("content");
    }

    async downloadVimeoVideo(url: string) {
        const browser = await puppeteer.launch(this.option);
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('.player.js-player');
        
        const configUrl = await page.evaluate('document.querySelector(".player.js-player").getAttribute("data-config-url")') as string;
        const response = await axios.get(configUrl);
        const config = response.data;
        
        browser.close();
        
        return config.request.files.progressive[1].url;
    }

    async downloadPinterestVideo(url: string) {
        return url;
    }

}