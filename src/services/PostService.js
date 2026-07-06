import postRepo from "../repository/postRepository.js";
import likeRepo from "../repository/likeRepository.js";
import commentRepo from "../repository/commentRepository.js";

export const addPost = async (content, authorId, imagePath) => {
    const tagIds = content.tags ? await postRepo.findOrCreateTags(content.tags) : [];

    const postData = {
        title: content.title,
        content: content.content,
        author: authorId,
        tags: tagIds,
        image: imagePath || null
    };

    return await postRepo.add(postData);
};
export const getPostById = async (id) => {
    const post = await postRepo.getById(id);
    const likesCount = await likeRepo.countByPost(id);
    const commentsCount = await commentRepo.countByPost(id);
    return { ...post, likesCount, commentsCount };
};

export const getAllPosts = async () => {
    const posts = await postRepo.getAll();

    return await Promise.all(posts.map(async (post) => {
        const postObj = post.toObject ? post.toObject() : post;
        const likesCount = await likeRepo.countByPost(post._id);
        const commentsCount = await commentRepo.countByPost(post._id);
        return { ...postObj, likesCount, commentsCount };
    }));
};
export const updatePost = async (id, authorId, updateData) => {
    const dataToUpdate = { ...updateData };

    if (updateData.tags) {
        dataToUpdate.tags = await postRepo.findOrCreateTags(updateData.tags);
    }

    return await postRepo.updatePost(id, authorId, dataToUpdate);
};

export const deletePost = async (id, authorId) => {
    return await postRepo.deletePost(id, authorId);
};