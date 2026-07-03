import { archiveActivityById } from "../../services/activityService.js";

export const archive = async (req, res) => {
    try {
        const activity = await archiveActivityById(req.params.id, req.userId);
        return res.status(200).json(activity);
    } catch (error) {
        return res.status(404).json({
            message: 'activity not found'
        });
    }
};