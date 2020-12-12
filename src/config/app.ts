import * as express from 'express';
import * as bodyParser from 'body-parser';
import { CommonRoutes } from '../routes/common';
import { VideoRoutes } from '../routes/video';

class App {

   public app: express.Application;

   private common: CommonRoutes = new CommonRoutes();
   private video: VideoRoutes   = new VideoRoutes();

   constructor() {
      this.app = express();
      this.config();
      this.video.route(this.app);
      this.common.route(this.app);
   }

   private config(): void {
      // support application/json type post data
      this.app.use(bodyParser.json());
      // support application/x-www-form-urlencoded post data
      this.app.use(bodyParser.urlencoded({ extended: false }));
   }

}
export default new App().app;