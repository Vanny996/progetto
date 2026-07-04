import  express from 'express';
import {ActivityRoutes} from './ActivityRoutes.js';
import {UserRoutes} from './UserRoutes.js';
import {PostRoutes} from './PostRoutes.js';
const router = express.Router();

export  const registerRoutes= (app)=>{

    new UserRoutes(router);
    new ActivityRoutes(router);
    new PostRoutes(router);
    app.use('/', router)
}