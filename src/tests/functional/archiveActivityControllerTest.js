import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../server.js';
import mongoose from 'mongoose';
import CryptoUtils from "../../src/utils/CryptoUtils.js";
import { ObjectId } from "bson";
import { activityStatus } from "../../src/constants/const.js";
import fixturesUtils from "../fixtures/fixturesUtils.js";
import {archive} from "../../src/controllers/activityControllers/archiveActivitiesController.js";



const objectId = mongoose.Types.ObjectId;
chai.use(chaiHttp);

describe('Archive activity controller tests', () => {
    afterEach(async () => {
        console.log("after Each");
        await fixturesUtils.clearDb();
    });

    describe('PATCH archive activity failure', () => {

        it('Should return 400 if activityId is not valid', async () => {

            const user = {
                _id: new ObjectId(),
                name: 'test name'
            };
            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
                .patch(`/invalidId/archive`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(400);
        });

        it('Should return 401 if token is not provided', async () => {
            const activityId = new ObjectId();
            const res = await request.execute(app)
                .patch(`/${activityId}/archive`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 401 if token is not valid', async () => {
            const activityId = new ObjectId();
            const token = 'fake token ';

            const res = await request.execute(app)
                .patch(`/${activityId}/archive`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 404 if activity does not exists in db ', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const token = CryptoUtils.generateToken(user, 86400);

            const fakeActivityId = new ObjectId().toString();

            const res = await request.execute(app)
                .patch(`/${fakeActivityId}/archive`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if the activity is not completed or archive', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.OPEN
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/archive`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if the user is not owner of the activity', async () => {
            console.log("creo primo utente");
            const user = {
                _id: new ObjectId(),
                name: 'test name',
                email: 'adasdas@asdasd.com',
                password: 'password'

            };
            const firstUser = await fixturesUtils.createUser(user, true);
            console.log("creo secondo utente");
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
                .patch(`/${activity._id.toString()}/archive`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });

        it('Should return 404 if activity is deleted', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.DELETED
            }, true);

            //const token = CryptoUtils.generateToken(user, 86400);

            const token = CryptoUtils.generateToken({ _id: user._id.toString(), id: user._id.toString(), name: user._id.toString() }, 86400);
            const res = await request.execute(app)
                .patch(`/${activity._id.toString()}/archive`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });
    });

    describe('PATCH archive activity success', () => {

        it('Should return 200 ', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                owner: user._id,
                status: activityStatus.COMPLETED
            }, true);
            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
               //.patch(`/activities/${activity._id.toString()}/archive`)
                .patch(`/${activity._id.toString()}/archive`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(200);
            expect(res.body.status).eq(activityStatus.ARCHIVED);
            expect(res.body._id).eq(activity._id.toString());
            expect(res.body.ownerId).eq(user._id.toString());
        });
    });
});