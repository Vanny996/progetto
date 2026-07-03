import { openActivityById } from "../../services/activityService.js";

export const open = async (req, res) => {
    try {
        const activity = await openActivityById(req.params.id, req.userId);
        return res.status(200).json(activity);
    } catch (error) {
        return res.status(error.status || 404).json({
            message: 'activity not found'
        });
    }
};
