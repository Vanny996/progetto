import express from 'express';
import checkAuthorizationMiddleware from '../middlewares/checkAuthorizationMiddleware.js';
import { addPostValidator } from '../validators/postValidator.js';
import { createPost, listPosts, getPost, uploadPostImage } from '../controllers/postController/PostController.js';

export class PostRoutes {
    constructor(router) {
        router.post('/post', checkAuthorizationMiddleware, uploadPostImage, addPostValidator, createPost);

        router.get('/post', listPosts);
        router.get('/post/:id', getPost);
    }
}