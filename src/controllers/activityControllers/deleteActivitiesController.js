import { deleteActivityById } from '../../services/activityService.js';

export const remove = async (req, res) => {
        try {

                const activity = await deleteActivityById(req.params.id, req.userId);


                if (activity) {
                        return res.status(200).json(activity);
                } else {

                        return res.status(404).json({ message: `activity not found` });
                }
        } catch (error) {

                return res.status(500).json({ message: error.message });
        }
};