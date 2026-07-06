import joi from 'joi';
import expressJoi from 'express-joi-validation';

const createValidator = expressJoi.createValidator;
const validator = createValidator({ passError: true });

const bodyValidator = joi.object({
    title: joi.string().min(3).max(256).required(),
    content: joi.string().min(1).required(),
    tags: joi.array().items(joi.string().min(2).max(50))
});

export const addPostValidator = validator.body(bodyValidator);

const updateBodyValidator = joi.object({
    title: joi.string().min(3).max(256),
    content: joi.string().min(1),
    tags: joi.array().items(joi.string().min(2).max(50))
});

export const updatePostValidator = validator.body(updateBodyValidator);