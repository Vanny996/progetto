import { completeActivityById } from "../../services/activityService.js";

export const complete = async (req, res) => {
    try {
        const activity = await completeActivityById(req.params.id, req.userId);
        return res.status(200).json(activity);
    } catch (error) {
        return res.status(error.status || 404).json({
            message: error.message || 'activity not found'
        });
    }
};