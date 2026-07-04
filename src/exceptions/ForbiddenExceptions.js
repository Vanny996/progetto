import DomainException from './DomainException.js';

export default class ForbiddenException extends DomainException {
    status;
    code;
    constructor(message, code) {
        super(message);
        this.status = 403;
        this.code = code;
    }
}