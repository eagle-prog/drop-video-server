import puppeteer from 'puppeteer-extra';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Video } from './model';
import fb = require('fb-video-downloader');
import StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

export default class VideoService {
    private option:any = {
        ignoreDefaultArgs: [
            '--disable-extensions',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
            '--start-maximized',
        ],
        args: [
            '--no-sandbox',
        ],
        headless: true,
    };
    private fbUser = 'eagle19243@gmail.com';
    private fbPass = '#Eagle19243';
    private inUser = 'eagle19243@gmail.com';
    private inPass = '#Eagleinstagram19243';

    async getFacebookVideos(query: string): Promise<Video[]> {
        const browser = await puppeteer.launch(this.option);
        const context = browser.defaultBrowserContext();
        context.overridePermissions('https://www.facebook.com', 
            ['geolocation', 'notifications']);
        const page    = await browser.newPage();
        
        await page.goto('https://www.facebook.com/');
        await page.type('input[name=email]', this.fbUser);
        await page.type('input[name=pass]', this.fbPass);
        await page.click('button[name=login]');
        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.goto(`https://www.facebook.com/search/videos?q=${query}`);
        await page.waitForSelector('div[role=article] a');
        await page.waitForTimeout(3000);

        const videos = await page.evaluate(async () => {
            const distance  = 600;
            const delay     = 500;
            const re:RegExp = /\/watch\/\?ref=search&v=(\d+)/g;
            const videos    = [];

            while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) 
            {
                const els = document.querySelectorAll('div[role=article] a');
                for (const el of els) {
                    const link  = el.getAttribute('href');
                    const match = re.exec(link);

                    if (match === null) {
                        continue;
                    }

                    const id        = match[1];
                    const thumbnail = el.querySelector('img').getAttribute('src');
                    const title     = el.querySelector('div.linoseic h2').textContent;
                    const notExist  = videos.findIndex(video => {
                        return video.id === id;
                    }) === -1;

                    if (notExist) {
                        videos.push({
                            id, 
                            title, 
                            thumbnail, 
                            url: `https://www.facebook.com${link}`
                        });
                    }
                }

                if (videos.length >= 50) {
                    break;
                }

                document.scrollingElement.scrollBy(0, distance);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            return videos;
        });

        browser.close();

        return videos;
    }

    async downloadFacebookVideo(url: string) {
        const data = await fb.getInfo(url);
        console.log('downloadFacebookVideo:', data);
        return data.download.hd || data.download.sd;
    }

    async getInstagramVideos(query: string): Promise<Video[]> {
        const browser = await puppeteer.launch(this.option);
        const page = await browser.newPage();
        
        await page.setViewport({width: 1366, height: 768});
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        await page.goto('https://www.instagram.com/');
        await page.waitForSelector('input[name=username]');
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
            const result = document.evaluate("//button[text()='Accept']", document, null, XPathResult.ANY_TYPE, null);
            const btnAccept:any = result.iterateNext();

            if (btnAccept) {
                btnAccept.click();
            }
        });
        await page.type('input[name=username]', this.inUser);
        await page.type('input[name=password]', this.inPass);
        await page.click('button[type=submit]');
        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.waitForSelector('input[placeholder="Search"][autocapitalize="none"]');
        await page.type('input[placeholder="Search"][autocapitalize="none"]', query);
        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.waitForSelector('a[href^="/explore/tags/"]');
        console.log('waitfor tag');
        await page.click('a[href^="/explore/tags/"]');
        await page.waitForSelector('article div[style^="flex-direction"] a[href^="/p/"][href$="/"]');
        
        const videos = await page.evaluate(async () => {
            const distance = 600;
            const delay    = 500;
            const videos   = [];
            
            while (videos.length < 50 ||
                document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) 
            {
                const els = document.querySelectorAll('article div[style^="flex-direction"] a[href^="/p/"][href$="/"]');
                for (const el of els) {
                    const spanEl = el.querySelector('span[aria-label="Video"]');

                    if (!spanEl) {
                        continue;
                    }

                    const link      = el.getAttribute('href');
                    const imgEl     = el.querySelector('img');
                    const title     = imgEl.getAttribute('alt');
                    const thumbnail = imgEl.getAttribute('src');
                    const notExist  = videos.findIndex(video => {
                        return video.id === link;
                    }) === -1;

                    if (notExist) {
                        videos.push({
                            id: link,
                            title: title.length > 170 ? 
                                `${title.substr(0, 170)}...` : title,
                            thumbnail,
                            url: `https://www.instagram.com${link}`
                        });
                    }
                }

                document.scrollingElement.scrollBy(0, distance);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            return videos;
        });

        browser.close();
        
        return videos;
    }

    async downloadInstagramVideo(url: string) {
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);
        const data = $("meta[property='og:video']").attr("content");
        return data;
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
        const response = await axios.get(`https://pinterest-video-api.herokuapp.com/${url}`);
        return response.data;
    }

}