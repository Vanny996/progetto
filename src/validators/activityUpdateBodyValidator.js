import joi from 'joi';
import expressJoi from 'express-joi-validation';
import { activityStatus } from '../constants/const.js';

const validator = expressJoi.createValidator({ passError: true });

const updateBodyValidator = joi.object({
    content: joi.string().min(3).max(2048),
    name: joi.string().min(3).max(256),
    description: joi.string().min(3),
    status: joi.string().valid(activityStatus.OPEN, activityStatus.DELETED)
}).or('content', 'name', 'description', 'status');

export const activityUpdateBodyValidator = validator.body(updateBodyValidator);

