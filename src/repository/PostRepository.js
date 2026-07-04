import postSchema from "../schemas/postSchema.js";
import tagSchema from "../schemas/tagSchema.js";
import DomainException from "../exceptions/DomainException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import BadRequestException from "../exceptions/BadRequestExceptions.js";
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
}

export default new PostRepository();