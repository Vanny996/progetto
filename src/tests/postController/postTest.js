import * as chai from 'chai';
const { expect } = chai;
import chaiHttp, { request } from 'chai-http';
import app from "../../../server.js";
import fixturesUtils from "../fixtures/fixturesUtils.js";
import sinon from 'sinon';
import cryptoUtils from "../../utils/cryptoUtils.js";
import tagSchema from "../../schemas/tagSchema.js";
import postSchema from "../../schemas/postSchema.js";

const sandbox = sinon.createSandbox();
chai.use(chaiHttp);

describe.only('Post controller tests', () => {

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
    });
});