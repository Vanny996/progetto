import checkAuthorizationMiddleware from '../middlewares/checkAuthorizationMiddleware.js';
import { toggle } from '../controllers/likeControllers/LikeController.js';

export class LikeRoutes {
    constructor(router) {
        router.post('/post/:postId/like', checkAuthorizationMiddleware, toggle);
    }
}