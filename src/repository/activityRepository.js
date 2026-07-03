import DomainException from "../exceptions/DomainException.js";
import NotFoundException from "../exceptions/NotFoundException.js";
import MongoInternalExceptions from "../exceptions/MongoInternalExceptions.js";
import  activitySchema from "../schemas/activitySchema.js";
import userSchema from "../schemas/userSchema.js";
import {activityStatus} from "../constants/const.js";

class ActivityRepository {

    async add(content) {
        const res = await activitySchema.create(content).catch((err) => {
            throw new MongoInternalExceptions(`something went wrong: ${err.message}`, err.code)
        });
        return res.toObject();

    };

    async getById(id, userId) {
        const res = await activitySchema.findOne({_id: id, ownerId: userId}).catch((err) => {
            throw new MongoInternalExceptions(`something went wrong: ${err.message}`, err.code)

        });
        if (!res) {
            throw new NotFoundException(`error:activity ${id}not found`)
        }
        return res.toObject()
    }

    async update(id, params, userId) {
        const res = await activitySchema.findOneAndUpdate(
            {_id: id, ownerId: userId},
            params,
            {new: true}
        ).catch((err) => {
            throw new MongoInternalExceptions(`something went wrong: ${err.message}`, err.code);
        });

        return res ? res.toObject() : null;
    }

    async getManyByIds(ids) {
        const query = {
            _id: {$in: ids},
            status: activityStatus.OPEN
        }
        const res = await activitySchema.find(query).catch(err => {
            throw new MongoInternalExceptions(`something went wrong: ${err.message}`, err.code);
        });
        return res.map((item) => item.toObject());

    }

    async completed(id, userId) {
        const res = await activitySchema.findOneAndUpdate({
            _id: id,
            ownerId: userId,
            status: {$in: [activityStatus.OPEN, activityStatus.COMPLETED]}
        }, {status: activityStatus.COMPLETED}, {new: true});

        if (!res) {
            throw new NotFoundException('activity not found');
        }
        return res;
    }

    async open(id, userId) {
        const res = await activitySchema.findOneAndUpdate(
            {_id: id, ownerId: userId, status: {$in: [activityStatus.COMPLETED, activityStatus.OPEN]}},
            {status: activityStatus.OPEN},
            {new: true}
        )
        if (!res) {
            throw new NotFoundException('activity not found');

        }
        return res;

    }

    async archive(id, userId) {
        const res = await activitySchema.findOneAndUpdate(
            {_id: id, ownerId: userId, status: {$in: [activityStatus.COMPLETED, activityStatus.ARCHIVED]}},
            {status: activityStatus.ARCHIVED},
            {new: true}
        )
        if (!res) {
            throw new NotFoundException('activity not found');

        }
        return res.toObject();
    }
}
export default new ActivityRepository();