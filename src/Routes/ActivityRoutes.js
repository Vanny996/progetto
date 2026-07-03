import { activityBodyValidator} from "../validators/activityBodyValidator.js";
import { activityParamsValidator} from "../validators/activityParamsValidator.js";

import checkAuthorizationMiddleware from '../middlewares/checkAuthorizationMiddleware.js';

import {add} from '../controllers/activityControllers/addActivitiesController.js';
import {get} from '../controllers/activityControllers/getActivitiesController.js';
import {update} from '../controllers/activityControllers/updateActivitiesController.js';
import {remove} from '../controllers/activityControllers/deleteActivitiesController.js';
import {listOpen} from '../controllers/activityControllers/listOpenActivitiesController.js';
import { listCompleted} from '../controllers/activityControllers/listCompletedActivitiesController.js';
import {complete} from '../controllers/activityControllers/completeActivityController.js';
import {archive}from '../controllers/activityControllers/archiveActivitiesController.js';
import {open} from '../controllers/activityControllers/openActivitiesController.js';

export class ActivityRoutes {
    constructor(router) {
        router.post('/activity', checkAuthorizationMiddleware, activityBodyValidator, add);
        router.get('/completed', checkAuthorizationMiddleware, listCompleted);
        router.get('/', checkAuthorizationMiddleware, listOpen);
        router.get('/activity/:id', checkAuthorizationMiddleware, activityParamsValidator, get);

        router.patch('/:id/open', checkAuthorizationMiddleware, activityParamsValidator, open);
        router.patch('/:id/complete', checkAuthorizationMiddleware, activityParamsValidator, complete);
        router.patch('/:id/archive', checkAuthorizationMiddleware, activityParamsValidator, archive);

        router.patch('/activity/:id', checkAuthorizationMiddleware, activityParamsValidator, activityBodyValidator, update);
        router.delete('/activity/:id', checkAuthorizationMiddleware, activityParamsValidator, remove);
    }
}