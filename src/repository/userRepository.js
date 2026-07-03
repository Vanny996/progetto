import  userSchema from "../schemas/userSchema.js";
import UnauthorizedException from '../exceptions/UnauthorizedException.js';
import{ userStatus} from '../constants/const.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import DomainException from '../exceptions/DomainException.js';
import MongoInternalExceptions from "../exceptions/MongoInternalExceptions.js";


class userRepository {


    async add(content) {
        try {
            const res = await userSchema.create(content);
            return res.toObject({ virtual: true });
        } catch (err) {
            if (err.code === 11000) {
                throw new MongoInternalExceptions(`Qualcosa è andato storto: ${err.message}`);
            }
            throw new MongoInternalExceptions(`errore: ${err.message}`);
        }
    }

    async findByEmail(email) {
        const res = await userSchema.findOne({ email }).catch((err) => {
            throw new DomainException(`Errore durante la ricerca email`);
        });

        if (!res) {
            throw new UnauthorizedException(`Credenziali non valide o utente inesistente`);
        }
        return res.toObject();
    }


    async getByIdAndToken(id, token) {
        const res = await userSchema.findOneAndUpdate(
            { _id: id, registrationToken: token },
            { status: userStatus.ACTIVE, registrationToken: null },
            { new: true }
        ).catch((err) => {
            throw new NotFoundException(`Token not found`);
        });

        if (!res) {
            throw new NotFoundException(`Token not found`);
        }
        return res.toObject();
    }


    async updateProfile(id, updateData) {
        const res = await userSchema.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).catch((err) => {
            throw new DomainException(`Errore durante l\'aggiornamento del profilo`);
        });

        if (!res) {
            throw new NotFoundException(`Utente non trovato`);
        }
        return res.toObject();
    }
}

export default new userRepository();