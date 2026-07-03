import DomainException from './DomainException.js'
export default class UnauthorizedException extends DomainException{
    status;
    code;
    constructor (message,code){
        super(message);
        this.status= 401;
        this.code= code;
        }
    }
