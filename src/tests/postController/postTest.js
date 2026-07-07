import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from "../../../server.js";
import fixturesUtils from "../fixtures/fixturesUtils.js";
import sinon from 'sinon';
import cryptoUtils from "../../utils/cryptoUtils.js";
import tagSchema from "../../schemas/tagSchema.js";
import postSchema from "../../schemas/postSchema.js";
import likeSchema from "../../schemas/likeSchema.js";
import commentSchema from "../../schemas/commentSchema.js";

const sandbox = sinon.createSandbox();
chai.use(chaiHttp);

describe('Post controller tests', () => {

    afterEach(async () => {
        sandbox.restore();
        await fixturesUtils.clearDb();
    });

    describe('POST /post', () => {
        it('Should return 401 if no authorization header is present', async () => {
            const res = await request.execute(app)
                .post('/post')
                .send({ title: 'Titolo test', content: 'Contenuto test' });

            expect(res.status).eq(401);
        });

        it('Should return 400 if title is missing', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);

            const res = await request.execute(app)
                .post('/post')
                .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Contenuto senza titolo' });

            expect(res.status).eq(400);
        });

        it('Should return 201 and create the post with author and tags', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);

            const res = await request.execute(app)
                .post('/post')
                .set('Authorization', `Bearer ${accessToken}`)
        .send({
                title: 'Il mio primo post',
                content: 'Contenuto del post di prova',
                tags: ['javascript', 'nodejs']
            });

            expect(res.status).eq(201);
            expect(res.body.title).eq('Il mio primo post');
            expect(res.body.tags).to.have.lengthOf(2);
            expect(res.body.author._id.toString()).eq(user._id.toString());

            const tagsInDb = await tagSchema.find({ name: { $in: ['javascript', 'nodejs'] } });
            expect(tagsInDb).to.have.lengthOf(2);
        });

        it('Should reuse an existing tag instead of creating a duplicate', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const existingTag = await tagSchema.create({ name: 'javascript' });

            const res = await request.execute(app)
                .post('/post')
                .set('Authorization', `Bearer ${accessToken}`)
        .send({
                title: 'Secondo post',
                content: 'Altro contenuto',
                tags: ['javascript']
            });

            expect(res.status).eq(201);

            const tagsInDb = await tagSchema.find({ name: 'javascript' });
            expect(tagsInDb).to.have.lengthOf(1);
            expect(tagsInDb[0]._id.toString()).eq(existingTag._id.toString());
        });
    });

    describe('GET /post', () => {
        it('Should return 200 and the list of posts even without authentication', async () => {
            const user = await fixturesUtils.createUser({}, true);
            await postSchema.create({
                title: 'Post pubblico',
                content: 'Visibile a tutti',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app).get('/post');

            expect(res.status).eq(200);
            expect(res.body).to.have.lengthOf(1);
        });

        it('Should include likesCount and commentsCount for each post in the list', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post nella lista',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });
            await likeSchema.create({ user: user._id, post: post._id });

            const res = await request.execute(app).get('/post');

            expect(res.status).eq(200);
            expect(res.body[0].likesCount).eq(1);
            expect(res.body[0].commentsCount).eq(0);
        });
    });

    describe('GET /post/:id', () => {
        it('Should return 200 and the post details even without authentication', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post dettaglio',
                content: 'Contenuto dettaglio',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app).get(`/post/${post._id}`);

            expect(res.status).eq(200);
            expect(res.body.title).eq('Post dettaglio');
        });

        it('Should return 404 if post does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request.execute(app).get(`/post/${fakeId}`);

            expect(res.status).eq(404);
        });

    });
    describe('GET /post/:id', () => {
        it('Should return 200 and the post details even without authentication', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post dettaglio',
                content: 'Contenuto dettaglio',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app).get(`/post/${post._id}`);

            expect(res.status).eq(200);
            expect(res.body.title).eq('Post dettaglio');
        });

        it('Should return 404 if post does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request.execute(app).get(`/post/${fakeId}`);

            expect(res.status).eq(404);
        });

        it('Should return 400 if id format is invalid', async () => {
            const res = await request.execute(app).get('/post/questo-non-e-un-id-valido');

            expect(res.status).eq(400);
        });
        it('Should include likesCount and commentsCount, both 0 for a post with no interactions', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post senza interazioni',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app).get(`/post/${post._id}`);

            expect(res.status).eq(200);
            expect(res.body.likesCount).eq(0);
            expect(res.body.commentsCount).eq(0);
        });

        it('Should include correct likesCount and commentsCount after interactions', async () => {
            const author = await fixturesUtils.createUser({ email: 'countauthor@gmail.com' }, true);
            const liker = await fixturesUtils.createUser({ email: 'countliker@gmail.com' }, true);

            const post = await postSchema.create({
                title: 'Post con interazioni',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });

            await likeSchema.create({ user: liker._id, post: post._id });
            await commentSchema.create({ text: 'Primo commento', author: liker._id, post: post._id });
            await commentSchema.create({ text: 'Secondo commento', author: author._id, post: post._id });

            const res = await request.execute(app).get(`/post/${post._id}`);

            expect(res.status).eq(200);
            expect(res.body.likesCount).eq(1);
            expect(res.body.commentsCount).eq(2);
        });

    });
    describe('PUT /post/:id', () => {
        it('Should return 401 if no authorization header is present', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post originale',
                content: 'Contenuto originale',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app)
                .put(`/post/${post._id}`)
        .send({ title: 'Nuovo titolo' });

            expect(res.status).eq(401);
        });

        it('Should return 200 and update the post if the user is the author', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const post = await postSchema.create({
                title: 'Post originale',
                content: 'Contenuto originale',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app)
                .put(`/post/${post._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Titolo aggiornato' });

            expect(res.status).eq(200);
            expect(res.body.title).eq('Titolo aggiornato');

            const postInDb = await postSchema.findById(post._id);
            expect(postInDb.title).eq('Titolo aggiornato');
        });

        it('Should return 403 if the user is not the author of the post', async () => {
            const author = await fixturesUtils.createUser({ email: 'author@gmail.com' }, true);
            const otherUser = await fixturesUtils.createUser({ email: 'other@gmail.com' }, true);
            const { accessToken } = cryptoUtils.generateTokens(otherUser);

            const post = await postSchema.create({
                title: 'Post di author',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });

            const res = await request.execute(app)
                .put(`/post/${post._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Tentativo di modifica' });

            expect(res.status).eq(403);

            const postInDb = await postSchema.findById(post._id);
            expect(postInDb.title).eq('Post di author');
        });

        it('Should return 404 if the post does not exist', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request.execute(app)
                .put(`/post/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Non importa' });

            expect(res.status).eq(404);
        });
    });

    describe('DELETE /post/:id', () => {
        it('Should return 401 if no authorization header is present', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const post = await postSchema.create({
                title: 'Post da eliminare',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app).delete(`/post/${post._id}`);

            expect(res.status).eq(401);
        });

        it('Should return 200 and delete the post if the user is the author', async () => {
            const user = await fixturesUtils.createUser({}, true);
            const { accessToken } = cryptoUtils.generateTokens(user);
            const post = await postSchema.create({
                title: 'Post da eliminare',
                content: 'Contenuto',
                author: user._id,
                tags: []
            });

            const res = await request.execute(app)
                .delete(`/post/${post._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(200);

            const postInDb = await postSchema.findById(post._id);
            expect(postInDb).to.be.null;
        });

        it('Should return 403 if the user is not the author of the post', async () => {
            const author = await fixturesUtils.createUser({ email: 'author2@gmail.com' }, true);
            const otherUser = await fixturesUtils.createUser({ email: 'other2@gmail.com' }, true);
            const { accessToken } = cryptoUtils.generateTokens(otherUser);

            const post = await postSchema.create({
                title: 'Post protetto',
                content: 'Contenuto',
                author: author._id,
                tags: []
            });

            const res = await request.execute(app)
                .delete(`/post/${post._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).eq(403);

            const postInDb = await postSchema.findById(post._id);
            expect(postInDb).to.not.be.null;
        });
    });
});