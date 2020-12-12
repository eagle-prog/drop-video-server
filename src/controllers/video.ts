import { Request, Response } from 'express';
import { successResponse } from '../modules/common/service';
import VideoService from '../modules/video/service';
import { Video } from '../modules/video/model';

export class VideoController {

    private videoService: VideoService = new VideoService();

    public get(req: Request, res: Response) {
        // const contacts = JSON.parse(req.body.contacts);
        // this.videoService.sync(contacts, (data: [Contact]) => {
        //     successResponse('Sync contacts successful', data, res);
        // });
    }

    public download(req: Request, res: Response) {
        // const query   = JSON.parse(req.body.query);
        // const contact = JSON.parse(req.body.contact);
        // this.contactService.update(query, contact, (data: Contact) => {
        //     successResponse('Update contact successful', data, res);
        // });
    }

}