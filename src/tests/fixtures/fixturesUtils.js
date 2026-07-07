import CryptoUtils from "../../utils/cryptoUtils.js";
import userSchema from "../../schemas/userSchema.js";
import mongoose from "mongoose";
import postSchema from "../../schemas/postSchema.js";
import tagSchema from "../../schemas/tagSchema.js";
import commentSchema from "../../schemas/commentSchema.js";
import {LikeRoutes} from "../../Routes/LikeRoutes.js";
import LikeSchema from "../../schemas/likeSchema.js";
import likeSchema from "../../schemas/likeSchema.js";

const ObjectId = mongoose.Types.ObjectId;

class FixturesUtils {
    async createUser(data, save) {
        const {password, salt} = CryptoUtils.hashPassword(data.password || 'password');

        const user = {
            name: data.name || 'test user',
            username:'testusername',
            _id: data.id|| new ObjectId(),
            email: data.email || 'test@gmail.com',
            password: password,
            salt: salt
        }
        if (save) {
            const res = await userSchema.create(user);
            return res.toObject();
        }
        return user;
    }

      async clearDb() {
               await userSchema.deleteMany();
        await postSchema.deleteMany();
        await tagSchema.deleteMany();
        await commentSchema.deleteMany();
        await likeSchema.deleteMany();
    }
    async getUserFromDb(id){
        const user = await userSchema.findById(id);
        return user? user.toObject() : null;
    }
};

export default new FixturesUtils();