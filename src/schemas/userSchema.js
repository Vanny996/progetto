import mongoose from "mongoose";
import{userStatus} from '../constants/const.js';

const userSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:true
    },
    email: {
    type :String,
    unique:true},
    avatar:{
        type :String,
        default:"avatar"
    },
    password: String,
    salt: String,
    status:{type: String,
     default: userStatus.PENDING},
    registrationToken : String
},
    {
timestamps: true

});
export default mongoose.model('user', userSchema);

