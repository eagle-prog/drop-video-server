import * as puppeteer from 'puppeteer';
import { Video } from './model';
import fb = require('fb-video-downloader');

export default class VideoService {

    async getFacebookVideos(query: string): Promise<Video[]> {
        const browser = await puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            headless: false,
        });
        const page = await browser.newPage();
        
        await page.goto('https://www.facebook.com/');
        await page.type('input[name=email]', 'eagle19243@gmail.com');
        await page.type('input[name=pass]', '#Eagle19243');
        await page.click('button[name=login]');
        await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.goto(`https://www.facebook.com/search/videos?q=${query}`);
        await page.waitForSelector('div[role=article] a');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const linkEls: any  = await page.$$('div[role=article] a');
        const data: Video[] = [];
        
        for (const linkEl of linkEls) {
            const link       = await page.evaluate(el => el.getAttribute('href'), linkEl);
            const re: RegExp = /\/watch\/\?ref=search&v=(\d+)/g;
            const match      = re.exec(link);
            
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

        return data;
    }

    async downloadFacebookVideo(url: string) {
        const data = await fb.getInfo(url);
        return data.download.hd;
    }

}