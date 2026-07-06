import { toggleLike } from "../../services/likeservice.js";

export const toggle = async (req, res) => {
    const { postId } = req.params;
    const userId = req.userId;

    try {
        const result = await toggleLike(postId, userId);
        return res.status(200).json(result);
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};