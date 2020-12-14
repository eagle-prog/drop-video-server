import { Application, Request, Response } from 'express';

export class CommonRoutes {
    route(app: Application) {
        app.get('/', (req: Request, res: Response) => {
            res.status(200).send({
                success: true,
                message: 'Test'
            });
        });
        // Mismatch URL
        app.all('*', (req: Request, res: Response) => {
            res.status(404).send({
                error: true,
                message: 'Check your URL'
            });
        });
    }
}
