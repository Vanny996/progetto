import jwtUtils from '../utils/cryptoUtils.js';

export default async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return res.status(401).send('Unauthorized 1');
    }
    const token = authorizationHeader.split(' ')[1];
    try {
        const jwtDecoded = jwtUtils.verifyToken(token);
        if (!jwtDecoded) {
            return res.status(401).send('Unauthorized 2');
        }
                req.userId = jwtDecoded._id || jwtDecoded.id || jwtDecoded.name;

        next();
    } catch (err) {
        return res.status(401).send('Unauthorized 3');

    }
}