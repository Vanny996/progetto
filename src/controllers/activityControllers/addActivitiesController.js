import { addActivities } from '../../services/activityService.js';

export const add = async (req, res) => {
    const content = req.body;
    try {
        const activity = await addActivities(content, req.userId);
        return res.status(200).json(activity);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};