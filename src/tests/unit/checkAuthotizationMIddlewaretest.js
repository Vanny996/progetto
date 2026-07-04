import * as chai from 'chai';
import sinon from 'sinon';
import checkAuthorizationMiddleware from "../../middlewares/checkAuthorizationMiddleware.js";
import cryptoUtils from "../../utils/cryptoUtils.js";

const { expect } = chai;
const sandbox = sinon.createSandbox();

describe('checkAuthorization middleware', () => {

    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: sandbox.stub().returnsThis(),
            send: sandbox.stub().returnsThis()
        };
        next = sandbox.stub();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('Should return 401 "Unauthorized 1" if no authorization header is present', async () => {
        await checkAuthorizationMiddleware(req, res, next);

        expect(res.status.calledWith(401)).eq(true);
        expect(res.send.calledWith('Unauthorized 1')).eq(true);
        expect(next.called).eq(false);
    });

    it('Should return 401 "Unauthorized 2" if token is invalid (verifyToken returns falsy)', async () => {
        req.headers.authorization = 'Bearer invalidtoken';
        sandbox.stub(cryptoUtils, 'verifyToken').returns(null);

        await checkAuthorizationMiddleware(req, res, next);

        expect(res.status.calledWith(401)).eq(true);
        expect(res.send.calledWith('Unauthorized 2')).eq(true);
        expect(next.called).eq(false);
    });

    it('Should return 401 "Unauthorized 3" if verifyToken throws (e.g. expired/malformed token)', async () => {
        req.headers.authorization = 'Bearer malformedtoken';
        sandbox.stub(cryptoUtils, 'verifyToken').throws(new Error('jwt malformed'));

        await checkAuthorizationMiddleware(req, res, next);

        expect(res.status.calledWith(401)).eq(true);
        expect(res.send.calledWith('Unauthorized 3')).eq(true);
        expect(next.called).eq(false);
    });

    it('Should set req.userId and call next() if token is valid', async () => {
        req.headers.authorization = 'Bearer validtoken';
        sandbox.stub(cryptoUtils, 'verifyToken').returns({ _id: 'user123' });

        await checkAuthorizationMiddleware(req, res, next);

        expect(req.userId).eq('user123');
        expect(next.calledOnce).eq(true);
        expect(res.status.called).eq(false);
    });
});