import { Request, Response } from 'express';
import { successResponse, failureResponse } from '../modules/common/service';
import VideoService from '../modules/video/service';
import ytdl = require('ytdl-core');

export class VideoController {

    private videoService: VideoService = new VideoService();

    async get(req: Request, res: Response) {
        const query   = req.body.query;
        const website = req.body.website;
        
        if (website === 'facebook') {
            try {
                const data = await this.videoService.getFacebookVideos(query);
                successResponse('Getting a video successful', data, res);
            } catch (err) {
                console.log(err);
                failureResponse('Failed in getting a video', err, res);
            }
        } else if (website === 'instagram') {
            try {
                const data = await this.videoService.getInstagramVideos(query);
                successResponse('Getting a video successful', data, res);
            } catch (err) {
                console.log(err);
                failureResponse('Failed in getting a video', err, res);
            }
        } else {
            failureResponse('Unsupported website', null, res);
        }
    }

    async download(req: Request, res: Response) {
        const url     = req.body.url;
        const website = req.body.website;

        if (website === 'vimeo') {
            try {
                const data = await this.videoService.downloadVimeoVideo(url);
                successResponse('Downloading a video successful', data, res);
            } catch (err) {
                console.log(err);
                failureResponse('Failed in downloading a video', err, res);
            }
        } else if (website === 'pinterest') {
            try {
                const data = await this.videoService.downloadPinterestVideo(url);
                successResponse('Downloading a video successful', data, res);
            } catch (err) {
                console.log(err);
                failureResponse('Failed in downloading a video', err, res);
            }
        } else if (website === 'facebook') {
            try {
                const data = await this.videoService.downloadFacebookVideo(url);
                successResponse('Downloading a video successful', data, res);
            } catch (err) {
                console.log(err);
                failureResponse('Failed in downloading a video', err, res);
            }
        } else if (website === 'instagram') {
            try {
                const data = await this.videoService.downloadInstagramVideo(url);
                console.log('download instagram:', data);
                successResponse('Downloading a video successful', data, res);
            } catch (err) {
                console.log(err);
                failureResponse('Failed in downloading a video', err, res);
            }
        } else {
            failureResponse('Unsupported website', null, res);
        }
    }

    async pipe(req: Request, res: Response) {
        const url     = req.query.url as string;
        const website = req.query.website;
        
        if (website === 'youtube') {
            if(!ytdl.validateURL(url)) {
                return res.sendStatus(400);
            }

            const info = await ytdl.getBasicInfo(url);
            const title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "");
    
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            ytdl(url).pipe(res);
        } else {
            failureResponse('Unsupported website', null, res);
        }
    }

}