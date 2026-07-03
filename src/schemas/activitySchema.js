
import mongoose, {Schema} from 'mongoose';
import { activityStatus } from "../constants/const.js";

const activitySchema = new Schema ({
    ownerId: String,
    name: String,
    description: String,
    status: {
    type: String,
     default: activityStatus.OPEN
    }
},
{timestamps: true}
);

export default mongoose.model('activity',activitySchema);