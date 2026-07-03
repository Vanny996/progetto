import { activityStatus} from "../../constants/const.js";
import {getActivities} from '../../services/activityService.js';

export const listOpen = async (req,res)=>{

     try {

    const activities = await getActivities(req.userId, activityStatus.OPEN);
    res.status(200). json(activities);
    } catch(err){
    return res.status(err.status || 500).json({message:err.message})
    }
  }
