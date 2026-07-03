import { activityStatus} from "../../constants/const.js";
import {getActivities} from '../../services/activityService.js';
export const listCompleted = async (req,res)=>{

     try {
            console.log("lista attivita per utente: " + req.userId);
    const activities = await getActivities(req.userId, activityStatus.COMPLETED);
    res.status(200). json(activities);
    } catch(err){
    return res.status(err.status || 500).json({message:err.message})
    }
  }
