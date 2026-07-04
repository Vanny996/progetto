import joi from 'joi';
import expressJoi from 'express-joi-validation';

const createValidator = expressJoi.createValidator;
const validator = createValidator({ passError: true });

const commentBodyValidator = joi.object({
    text: joi.string().min(1).max(2000).required()
});

export const addCommentValidator = validator.body(commentBodyValidator);
export const updateCommentValidator = validator.body(commentBodyValidator);