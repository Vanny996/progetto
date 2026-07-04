import { addComment, updateComment, deleteComment } from "../../services/commentservice.js";

export const createComment = async (req, res) => {
    const { postId } = req.params;
    const authorId = req.userId;
    const { text } = req.body;

    try {
        const comment = await addComment(postId, authorId, text);
        return res.status(201).json(comment);
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};

export const editComment = async (req, res) => {
    const { id } = req.params;
    const authorId = req.userId;
    const { text } = req.body;

    try {
        const comment = await updateComment(id, authorId, text);
        return res.status(200).json(comment);
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};

export const removeComment = async (req, res) => {
    const { id } = req.params;
    const authorId = req.userId;

    try {
        await deleteComment(id, authorId);
        return res.status(200).json({ message: 'Commento eliminato con successo' });
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};