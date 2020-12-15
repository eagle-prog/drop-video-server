import { Application, Request, Response } from 'express';
import { VideoController } from '../controllers/video';

export class VideoRoutes {

    private video: VideoController = new VideoController();

    route(app: Application) {

        app.post('/video/get', (req: Request, res: Response) => {
            this.video.get(req, res);
        });

        app.post('/video/download', (req: Request, res: Response) => {
            this.video.download(req, res);
        });

        app.get('/video/download', (req: Request, res: Response) => {
            this.video.pipe(req, res);
        });

    }
}