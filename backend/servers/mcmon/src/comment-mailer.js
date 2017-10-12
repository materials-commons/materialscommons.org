const nodemailer = require('nodemailer');
const mailTransport = mailTransportConfig();

// TODO: this send function has much in common the use user verification emails in mcapi; unify?
// Note: cross-ref - backend/servers/mcapi/resources/users.js emailResetLinkToUser and emailValidationLinkToUser

function mailCommentNotification(userToNotify, textBody) {
	let sendToEmailAddress = userToNotify.id;
	let sendToFullName = userToNotify.fullname;

    let transporter = nodemailer.createTransport(mailTransport);
    let sendTo = '<' + sendToFullName + '>' + sendToEmailAddress

    let mailOptions = {
        from: process.env.MC_VERIFY_EMAIL,
        to: sendTo,
        subject: 'Material Commons - Comment Notification',
        text: textBody
    };

    console.log("Would send mail", sendTo, textBody);
    // send mail with defined transport object
//    transporter.sendMail(mailOptions, function (error) {
//        if (error !== null) {
//            console.log(error);
//        }
//        transporter.close();
//    });

}


module.exports = {
    mailCommentNotification
};

function mailTransportConfig() {
    if (process.env.MC_SMTP_HOST === 'localhost') {
        return smtpTransport();
    } else {
        return `smtps://${process.env.MC_VERIFY_EMAIL}:${process.env.MC_VERIFY_PASS}@${process.env.MC_SMTP_HOST}`;
    }
}


