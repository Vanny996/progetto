import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import fixturesUtils from '../fixtures/fixturesUtils.js';
import sinon from 'sinon';
import cryptoUtils from '../../utils/cryptoUtils.js';
import postSchema from '../../schemas/postSchema.js';
import likeSchema from '../../schemas/likeSchema.js';

const sandbox = sinon.createSandbox();
chai.use(chaiHttp);

describe('Like controller tests', () => {

    afterEach(async () => {
        sandbox.restore();
        await fixturesUtils.clearDb();
    });

    describe('POST /post/:postId/like', () => {
        it('Should return 401 if no authorization header is present', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app).post(`/post/${post._id}/like`);

            expect(res.status).eq(401);
        });

        it('Should return 404 if the post does not exist', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request.execute(app)
                .post(`/post/${fakeId}/like`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(404);
        });

        it('Should add a like and return liked: true with updated count', async () => {
            const author = await fixturesUtils.createUser({ email: 'author@gmail.com' }, true);
            const liker = await fixturesUtils.createUser({ email: 'liker@gmail.com' }, true);
            const { accessToken } = cryptoUtils.generateTokens(liker);

            const post = await postSchema.create({
                title: 'Post da likeare',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });

            const res = await request.execute(app)
                .post(`/post/${post._id}/like`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(200);
            expect(res.body.liked).eq(true);
            expect(res.body.likesCount).eq(1);

            const likeInDb = await likeSchema.findOne({ user: liker._id, post: post._id });
            expect(likeInDb).to.exist;
        });

        it('Should remove the like on second call and return liked: false with updated count', async () => {
            const author = await fixturesUtils.createUser({ email: 'author2@gmail.com' }, true);
            const liker = await fixturesUtils.createUser({ email: 'liker2@gmail.com' }, true);
            const { accessToken } = cryptoUtils.generateTokens(liker);

            const post = await postSchema.create({
                title: 'Post da likeare',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });

            await request.execute(app)
                .post(`/post/${post._id}/like`)
                .set('Authorization', `Bearer ${accessToken}`);

            const res = await request.execute(app)
                .post(`/post/${post._id}/like`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(200);
            expect(res.body.liked).eq(false);
            expect(res.body.likesCount).eq(0);

            const likeInDb = await likeSchema.findOne({ user: liker._id, post: post._id });
            expect(likeInDb).to.be.null;
        });

        it('Should enforce a single like per user per post at database level (FR14)', async () => {
            const author = await fixturesUtils.createUser({ email: 'author3@gmail.com' }, true);
            const liker = await fixturesUtils.createUser({ email: 'liker3@gmail.com' }, true);

            const post = await postSchema.create({
                title: 'Post da likeare',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });

            await likeSchema.create({ user: liker._id, post: post._id });

            let duplicateError = null;
            try {
                await likeSchema.create({ user: liker._id, post: post._id });
            } catch (err) {
                duplicateError = err;
            }

            expect(duplicateError).to.exist;
            expect(duplicateError.code).eq(11000);
        });
        it('Should return 400 if postId format is invalid', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);

            const res = await request.execute(app)
                .post('/post/id-non-valido/like')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(400);
        });
    });
});