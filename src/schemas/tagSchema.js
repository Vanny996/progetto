import mongoose from "mongoose";

const tagSchema = new mongoose.Schema ({
        name:{
            type : String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
            minlength:2,
            maxlength:50

        }},
    {timestamps: true});
export default mongoose.model('tag',tagSchema);