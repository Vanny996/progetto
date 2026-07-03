import fixturesUtils from "../fixtures/fixturesUtils.js";
import sinon from "sinon";
import mailService from "../../src/services/mailService.js";
import mongoose from "mongoose";
import {expect} from "chai";

const sandbox = sinon.createSandbox();
//const objectId= mongoose.Types.ObjectId();
describe('Scheduler test', () => {
    afterEach(async () => {
        await fixturesUtils.clearDb();
        sandbox.restore();
    });

    describe('Scheduler success test', () => {
        it('Should call mailer when activity dueDate is passed', async () => {

            const user = await fixturesUtils.createUser({}, true);
            const activity = await fixturesUtils.createActivity({
                ownerId: user._id.toString(),
                dueDate: new Date(),
            }, true);


            const job = {
                activityId: activity._id.toString(),
                ownerName: user.name,
                ownerEmail: user.email
            }
            const scheduler = new SchedulerService();
            scheduler.register(job);

            const mailStub = sinon.stub().resolves({
                messageId: '1',
            })

             sandbox.stub(mailer,'createTransport').returns({
                sendMail: mailStub
            })
           await scheduler.exec();

            expect(mailStub.calledOnce).eq(true);
            expect(mailStub.calledWithMatch({
                from:sinon.match.any,
                to:user.email,
                subject:'attività scaduta',
                text: `ciao${job.ownerName}, ti informiamo che la tua attività ${activity.name} è scaduta`,
                html: '',
            })).eq(true);

        })
    })
})
