import NotFoundException from '../exceptions/NotFoundException.js';
import { activityStatus } from '../constants/const.js';
import activityRepository from '../repository/activityRepository.js';

export const addActivities = async (content, userId)=> {
    content.ownerId = userId;
    console.log("add activity service");
       const activity =  await activityRepository.add(content);
       console.log("activity created");
       return activity;
};

export const getActivityById = async (id,userId)=>{
    return await activityRepository.getById(id,userId);
    };
   
export const updateActivityById = async (id,params, userId)=> {
    const activity = await activityRepository.update(id,params, userId);
    if(!activity){
    throw new NotFoundException('error: activity${id} not found')
    }
    return activity;
  };
    
export const deleteActivityById = async (id,userId)=>{

   return await activityRepository.update(id,{status:activityStatus.DELETED}, userId);

};

export const getActivities = async (userId, status ) => {
return await activityRepository.getManyByUserId(userId,status);
}
export const completeActivityById = async (id,userId)=>{
    const activity = await activityRepository.completed(id,userId);
    if(!activity){
        throw new NotFoundException('error: activity${id} not found')
    }
    return activity;
}

export const archiveActivityById = async (id, userId) => {
    return await activityRepository.archive(id, userId);
}

export const openActivityById = async (id, userId) => {
    return await activityRepository.open(id, userId);
}