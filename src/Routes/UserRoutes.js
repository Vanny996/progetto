import { addUser, confirmRegistration }from'../controllers/userControllers/UserController.js';
import { addUserValidator } from '../validators/addUserValidator.js';
import{ confirmRegistrationValidator} from'../validators/confirmRegistrationValidator.js';
import {loginValidator} from '../validators/loginValidator.js';
import { login } from '../controllers/userControllers/UserController.js';
export class UserRoutes{
    constructor (router){
        router.post('/user',addUserValidator,addUser);
        router.get('/user/:id/confirm/:token',confirmRegistrationValidator, confirmRegistration);
        router.post('/user/login',loginValidator,login);

    }
}