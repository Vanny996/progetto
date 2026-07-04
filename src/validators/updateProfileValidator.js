import joi from 'joi';
import expressJoi from 'express-joi-validation';

const createValidator = expressJoi.createValidator;
const validator = createValidator({ passError: true });

const bodyValidator = joi.object({
    name: joi.string().min(3).max(256),
    avatar: joi.string()
});

export const updateProfileValidator = validator.body(bodyValidator);