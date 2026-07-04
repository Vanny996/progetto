import multer from 'multer';
import { addPost, getAllPosts, getPostById, updatePost,deletePost } from "../../services/postservice.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

export const uploadPostImage = multer({ storage }).single('image');

export const createPost = async (req, res) => {
    const authorId = req.userId;
    const content = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const post = await addPost(content, authorId, imagePath);
        return res.status(201).json(post);
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};

export const getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await getPostById(id);
        return res.status(200).json(post);
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};

export const listPosts = async (req, res) => {
    try {
        const posts = await getAllPosts();
        return res.status(200).json(posts);
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};
export const editPost = async (req, res) => {
    const { id } = req.params;
    const authorId = req.userId;
    const updateData = req.body;

    try {
        const post = await updatePost(id, authorId, updateData);
        return res.status(200).json(post);
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};

export const removePost = async (req, res) => {
    const { id } = req.params;
    const authorId = req.userId;

    try {
        await deletePost(id, authorId);
        return res.status(200).json({ message: 'Post eliminato con successo' });
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ message: err.message });
    }
};