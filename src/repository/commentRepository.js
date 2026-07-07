import mongoose from "mongoose";
import commentSchema from "../schemas/commentSchema.js";
import postSchema from "../schemas/postSchema.js";
import DomainException from "../exceptions/DomainException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import BadRequestException from "../exceptions/BadRequestExceptions.js";
import ForbiddenException from "../exceptions/ForbiddenExceptions.js";

class CommentRepository {

    async add(postId, authorId, text) {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new BadRequestException('Id del post non valido');
        }

        const post = await postSchema.findById(postId);
        if (!post) {
            throw new NotFoundException('Post non trovato');
        }

        const comment = await commentSchema.create({
            text,
            author: authorId,
            post: postId
        }).catch((err) => {
            throw new DomainException(`Errore durante la creazione del commento: ${err.message}`);
        });

        return await comment.populate('author');
    }

    async findOwnedCommentOrThrow(id, authorId) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Id del commento non valido');
        }

        const comment = await commentSchema.findById(id).catch((err) => {
            throw new DomainException(`Errore durante il recupero del commento: ${err.message}`);
        });

        if (!comment) {
            throw new NotFoundException('Commento non trovato');
        }

        if (comment.author.toString() !== authorId.toString()) {
            throw new ForbiddenException('Non sei autorizzato a modificare questo commento');
        }

        return comment;
    }

    async update(id, authorId, text) {
        const comment = await this.findOwnedCommentOrThrow(id, authorId);
        comment.text = text;

        const saved = await comment.save().catch((err) => {
            throw new DomainException(`Errore durante l'aggiornamento del commento: ${err.message}`);
        });

        return await saved.populate('author');
    }

    async delete(id, authorId) {
        const comment = await this.findOwnedCommentOrThrow(id, authorId);

        await comment.deleteOne().catch((err) => {
            throw new DomainException(`Errore durante l'eliminazione del commento: ${err.message}`);
        });

        return comment.toObject();
    }

    async countByPost(postId) {
        return await commentSchema.countDocuments({post: postId});
    }
}

export default new CommentRepository();