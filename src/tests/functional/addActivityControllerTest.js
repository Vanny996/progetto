import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';

import mongoose from 'mongoose';
import CryptoUtils from '../../utils/cryptoUtils.js';
import fixturesUtils from "../fixtures/fixturesUtils.js";

const objectId = mongoose.Types.ObjectId;
chai.use(chaiHttp);

describe('ADD activity controller tests', () => {

    describe('POST add activity success', () => {

        it('Should return 200', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const token = CryptoUtils.generateToken(user, 86400);

            const activityData = {
                name: 'Test Activity',
                description: 'This is a test activity'
            };

            const res = await request.execute(app)
                .post('/activity')
                .set('Authorization', `Bearer ${token}`)
                .send(activityData);

            expect(res.status).eq(200);
        });
    });
});