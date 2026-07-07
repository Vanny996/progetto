import cryptoRandomString from 'crypto-random-string';
import * as crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { publicKey, privateKey } from '../constants/const.js'
class CryptoUtils {
    generateRandomCode(length,type){
        return cryptoRandomString({length: length, type: type ||'base64'})
    }
    hashPassword(password){
        const salt = this.generateRandomCode(10)
        return {
            password: this.sha256(password, salt),
            salt: salt
        }
    }
    sha256(value, key){
        return crypto.createHmac('sha256', key).update(value).digest('hex')

    }
    generateToken(user,expiration) {
                return jwt.sign({
                _id: user._id || user.id,
                name: user.name,
                expiration: expiration
            },privateKey,
            {
                expiresIn: expiration,
                algorithm: 'RS256'
            }
        )
    }
    generateTokens(user) {
        return {
            accessToken: this.generateToken(user,86400),
            refreshToken: this.generateToken(user, 7776000)
        }
    }
    verifyToken(token){
        return jwt.verify(token,publicKey, {ignoreExpirations: false, algorithms : ['RS256'] })
    }

}
export default new CryptoUtils();