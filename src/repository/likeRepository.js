import mongoose from "mongoose";
import likeSchema from "../schemas/likeSchema.js";
import postSchema from "../schemas/postSchema.js";
import DomainException from "../exceptions/DomainException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import BadRequestException from "../exceptions/BadRequestExceptions.js";

class LikeRepository {

    async toggle(postId, userId) {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new BadRequestException('Id del post non valido');
        }

        const post = await postSchema.findById(postId);
        if (!post) {
            throw new NotFoundException('Post non trovato');
        }

        const existingLike = await likeSchema.findOne({ user: userId, post: postId });

        if (existingLike) {
            await existingLike.deleteOne().catch((err) => {
                throw new DomainException(`Errore durante la rimozione del like: ${err.message}`);
            });
            return { liked: false };
        }

        await likeSchema.create({ user: userId, post: postId }).catch((err) => {
            throw new DomainException(`Errore durante l'aggiunta del like: ${err.message}`);
        });
        return { liked: true };
    }

    async countByPost(postId) {
        return await likeSchema.countDocuments({ post: postId });
    }
}

export default new LikeRepository();