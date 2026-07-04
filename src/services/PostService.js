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