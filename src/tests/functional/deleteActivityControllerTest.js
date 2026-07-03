import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import mongoose from 'mongoose';
import CryptoUtils from "../../utils/cryptoUtils.js";
import { ObjectId } from "bson";
import {activityStatus} from "../../constants/const.js";
import fixturesUtils from "../fixtures/fixturesUtils.js";
chai.use(chaiHttp);

describe('DELETE activity controller tests', () => {

    describe('DELETE remove activity failure', () => {

        it('Should return 401 if token is not provided', async () => {
            const activityId = new ObjectId().toString();

            const res = await request.execute(app)
                .delete(`/activity/${activityId}`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 401 if token is not valid', async () => {
            const activityId = new ObjectId().toString();
            const token = 'fake-token-invalido';

            const res = await request.execute(app)
                .delete(`/activity/${activityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 400 if id parameter is not a valid ObjectId', async () => {
            const user = await fixturesUtils.createUser({ email: 'valid@test.com' }, true);
            const token = CryptoUtils.generateToken(user, 86400);
            const invalidId = '123-id-invalido';

            const res = await request.execute(app)
                .delete(`/activity/${invalidId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(400);
        });

        it('Should return 404 if activity does not exist in db', async () => {
            const user = await fixturesUtils.createUser({ email: 'notfound@test.com' }, true);
            const token = CryptoUtils.generateToken(user, 86400);
            const fakeActivityId = new ObjectId().toString();

            const res = await request.execute(app)
                .delete(`/activity/${fakeActivityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq('activity not found');
        });

        it('Should return 404 if the user is not the owner of the activity', async () => {
            const ownerUser = await fixturesUtils.createUser({ email: 'owner-delete@test.com' }, true);
            const strangerUser = await fixturesUtils.createUser({ email: 'stranger-delete@test.com' }, true);

            const activity = await fixturesUtils.createActivity({
                ownerId: ownerUser._id.toString()
            }, true);

            const token = CryptoUtils.generateToken(strangerUser, 86400);

            const res = await request.execute(app)
                .delete(`/activity/${activity._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq('activity not found');
        });
    });

    describe('DELETE remove activity success', () => {

        it('Should return 200 and delete the activity if user is the owner', async () => {
            const user = await fixturesUtils.createUser({ email: 'success-delete@test.com' }, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString()
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
                .delete(`/activity/${activity._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(200);
            expect(res.body._id).eq(activity._id.toString());
            expect(res.body.status).to.eq('deleted');
        });
    });
})