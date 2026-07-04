import postRepo from "../repository/postRepository.js";

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
    return await postRepo.getById(id);
};

export const getAllPosts = async () => {
    return await postRepo.getAll();
};