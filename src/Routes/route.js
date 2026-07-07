import  express from 'express';
import {UserRoutes} from './UserRoutes.js';
import {PostRoutes} from './PostRoutes.js';
import {CommentRoutes} from './CommentRoute.js';
import{LikeRoutes} from "./LikeRoutes.js";

const router = express.Router();

export  const registerRoutes= (app)=>{

    new UserRoutes(router);
    new PostRoutes(router);
    new CommentRoutes(router);
    new LikeRoutes(router)
    app.use('/', router)
}