import DomainException from './DomainException.js';

export default class BadRequestException extends DomainException {
    status;
    code;
    constructor(message, code) {
        super(message);
        this.status = 400;
        this.code = code;
    }
}