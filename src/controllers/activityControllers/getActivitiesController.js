import {getActivityById} from '../../services/activityService.js';
export const get = async (req,res)=>{
    const activityId = req.params.id;
    try {
        console.log("Get Activity:" + activityId);

    const activity = await getActivityById(activityId,req.userId);
    res.status(200). json(activity);
    } catch(err){
    return res.status(err.status || 500).json({message:err.message})
    }
  }
  