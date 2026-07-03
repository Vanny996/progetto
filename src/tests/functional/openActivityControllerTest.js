import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import mongoose from 'mongoose';
import CryptoUtils from "../../utils/cryptoUtils.js";
import { ObjectId } from "bson";
import {activityStatus} from "../../constants/const.js";
import fixturesUtils from "../fixtures/fixturesUtils.js";

const objectId = mongoose.Types.ObjectId;
chai.use(chaiHttp);

describe('Open activity controller tests', () => {
    afterEach(async () => {
        await fixturesUtils.clearDb();
    })
    describe('PATCH open activity failure', () => {

        it('Should return 400 if activityId is not valid', async () => {
            const user = {
                _id: new ObjectId(),
                name: 'test user'
            };
            const token = CryptoUtils.generateToken(user, 86400);
            const invalid = "234";
            const res = await request.execute(app)
                .patch(`/${invalid}/open`)
                .set('Authorization', `Bearer ${token}`)
                .send();
            expect(res.status).eq(400);
        });

        it('Should return 401 if token is not provided', async () => {
            const activityId = new objectId();
            const res = await request.execute(app)
                .patch(`/${activityId}/open`)
                .send();
            expect(res.status).eq(401);
        });

        it('Should return 401 if token is not valid', async () => {
            const activityId = new objectId();
            const token = 'fake token';
            const res = await request.execute(app)
                .patch(`/${activityId}/open`)
                .set('Authorization', `Bearer ${token}`)
                .send();
            expect(res.status).eq(401);
        });

        it('Should return 404 if activity is deleted', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.DELETED
            }, true);
            const token = CryptoUtils.generateToken(user, 86400);
            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/open`)
                .set('Authorization', `Bearer ${token}`)
                .send();
            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if the user is not owner of the activity', async () => {
            const user = {
                _id: new ObjectId(),
                name: 'test name',
                email: 'adasdas@asdasd.com',
                password: 'password'

            };
            const firstUser = await fixturesUtils.createUser(user, true);
                        const second = {
                _id: new ObjectId(),
                name: 'test name',
                email: 'ggdfgdfgd@asdasd.com',
                password: 'password'

            };
            const secondUser = await fixturesUtils.createUser(second, true);

            const activity = await fixturesUtils.createActivity({
                ownerId: firstUser._id.toString(),
                status: activityStatus.COMPLETED
            }, true);
            const token = CryptoUtils.generateToken(secondUser, 86400);
            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/open`)
                .set('Authorization', `Bearer ${token}`)
                .send();
            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if activity does not exists in db ', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const token = CryptoUtils.generateToken(user, 86400);
            const fakeActivityId = new objectId().toString();
            const res = await request.execute(app)
                .patch(`/${fakeActivityId}/open`)
                .set('Authorization', `Bearer ${token}`)
                .send();
            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });
    });

    describe('PATCH open activity success', () => {

        it('Should return 200 if activity is completed ', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.COMPLETED
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);
            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/open`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(200);
            expect(res.body.status).eq(activityStatus.OPEN);
            expect(res.body._id).eq(activity._id.toString());
            expect(res.body.ownerId).eq(user._id.toString());
        });

        it('Should return 200 if activity is already opened ', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                owner: user._id.toString(),
                status: activityStatus.OPEN
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);
            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/open`)
                .set('Authorization', `Bearer ${token}`)

                .send();

            expect(res.status).eq(200);
            expect(res.body.status).eq(activityStatus.OPEN);
            expect(res.body._id).eq(activity._id.toString());
            expect(res.body.ownerId).eq(user._id.toString());
        });
    });
});