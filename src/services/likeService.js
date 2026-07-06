import likeRepo from "../repository/likeRepository.js";

export const toggleLike = async (postId, userId) => {
    const { liked } = await likeRepo.toggle(postId, userId);
    const likesCount = await likeRepo.countByPost(postId);
    return { liked, likesCount };
};