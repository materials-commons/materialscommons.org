const nodemailer = require('nodemailer');
const mailTransport = mailTransportConfig();
const supressSending = true;

let oldTracer = "";
let tracer = "";

// TODO: this send function has much in common the use user verification emails in mcapi; unify?
// Note: cross-ref - backend/servers/mcapi/resources/users.js emailResetLinkToUser and emailValidationLinkToUser

function mailCommentNotification(userToNotify, comment, objectName, author, otherAuthors, verbose=false) {
    if (verbose) {
        tracer = comment.id.substring(0,5);
        if (tracer !== oldTracer) {
            oldTracer = tracer;
            console.log(tracer, "==================" );
        } else {
            console.log(tracer, "--------");
        }
    }
    let textListBody = composeMessage(comment, objectName, author, otherAuthors);
	let sendToEmailAddress = userToNotify.id;
	let sendToFullName = userToNotify.fullname;

    let transporter = nodemailer.createTransport(mailTransport);
    let sendTo = '<' + sendToFullName + '>' + sendToEmailAddress

    let mailOptions = {
        from: process.env.MC_VERIFY_EMAIL,
        to: sendToEmailAddress,
        name: sendToFullName,
        subject: 'Material Commons - Comment Notification',
        text: makeText(textListBody),
        html: makeHtml(textListBody)
    };

    if (!supressSending) {
        if (verbose) {
            console.log(tracer, "Author: ", makeNameForUser(author));
            console.log(tracer, "Sending mail to: ", makeNameForUser(userToNotify));
            console.log(tracer, textListBody[3]);
        }
        transporter.sendMail(mailOptions, function (error) {
            if (error !== null) {
                console.log(tracer, error);
            }
            transporter.close();
        });
    } else {
        if (verbose) {
            console.log(tracer, "Mailing supressed...");
            console.log(tracer, "Author: ", makeNameForUser(author));
            console.log(tracer, "Sending mail to: ", makeNameForUser(userToNotify));
            console.log(tracer, textListBody[3]);
        }
    }
    console.log(tracer, "--------");
}

function composeMessage(comment, objectName, author, otherAuthors){
    let type = comment.item_type;
    let text = comment.text;
    let authorName = makeNameForUser(author);
    let objectAuthorsNames = makeNameLineForOthers(otherAuthors);
    let message = ['Notification of comment in Materials Commons: ',
        'Comment by ' + authorName + " on this object: name = '" + objectName + "' of type = '" + type + "'",
        'Comment: ' + comment.text,
        'Other comments by: ' + objectAuthorsNames,
         '(Note: you received this notification because you previously made a comment on this object)'];
    return message;
}

function makeNameForUser(user) {
    let name = user.fullname;
    if (!name) name = user.id
    if (name !== user.id) {
        name = name + " (" + user.id + ")"
    }
    return name;
}

function makeNameLineForOthers(others) {
    let names = [];
    for (let i = 0; i < others.length; i++) {
        names.push(makeNameForUser(others[i]));
    }
    return names.join(", ");
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

function makeText(textList) {
    let ret = textList[0] + "\n\n";
    let end = textList.length - 1;
    textList.slice(1,end).forEach((line) => {
        ret += '    ' + line + '\n';
    });
    ret += '\n        ' + textList[end];
    return ret;
}

function makeHtml(textList) {
    let ret = '<b>' + textList[0] + '</b><br /><ul>';
    let end = textList.length - 1;
    textList.slice(1,end).forEach((line) => {
        ret += '<li>' + line + '</li>';
    });
    ret += '</ul><br />';
    ret += '<i>' + textList[end] + '</i>';
    return ret
}

