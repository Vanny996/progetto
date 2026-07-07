import * as chai from 'chai';
const {expect} = chai;
import chaiHttp,{ request} from 'chai-http';
import app from '../../../server.js';
import fixturesUtils from "../fixtures/fixturesUtils.js";
import sinon from "sinon";
import {userStatus} from "../../constants/const.js";
import cryptoUtils from '../../utils/cryptoUtils.js';
import mailService from "../../services/mailService.js";


const sandbox = sinon.createSandbox();
chai.use(chaiHttp);


describe('ADD user controller tests',() => {
    afterEach(async () => {
        sandbox.restore();
        await fixturesUtils.clearDb();
    })

    describe('POST add user failure', () => {
        it('Should return 400 if name is not defined  ', async () => {
            const userData = {
                email: 'test@gmail.com',
                password: 'passwordtest'
            }
            const res = await request.execute(app).post(`/user`).send(userData);
            expect(res.status).eq(400);
        })
        it('Should return 400 if email is not defined  ', async () => {
            const userData = {
                name: 'name tests',
                email: 'email test',
                password: 'passwordtest'
            }
            const res = await request.execute(app).post(`/user`).send(userData);
            expect(res.status).eq(400);
            expect(res.body.message).eq('ValidationError: "email" must be a valid email')
        })
        it('Should return 400 if password is not defined  ', async () => {
            const userData = {
                name: 'name test',
                email: 'test@gmail.com'
            }
            const res = await request.execute(app).post(`/user`).send(userData);
            expect(res.status).eq(400);
        })
        it('Should return 400 if email is not valid  ', async () => {
            const userData = {
                name: 'name tests',
                email: 'email test',
                password: 'passwordtest'
            }
            const res = await request.execute(app).post(`/user`).send(userData);
            expect(res.status).eq(400);
            expect(res.body.message).eq('ValidationError: "email" must be a valid email')
        })
        it('Should return 409 if email already exists  ', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const userData = {
                name: ' name test',
                email: user.email,
                password: 'passwordtest'
            }
            const sendMailStub = sandbox.stub(mailService, 'sendRegistrationMail').resolves();
            const res = await request.execute(app)
                .post(`/user`)
                .send(userData);
            expect(sendMailStub.calledOnce).eq(false);
            expect(res.status).eq(409);
            expect(res.body.error).eq(`Email già registrata`)
        })
        it('Should return 400 if name is too short', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const userData = {
                name: ' n',
                email: 'user@gmail.com',
                password: 'passwordtest'

            }
            const res = await request.execute(app)
                .post(`/user`)
                .send(userData);
            expect(res.status).eq(400);
            expect(res.body.message).eq('ValidationError: "name" length must be at least 3 characters long');
        })
        it('Should return 400 if password is too short', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const userData = {
                name: ' namee',
                email: 'user@gmail.com',
                password: 'pa'

            }
            const res = await request.execute(app)
                .post(`/user`)
                .send(userData);
            expect(res.status).eq(400);
            expect(res.body.message).eq('ValidationError: "password" length must be at least 3 characters long');
        })
        it('Should return 400 if name is too long', async () => {

            const userData = {
                name: 'a'.repeat(260),
                email: 'user@gmail.com',
                password: 'passworddd'

            }
            const res = await request.execute(app)
                .post(`/user`)
                .send(userData);
            expect(res.status).eq(400);
            expect(res.body.message).eq('ValidationError: "name" length must be less than or equal to 256 characters long');

        })
        describe('POST add user success', () => {
            it('Should return 201 and user in status pending ', async () => {
                const userData = {
                    name: 'test name ',
                    email: 'user@gmail.com',
                    password: 'test password'
                }
                const sendMailStub = sandbox.stub(mailService, 'sendRegistrationMail').resolves();

                const res = await request.execute(app).post(`/user`).send(userData);
                expect(res.status).eq(201);
                expect(sendMailStub.calledOnce).eq(true);

                const userInDb = await fixturesUtils.getUserFromDb(res.body._id);
                const expectedHash = cryptoUtils.sha256(userData.password, userInDb.salt);
                expect(userInDb.password).eq(expectedHash);
                expect(userInDb).to.exist;
                expect(userInDb.name).eq(userData.name);
                expect(userInDb.email).eq(userData.email);
                expect(userInDb._id.toString()).eq(res.body._id);
                expect(userInDb.status).to.eq(userStatus.PENDING);
            });
        });
    });
});
describe('login test ', () => {

    afterEach(async () => {
        sandbox.restore();
        await fixturesUtils.clearDb();
    });

    it('Should return 400 if email is not defined', async () => {
        const loginData = {
            password: 'passwordtest'
        };
        const res = await request.execute(app).post('/user/login').send(loginData);
        expect(res.status).eq(400);
    });

    it('Should return 400 if password is not defined', async () => {
        const loginData = {
            email: 'test@gmail.com'
        };
        const res = await request.execute(app).post('/user/login').send(loginData);
        expect(res.status).eq(400);
    });

    it('Should return 401 if user does not exist', async () => {
        const loginData = {
            email: 'nonexistent@gmail.com',
            password: 'passwordtest'
        };
        const res = await request.execute(app).post('/user/login').send(loginData);
        expect(res.status).eq(401);
    });

    it('Should return 401 if password is wrong', async () => {

        const password = 'correctPassword123';
        const user = await fixturesUtils.createUser({email: 'user@gmail.com', password}, true);

        const loginData = {
            email: user.email,
            password: 'wrongPassword456'
        };
        const res = await request.execute(app).post('/user/login').send(loginData);
        expect(res.status).eq(401);
    });

    it('Should return 200 with accessToken, refreshToken, name and id on valid credentials', async () => {
        const password = 'correctPassword123';
        const user = await fixturesUtils.createUser({email: 'user@gmail.com', password}, true);

        const loginData = {
            email: user.email,
            password: password
        };
        const res = await request.execute(app).post('/user/login').send(loginData);

        expect(res.status).eq(200);
        expect(res.body).to.have.property('accessToken');
        expect(res.body).to.have.property('refreshToken');
        expect(res.body).to.have.property('name', user.name);
        expect(res.body).to.have.property('id');
        expect(res.body).to.not.have.property('password');
    });
});
describe('update profile', () => {

    afterEach(async () => {
        sandbox.restore();
        await fixturesUtils.clearDb();
    });

    it('Should return 401 if no authorization header is present', async () => {
        const res = await request.execute(app)
            .put('/user/profile')
            .send({ name: 'Nuovo Nome' });

        expect(res.status).eq(401);
    });

    it('Should return 401 if token is invalid', async () => {
        const res = await request.execute(app)
            .put('/user/profile')
            .set('Authorization', 'Bearer invalidtoken123')
            .send({ name: 'Nuovo Nome' });

        expect(res.status).eq(401);
    });

    it('Should return 400 if name is too short', async () => {
        const user = await fixturesUtils.createUser({}, true);
        const { accessToken } = cryptoUtils.generateTokens(user);

        const res = await request.execute(app)
            .put('/user/profile')
            .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'ab' });

        expect(res.status).eq(400);
    });

    it('Should return 200 and update the name', async () => {
        const user = await fixturesUtils.createUser({}, true);
        const { accessToken } = cryptoUtils.generateTokens(user);

        const res = await request.execute(app)
            .put('/user/profile')
            .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'Nome Aggiornato' });

        expect(res.status).eq(200);
        expect(res.body.name).eq('Nome Aggiornato');
        expect(res.body).to.not.have.property('password');
        expect(res.body).to.not.have.property('salt');

        const userInDb = await fixturesUtils.getUserFromDb(user._id);
        expect(userInDb.name).eq('Nome Aggiornato');
    });

    it('Should return 200 and update the avatar', async () => {
        const user = await fixturesUtils.createUser({}, true);
        const { accessToken } = cryptoUtils.generateTokens(user);

        const res = await request.execute(app)
            .put('/user/profile')
            .set('Authorization', `Bearer ${accessToken}`)
    .send({ avatar: 'https://example.com/new-avatar.png' });

        expect(res.status).eq(200);
        expect(res.body.avatar).eq('https://example.com/new-avatar.png');

        const userInDb = await fixturesUtils.getUserFromDb(user._id);
        expect(userInDb.avatar).eq('https://example.com/new-avatar.png');
    });

    it('Should not allow updating another user\'s profile via req.body id/userId injection', async () => {
        const user = await fixturesUtils.createUser({}, true);
        const otherUser = await fixturesUtils.createUser({ email: 'other@gmail.com' }, true);
        const { accessToken } = cryptoUtils.generateTokens(user);

        await request.execute(app)
            .put('/user/profile')
            .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'Hacked Name', id: otherUser._id, userId: otherUser._id });

        const otherUserInDb = await fixturesUtils.getUserFromDb(otherUser._id);
        expect(otherUserInDb.name).to.not.eq('Hacked Name');
    });
});