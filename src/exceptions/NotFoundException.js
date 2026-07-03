import DomainException from './DomainException.js'
export default class NotFoundException extends DomainException{
    status;
    code;
    constructor (message,code){
        super(message);
        this.status= 404;
        this.code= code;
        }
    }
