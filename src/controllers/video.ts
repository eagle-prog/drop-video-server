import { Request, Response } from 'express';
import { successResponse, failureResponse } from '../modules/common/service';
import VideoService from '../modules/video/service';
import { Video } from '../modules/video/model';

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
                failureResponse('Failed in getting a video', err, res);
            }
        } else {
            failureResponse('Unsupported website', null, res);
        }
    }

    async download(req: Request, res: Response) {
        const url     = req.body.url;
        const website = req.body.website;
        
        if (website === 'facebook') {
            try {
                const data = await this.videoService.downloadFacebookVideo(url);
                successResponse('Downloading a video successful', data, res);
            } catch (err) {
                failureResponse('Failed in downloading a video', err, res);
            }
        } else {
            failureResponse('Unsupported website', null, res);
        }
    }

}