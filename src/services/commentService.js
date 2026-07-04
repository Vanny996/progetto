import commentRepo from "../repository/commentRepository.js";

export const addComment = async (postId, authorId, text) => {
    return await commentRepo.add(postId, authorId, text);
};

export const updateComment = async (id, authorId, text) => {
    return await commentRepo.update(id, authorId, text);
};

export const deleteComment = async (id, authorId) => {
    return await commentRepo.delete(id, authorId);
};