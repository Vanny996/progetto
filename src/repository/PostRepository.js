import postSchema from "../schemas/postSchema.js";
import tagSchema from "../schemas/tagSchema.js";
import DomainException from "../exceptions/DomainException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import BadRequestException from "../exceptions/BadRequestExceptions.js";
import ForbiddenException from "../exceptions/ForbiddenExceptions.js";
import mongoose from "mongoose";

class PostRepository {

    async findOrCreateTags(tagNames = []) {
        const tagIds = [];
        for (const rawName of tagNames) {
            const name = rawName.trim().toLowerCase();
            let tag = await tagSchema.findOne({ name });
            if (!tag) {
                tag = await tagSchema.create({ name });
            }
            tagIds.push(tag._id);
        }
        return tagIds;
    }

    async add(content) {
        try {
            const res = await postSchema.create(content);
            return await res.populate(['tags', 'author']);
        } catch (err) {
            throw new DomainException(`Errore durante la creazione del post: ${err.message}`);
        }
    }
    async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Id del post non valido');
    }

    const res = await postSchema.findById(id).populate(['tags', 'author']).catch((err) => {
        throw new DomainException(`Errore durante il recupero del post: ${err.message}`);
    });

    if (!res) {
        throw new NotFoundException('Post non trovato');
    }
    return res.toObject();
}
    async getAll() {
        return await postSchema.find().populate(['tags', 'author']).sort({ publishedAt: -1 });
    }
    async findOwnedPostOrThrow(id, authorId) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Id del post non valido');
        }

        const post = await postSchema.findById(id).catch((err) => {
            throw new DomainException(`Errore durante il recupero del post: ${err.message}`);
        });

        if (!post) {
            throw new NotFoundException('Post non trovato');
        }

        if (post.author.toString() !== authorId.toString()) {
            throw new ForbiddenException('Non sei autorizzato a modificare questo post');
        }

        return post;
    }

    async updatePost(id, authorId, updateData) {
        const post = await this.findOwnedPostOrThrow(id, authorId);

        Object.assign(post, updateData);

        const saved = await post.save().catch((err) => {
            throw new DomainException(`Errore durante l'aggiornamento del post: ${err.message}`);
        });

        return await saved.populate(['tags', 'author']);
    }

    async deletePost(id, authorId) {
        const post = await this.findOwnedPostOrThrow(id, authorId);

        await post.deleteOne().catch((err) => {
            throw new DomainException(`Errore durante l'eliminazione del post: ${err.message}`);
        });

        return post.toObject();
    }
}

export default new PostRepository();