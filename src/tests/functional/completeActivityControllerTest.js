import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../server.js';
import mongoose from 'mongoose';
import CryptoUtils from "../../src/utils/CryptoUtils.js";
import { ObjectId } from "bson";
import { activityStatus } from "../../src/constants/const.js";
import fixturesUtils from "../fixtures/fixturesUtils.js";

const objectId = mongoose.Types.ObjectId;
chai.use(chaiHttp);

describe('Complete activity controller tests', () => {
    afterEach(async () => {
        //sandbox.restore();
        await fixturesUtils.clearDb();
    })

    describe('PATCH complete activity failure', () => {

        it('Should return 400 if activityId is not valid', async () => {
            const user = {
                _id: new ObjectId(),
                name: 'test user'
            };
            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
                .patch('/invalidId/complete')
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(400);
        });

        it('Should return 401 if token is not provided', async () => {
            const activityId = new ObjectId();

            const res = await request.execute(app)
                .patch(`/${activityId}/complete`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 401 if token is not valid', async () => {
            const activityId = new ObjectId();
            const token = 'fake token';

            const res = await request.execute(app)
                .patch(`/${activityId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 404 if activity is not open', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.COMPLETED
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if activity is not open or completed', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.DELETED
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if the user is not the owner of the activity', async () => {
            const firstUser = await fixturesUtils.createUser({}, true);
            const secondUser = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: firstUser._id.toString(),
                status: activityStatus.OPEN
            }, true);

            const token = CryptoUtils.generateToken(secondUser, 86400);

            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if activity does not exists in db', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const token = CryptoUtils.generateToken(user, 86400);
            const fakeActivityId = new ObjectId().toString();

            const res = await request.execute(app)
                .patch(`/${fakeActivityId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });
    });
});

describe('PATCH complete activity success', () => {

    it('Should return 200 ', async () => {
        const user = await fixturesUtils.createUser({}, true);
        const activity = await fixturesUtils.createActivity({ ownerId: user._id.toString() }, true);

        const token = CryptoUtils.generateToken(user, 86400);

        const res = await request.execute(app)
            .patch(`/${activity._id.toString()}/complete`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.status).eq(200);
        expect(res.body.status).eq(activityStatus.COMPLETED);
        expect(res.body._id).eq(activity._id.toString());
        expect(res.body.ownerId).eq(user._id.toString());
    });
});