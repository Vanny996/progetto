import activityRepository from "../repository/ActivityRepository.js";
import mailService from "./mailService.js";

export default class SchedulerService {

    jobs = [];
    jobData = {};

    register(job) {
        this.jobs.push(job.activityId);
        this.jobData[job.activityId] = job;
    }

    async exec() {
        const activitiesOverdue={};
        const activities =await  activityRepository.getManyByIds(this.jobs);

        activities.forEach(activity => {
            if (new Date().getTime() > activity.dueDate.getTime()) {
                if (!activitiesOverdue[this.jobData[activity._id].ownerEmail]) {
                    activitiesOverdue[this.jobData[activity._id].ownerEmail] = [];
                }
                activitiesOverdue[this.jobData[activity._id].ownerEmail].push({
                    name: this.jobData[activity._id].ownerName,
                    email: this.jobData[activity._id].ownerEmail,
                    activityId: this.jobData[activity._id].activityId

                })
            }
        })
       for(const key in activitiesOverdue){
           const res = await mailService.sendActivityOverdueMail(key,activitiesOverdue[key]);

                }
            }
            start() {
                setInterval(this.exec,1000 * 60 * 60 * 24);
        }
        }
