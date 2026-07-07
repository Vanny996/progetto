import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import fixturesUtils from '../fixtures/fixturesUtils.js';
import sinon from 'sinon';
import cryptoUtils from '../../utils/cryptoUtils.js';
import postSchema from '../../schemas/postSchema.js';
import commentSchema from '../../schemas/commentSchema.js';

const sandbox = sinon.createSandbox();
chai.use(chaiHttp);

describe('Comment controller tests', () => {

    afterEach(async () => {
        sandbox.restore();
        await fixturesUtils.clearDb();
    });

    describe('POST /post/:postId/comment', () => {
        it('Should return 401 if no authorization header is present', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app)
                .post(`/post/${post._id}/comment`)
                .send({ text: 'Bel post!' });

            expect(res.status).eq(401);
        });

        it('Should return 201 and create the comment with author and text', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: user._id,
                tags: [],
            });

            const res = await request.execute(app)
                .post(`/post/${post._id}/comment`)
                .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'Bel post, complimenti!' });

            expect(res.status).eq(201);
            expect(res.body.text).eq('Bel post, complimenti!');
            expect(res.body.author._id.toString()).eq(user._id.toString());

            const commentInDb = await commentSchema.findOne({ post: post._id });
            expect(commentInDb).to.exist;
        });

        it('Should return 404 if the post does not exist', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request.execute(app)
                .post(`/post/${fakeId}/comment`)
                .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'Commento su post inesistente' });

            expect(res.status).eq(404);
        });

        it('Should return 400 if text is missing', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app)
                .post(`/post/${post._id}/comment`)
                .set('Authorization', `Bearer ${accessToken}`)
        .send({});

            expect(res.status).eq(400);
        });
        it('Should return 400 if text is missing when editing a comment', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const post = await postSchema.create({ title: 'Post', content: 'Contenuto', author: user._id, tags: [] });
            const comment = await commentSchema.create({ text: 'Originale', author: user._id, post: post._id });

            const res = await request.execute(app)
                .put(`/comment/${comment._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({});

            expect(res.status).eq(400);
        });

        it('Should return 404 when editing a comment that does not exist', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request.execute(app)
                .put(`/comment/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ text: 'Non importa' });

            expect(res.status).eq(404);
        });
    });

    describe('PUT /comment/:id', () => {
        it('Should return 200 and update the comment if the user is the author', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });
            const comment = await commentSchema.create({
                text: 'Testo originale',
                author: user._id,
                post: post._id
            });

            const res = await request.execute(app)
                .put(`/comment/${comment._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'Testo modificato' });

            expect(res.status).eq(200);
            expect(res.body.text).eq('Testo modificato');
        });

        it('Should return 403 if the user is not the author of the comment', async () => {
            const author = await fixturesUtils.createUser({ email: 'commentauthor@gmail.com' }, true);
            const otherUser = await fixturesUtils.createUser({ email: 'commentother@gmail.com' }, true);
            const { accessToken } = cryptoUtils.generateTokens(otherUser);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });
            const comment = await commentSchema.create({
                text: 'Testo originale',
                author: author._id,
                post: post._id
            });

            const res = await request.execute(app)
                .put(`/comment/${comment._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'Tentativo di modifica' });

            expect(res.status).eq(403);
        });

    });

    describe('DELETE /comment/:id', () => {
        it('Should return 200 and delete the comment if the user is the author', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });
            const comment = await commentSchema.create({
                text: 'Da eliminare',
                author: user._id,
                post: post._id
            });

            const res = await request.execute(app)
                .delete(`/comment/${comment._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(200);

            const commentInDb = await commentSchema.findById(comment._id);
            expect(commentInDb).to.be.null;
        });

        it('Should return 403 if the user is not the author of the comment', async () => {
            const author = await fixturesUtils.createUser({ email: 'delauthor@gmail.com' }, true);
            const otherUser = await fixturesUtils.createUser({ email: 'delother@gmail.com' }, true);
            const { accessToken } = cryptoUtils.generateTokens(otherUser);
            const post = await postSchema.create({
                title: 'Post di prova',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });
            const comment = await commentSchema.create({
                text: 'Protetto',
                author: author._id,
                post: post._id
            });

            const res = await request.execute(app)
                .delete(`/comment/${comment._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(403);

            const commentInDb = await commentSchema.findById(comment._id);
            expect(commentInDb).to.not.be.null;
        });
    });
});