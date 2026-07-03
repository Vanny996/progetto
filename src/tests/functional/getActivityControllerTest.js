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

describe('GET activity controller tests', () => {

    describe('GET activity failure', () => {

        it('Should return 401 if token is not provided', async () => {
            const activityId = new ObjectId().toString();

            const res = await request.execute(app)
                .get(`/activity/${activityId}`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 401 if token is not valid', async () => {
            const activityId = new ObjectId().toString();
            const token = 'fake-token-invalido';

            const res = await request.execute(app)
                .get(`/activity/${activityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 400 if id parameter is not a valid ObjectId', async () => {
            const user = await fixturesUtils.createUser({ email: 'get-invalid-id@test.com' }, true);
            const token = CryptoUtils.generateToken(user, 86400);
            const invalidId = 'id-invalido-123';

            const res = await request.execute(app)
                .get(`/activity/${invalidId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(400);
        });

        it('Should return 404 if activity does not exist in db', async () => {
            const user = await fixturesUtils.createUser({ email: 'get-notfound@test.com' }, true);
            const token = CryptoUtils.generateToken(user, 86400);
            const fakeActivityId = new ObjectId().toString();

            const res = await request.execute(app)
                .get(`/activity/${fakeActivityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
        });

        it('Should return 404 if the user is not the owner of the activity', async () => {
            const ownerUser = await fixturesUtils.createUser({ email: 'get-owner@test.com' }, true);
            const strangerUser = await fixturesUtils.createUser({ email: 'get-stranger@test.com' }, true);

            const activity = await fixturesUtils.createActivity({
                ownerId: ownerUser._id.toString()
            }, true);

            const token = CryptoUtils.generateToken(strangerUser, 86400);

            const res = await request.execute(app)
                .get(`/activity/${activity._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
        });
    });

    describe('GET activity success', () => {

        it('Should return 200 and the activity details if user is the owner', async () => {
            const user = await fixturesUtils.createUser({ email: 'get-success@test.com' }, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                name: 'Studiare i test',
                description: 'Finire i controller test'
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);

            const res = await request.execute(app)
                .get(`/activity/${activity._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(200);
            expect(res.body._id).eq(activity._id.toString());
            expect(res.body.name).eq('Studiare i test');
            expect(res.body.ownerId).eq(user._id.toString());
        });
    });
});