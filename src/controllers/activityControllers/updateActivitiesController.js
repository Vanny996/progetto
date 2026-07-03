export const update = async (req, res) => {
    try {
        const activity = await updateActivityById(req.params.id, req.body, req.userId);

        if (activity) {
            return res.status(200).json(activity);
        } else {

            return res.status(404).json({ message: `activity not found` });
        }
    } catch (error) {

        return res.status(404).json({ message: `activity not found` });
    }
};
