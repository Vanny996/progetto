import DomainException from './DomainException.js'
export default class MongoInternalExceptions extends DomainException{
    status;
    code;
    constructor (message,code){
        super(message);
        this.message = message;
        this.status= 500;
        this.code= code;
        }
    }
