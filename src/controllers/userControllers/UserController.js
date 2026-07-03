import {add,verifyRegistrationToken} from "../../services/userService.js";
import { loginUser} from "../../services/userService.js";

const isMongoAuthenticationError = (err) =>
    err?.code === 13 || /requires authentication/i.test(err?.message || '');

export const addUser = async (req, res) => {
    const content = req.body;
    try {
        const result = await add(content);

        let user = result.toObject ? result.toObject() : result;

        user.status = 'pending';

        delete user.password;

        return res.status(201).json(user);

    } catch (err) {
        console.log('debug',err.code, err.message, err.name);
        if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
            return res.status(409).json({ error: 'Email già registrata' });
        }
        return res.status(500).json({ message: `Qualcosa è andato storto: ${err.message}` });
    }
};
export const confirmRegistration = async (req,res)=> {
    const userId = req.params.id;
    const token = req.params.token;
try{
        await verifyRegistrationToken(userId,token);
        res.status(200).send('ok');
    }catch(err){
        res.status(err.status).json({message: err.message});
    }
}
export const login = async(req,res)=> {
    const {email, password} = req.body;
    try {
        const user = await loginUser(email, password)
        res.status(200).json(user);
    } catch (err) {
        res.status(err.status).json({message: err.message})
    }
}
