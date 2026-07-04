import checkAuthorizationMiddleware from '../middlewares/checkAuthorizationMiddleware.js';
import { addCommentValidator, updateCommentValidator } from '../validators/commentValidator.js';
import { createComment, editComment, removeComment } from '../controllers/commentController/CommentController.js';

export class CommentRoutes {
    constructor(router) {
        router.post('/post/:postId/comment', checkAuthorizationMiddleware, addCommentValidator, createComment);
        router.put('/comment/:id', checkAuthorizationMiddleware, updateCommentValidator, editComment);
        router.delete('/comment/:id', checkAuthorizationMiddleware, removeComment);
    }
}