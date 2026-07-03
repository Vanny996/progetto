import joi  from 'joi';
import expressJoi from 'express-joi-validation';

const validator =expressJoi.createValidator({passError: true});

 const BodyValidator = joi.object().keys({
    name: joi.string().required().min(3).max(256),
    description: joi.string().required().min(3)
})

export const activityBodyValidator = validator.body(BodyValidator);
