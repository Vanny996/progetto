import mailer from 'nodemailer';
import { mailConfig } from '../constants/mailConfig.js';
import mailService from '../services/mailService.js';

const transport = {
    host:'smtp.gmail.com',
    port: 465,
    secure : true,
    auth: {
        user: mailConfig.sender,
        pass: mailConfig.password,
}
};
class MailService {
    async sendRegistrationMail(user) {
        const userId = user._id ? user._id.toString() : user.id;
        const link = `http://localhost:8000/user/${userId}/confirm/${encodeURIComponent(user.registrationToken)}`;
        const mailData = {
            from: ` "todolist service"<${mailConfig.sender}>`,
            to: user.email,
            subject: 'Conferma il tuo indirizzo email',
            text: "Ciao ${user.name}, clicca sul seguente link per confermare: ${link}",
            html: ' '
        }
        return await mailer.createTransport(transport).sendMail(mailData);
    }

    async sendActivityOverdueMail(to, payload) {
        const mailData = {
            from: `"todolist service"<${mailConfig.sender}>`,
            to: to,
            subject: 'ecco la lista delle tue activity scadute',
            text: `Ciao ecco la tua lista delle activity scadute.:${payload.join('\n')}`,
            html: '',
        }
        return await mailer.createTransport(transport).sendMail(mailData);
    }
}
export default new MailService();

