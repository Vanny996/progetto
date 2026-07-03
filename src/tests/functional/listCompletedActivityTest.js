import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import mongoose from 'mongoose';
import CryptoUtils from "../../utils/cryptoUtils.js";
import { ObjectId } from "bson";
import {activityStatus} from "../../constants/const.js";
import fixturesUtils from "../fixtures/fixturesUtils.js";
describe('list activity controller tests', () => {
    describe('GET list activity failure', () => {

        it('Should return 401 if token is not provided', async () => {
            const activityId = new objectId();
            const res = await request.execute(app).get(`/`).send();
            expect(res.status).eq(401);
        })
        it('Should return 401 if token is not valid', async () => {
            const activityId = new objectId();
            const token = 'fake token';
            const res = await request.execute(app).get(`/completed`).set('Authorization', `Bearer ${token}`).send();
            expect(res.status).eq(401);
        })

    });

    describe('GET list activity success ', () => {
        it('Should return 200 with 1 activity in status completed', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity1 = await fixturesUtils.createActivity({
                ownerId: user._id.toString()}, true);
            const activity2 = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.COMPLETED
            }, true);


            const token = CryptoUtils.generateToken(user, 86400)
            const res = await request.execute(app).get(`/`).set('Authorization', `Bearer ${token}`).send();nn

            expect(res.status).eq(200);
            expect(res.body).lenght(1);
            expect(res.body[0]._id).eq(activity1._id.toString());
            expect(res.body[0].ownerId).eq(user._id.toString());
            expect(res.body[0].status).eq(activityStatus.COMPLETED);
        })
    })
})