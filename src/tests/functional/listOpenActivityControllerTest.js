import { getActivities} from "../../src/services/activityService.js";
import {request} from "chai-http";
import app from "../../server.js";
import fixturesUtils   from "../fixtures/fixturesUtils.js";
import {activityStatus} from "../../src/constants/const.js";
import CryptoUtils from "../../src/utils/CryptoUtils.js";

export const listOpen = async (req, res) => {
    try {
        const activities = await getActivities(req.userId);
        res.status(200).json(activities);
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
}

describe('list activity controller tests', () => {
    afterEach(async()=>{
        await fixturesUtils.clearDb();
    })

    describe('GET list activity failure', () => {

        it('Should return 401 if token is not provided', async () => {
            const res = await request.execute(app).get(`/`).send();
            expect(res.status).eq(401);
        });

        it('Should return 401 if token is not valid', async () => {
            const token = 'fake token';
            const res = await request.execute(app).get(`/`).set('Authorization', `Bearer ${token}`).send();
            expect(res.status).eq(401);
        });
    });

    describe('GET list activity success ', () => {

        it('Should return 200 with 1 activity in status open', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const activity1 = await fixturesUtils.createActivity({ ownerId: user._id.toString() }, true);
            await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.COMPLETED
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);
            const res = await request.execute(app).get(`/`).set('Authorization', `Bearer ${token}`).send();

            expect(res.status).eq(200);
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]._id).eq(activity1._id.toString());
            expect(res.body[0].ownerId).eq(user._id.toString());
            expect(res.body[0].status).eq(activityStatus.OPEN);
        });

        it('Should return 200 with 0 activities if the only activity is completed', async () => {
            const user = await fixturesUtils.createUser({}, true);
            await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                status: activityStatus.COMPLETED
            }, true);

            const token = CryptoUtils.generateToken(user, 86400);
            const res = await request.execute(app).get(`/`).set('Authorization', `Bearer ${token}`).send();

            expect(res.status).eq(200);
            expect(res.body).to.have.lengthOf(0);
        });
    });
});