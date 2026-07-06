import  express from 'express';
import {ActivityRoutes} from './ActivityRoutes.js';
import {UserRoutes} from './UserRoutes.js';
import {PostRoutes} from './PostRoutes.js';
import {CommentRoutes} from './CommentRoute.js';
import{LikeRoutes} from "./LikeRoutes.js";

const router = express.Router();

export  const registerRoutes= (app)=>{

    new UserRoutes(router);
    new ActivityRoutes(router);
    new PostRoutes(router);
    new CommentRoutes(router);
    new LikeRoutes(router)
    app.use('/', router)
}