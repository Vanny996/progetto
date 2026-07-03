import  express from 'express';
import {ActivityRoutes} from './ActivityRoutes.js';
import {UserRoutes} from './UserRoutes.js';
const router = express.Router();

export  const registerRoutes= (app)=>{

    new UserRoutes(router);
    new ActivityRoutes(router);
    app.use('/', router)
}