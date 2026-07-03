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

describe('Update activity controller tests', () => {
    afterEach(async () => {
        //sandbox.restore();
        await fixturesUtils.clearDb();
    })

    describe('PATCH update activity failure', () => {

        it('Should return 400 if activityId is not valid', async () => {
            const user = {
                _id: new ObjectId(),
                name: 'test user'
            };
            const token = CryptoUtils.generateToken(user, 86400);


            const invalidActivityId = 'id-non-valido-123';

            const res = await request.execute(app)
                .patch(`/activity/${invalidActivityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(400);
        });
        it('Should return 401 if token is not provided', async () => {
            const activityId = new ObjectId();

            const res = await request.execute(app)
                .patch(`/activity/${activityId}`)
                .send();

            expect(res.status).eq(401);
        });
        it('Should return 400 if body data is invalid (e.g. name is empty)', async () => {
            const user = await fixturesUtils.createUser({email: 'bodyval@test.com'}, true);
            const activity = await fixturesUtils.createActivity({ownerId: user._id.toString()}, true);
            const token = CryptoUtils.generateToken(user, 86400);

            // Invia un payload palesemente errato (es. name vuoto se è richiesto dal validatore)
            const invalidActivityData = {
                name: ''
            };

            const res = await request.execute(app)
                .patch(`/activity/${activity._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send(invalidActivityData);

            expect(res.status).eq(400);
        });

        it('Should return 401 if token is not valid', async () => {
            const activityId = new ObjectId();
            const token = 'fake token';

            const res = await request.execute(app)
                .patch(`/activity/${activityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(401);
        });

        it('Should return 404 if the user is not the owner of the activity', async () => {
            const firstUser = await fixturesUtils.createUser({email: 'mailr@test.com'}, true);
            const secondUser = await fixturesUtils.createUser({email: 'notmailr@test.com'}, true);

            const activity = await fixturesUtils.createActivity({
                ownerId: firstUser._id.toString(),
                status: activityStatus.OPEN
            }, true);

            const token = CryptoUtils.generateToken(secondUser, 86400);

            const res = await request.execute(app)
                .patch(`/activity/${activity._id.toString()}`)
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
                .patch(`/activity/${fakeActivityId}`)
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(res.status).eq(404);
            expect(res.body.message).to.eq(`activity not found`);
        });
    });
  })