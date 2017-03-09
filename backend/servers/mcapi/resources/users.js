const users = require('../db/model/users');
const check = require('../db/model/check');
const schema = require('../schema');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const mailTransport = mailTransportConfig();
const ra = require('./resource-access');
const buildDemoProject = require('../../lib/build-demo-project');
const os = require('os');

function* updateProjectFavorites(next) {
    let attrs = yield parse(this);
    this.body = yield users.updateProjectFavorites(this.reqctx.user.id, this.params.project_id, attrs);
    this.status = status.OK;
    yield next;
}

function* updateUserSettings(next) {
    let args = yield parse(this);
    let errors = yield validateUserSettingsArgs(args, this.reqctx.user.id);
    if (errors != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let settingArgs = {};
        if (args.default_project) {
            settingArgs.default_project = args.default_project;
        }

        if (args.default_experiment) {
            settingArgs.default_experiment = args.default_experiment;
        }

        if (args.fullname) {
            settingArgs.fullname = args.fullname;
        }

        if (args.affiliation) {
            settingArgs.affiliation = args.affiliation;
        }

        let rv = yield users.updateUserSettings(this.reqctx.user.id, settingArgs);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
    }
    yield next;
}

function* validateUserSettingsArgs(args, userId) {
    if (args.default_project) {
        if (!_.isString(args.default_project)) {
            return {error: `Bad argument for default_project`};
        }

        let isValidProject = yield check.userHasProjectAccess(userId, args.default_project);
        if (!isValidProject) {
            return {error: `No such project: ${args.default_project}`};
        }
    }

    if (args.default_experiment) {
        if (!_.isString(args.default_experiment)) {
            return {error: `Bad argument for default_experiment`};
        }

        if (!args.default_project) {
            return {error: `You must specify a default project when setting a default experiment`};
        }

        let experimentInProject = yield check.experimentExistsInProject(args.default_project, args.default_experiment);
        if (!experimentInProject) {
            return {error: `No such experiment ${args.default_experiment} in project ${args.default_project}`};
        }
    }

    if (args.fullname) {
        if (!_.isString(args.fullname)) {
            return {error: `Bad argument for fullname`};
        }
    }

    if (args.affiliation) {
        if (!_.isString(args.affiliation)) {
            return {error: `Bad argument for affiliation`};
        }
    }

    return null;
}

function* createAccount(next) {
    let accountArgs = yield parse(this);
    schema.prepare(schema.userAccountSchema, accountArgs);
    let errors = yield validateCreateAccount(accountArgs);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield users.createUnverifiedAccount(accountArgs);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            let evl = emailValidationLinkToUser(rv.val, accountArgs.site);
            if (evl.error) {
                this.status = status.BAD_REQUEST;
                this.body = evl;
            } else {
                this.body = evl.val;
            }
        }
    }
    yield next;
}

function* resetPasswordGenerateLink(next) {
    let resetArgs = yield parse(this);
    let user = yield users.get(resetArgs.email);
    if (!user) {
        this.status = status.BAD_REQUEST;
        let errorMessage = "No registered user for given email address: " + resetArgs.email + ". Please register anew.";
        this.body = {error: errorMessage};
    } else {
        let userId = user.id;
        let site = resetArgs.site;
        let rv = yield users.createPasswordResetRequest(user);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            schema.prepare(schema.userAccountSchema, user);
            let finalUser = yield users.get(userId);
            let evl = emailResetLinkToUser(finalUser, site);
            if (evl.error) {
                this.status = status.BAD_REQUEST;
                this.body = evl;
            } else {
                this.body = finalUser;
            }
        }
    }
    yield next;
}

function* getUserRegistrationFromUuid(next) {
    let result = yield users.getUserRegistrationFromUuid(this.params.validation_id);
    if (result.error) {
        this.status = status.BAD_REQUEST;
        this.body = result;
    } else {
        this.status = status.OK;
        this.body = result.val;
    }
    yield next;
}

function* getUserForPasswordResetFromUuid(next) {
    let result = yield users.getUserForPasswordResetFromUuid(this.params.validation_id);
    if (result.error) {
        this.status = status.BAD_REQUEST;
        this.body = result;
    } else {
        this.status = status.OK;
        this.body = result.val;
    }
    yield next;
}

function* setUserResetPasswordFlag(next) {
    let result = yield user.clearResetPassword(this.params.user_id);
    if (result.error) {
        this.status = status.BAD_REQUEST;
        this.body = result;
    } else {
        this.status = status.OK;
        this.body = result.val;
    }
    yield next;
}

function* clearUserResetPasswordFlag(next) {
    let result = yield user.clearResetPassword(this.params.user_id);
    if (result.error) {
        this.status = status.BAD_REQUEST;
        this.body = result;
    } else {
        this.status = status.OK;
        this.body = result.val;
    }
    yield next;
}

function* validateCreateAccount(accountArgs) {
    return yield schema.validate(schema.userAccountSchema, accountArgs);
}

function* createDemoProject(next) {
    let userId = this.params.user_id;
    let checkId = this.reqctx.user.id;
    let user = yield users.getUser(userId);
    if ((!this.reqctx.user.isAdmin) && (userId != checkId)) {
        this.status = status.BAD_REQUEST;
        this.body = "Must be admin to create demo project for non-self user: " + userId;
    } else {
        if (! user) {
            this.status = status.BAD_REQUEST;
            this.body = "Unable to create demo project; no user = " + userId;
        } else {
            let apikey = user.apikey;
            let result = yield createDemoProjectRequest(user);
            if (result.error) {
                this.status = status.BAD_REQUEST;
                this.body = result.error;
            } else {
                this.status = status.OK;
                this.body = result.val;
            }
        }
    }
    console.log("In createDemoProject() for " + user.id + ' - ' + this.body);
    yield next;
}

function* createDemoProjectRequest(user){
    let current_dir = process.cwd();
    let parts = current_dir.split('/');
    let last = parts[parts.length-1];

    if ((last != "backend") && (last != "materialscommons.org")) {
        let message = 'Can not create proejct with process running in unexpected base dir: ';
        message = message + current_dir;
        console.log("Build demo project fails - " + message);
        return {error: "Can not create demo project: admin see log"};
    }

    let prefix = current_dir + "/backend/"
    if (last == "backend") {
        prefix = current_dir + "/";
    }

    let ret = yield buildDemoProject.findOrBuildAllParts(user, prefix);

    if (!ret.error) {
        ret.val = "Created project: " + ret.val.project.name;
    }
    return ret;
}

function emailResetLinkToUser(userData, site) {
    var transporter = nodemailer.createTransport(mailTransport);
    var sendTo = userData.id;
    var validationLink = `${process.env.MC_BASE_API_LINK}/rvalidate/${userData.validate_uuid}`;
    if (site === 'mcpub') {
        validationLink = `${process.env.MCPUB_BASE_API_LINK}/rvalidate/${userData.validate_uuid}`
    }
    let emailMsg =
        `You have requested a password reset at Materials Commons reset in the account for this email.
            To complete this process please click on the given link or copy and paste in the url given below.`;
    var plainTextBody = `${emailMsg} Please validate using the following URL: ${validationLink}`;
    var htmlBody = `${emailMsg} Please validate by clicking <a href='${validationLink}'>here</a>  or using the following url: ${validationLink}`;

    var mailOptions = {
        from: process.env.MC_VERIFY_EMAIL,
        to: sendTo,
        subject: 'MaterialCommons - account verification',
        text: plainTextBody,
        html: htmlBody
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return {error: error};
        }
    });

    return {val: userData}
}

function emailValidationLinkToUser(userData, site) {
    var transporter = nodemailer.createTransport(mailTransport);
    var sendTo = userData.id;
    var validationLink = `${process.env.MC_BASE_API_LINK}/validate/${userData.validate_uuid}`;
    if (site === 'mcpub') {
        validationLink = `${process.env.MCPUB_BASE_API_LINK}/validate/${userData.validate_uuid}`
    }
    let emailMsg =
        `Thank you for registering for an account with Materials Commons. To complete the registration
            process please click on the given link or copy and paste in the url given below.`;
    var plainTextBody = `${emailMsg} Please validate using the following URL: ${validationLink}`;
    var htmlBody = `${emailMsg} Please validate by clicking <a href='${validationLink}'>here</a>  or using the following url: ${validationLink}`;

    var mailOptions = {
        from: process.env.MC_VERIFY_EMAIL,
        to: sendTo,
        subject: 'MaterialCommons - account verification',
        text: plainTextBody,
        html: htmlBody
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return {error: error};
        }
    });

    return {val: userData}
}

function mailTransportConfig() {
    if (process.env.MC_SMTP_HOST === 'localhost') {
        return smtpTransport();
    } else {
        return `smtps://${process.env.MC_VERIFY_EMAIL}:${process.env.MC_VERIFY_PASS}@${process.env.MC_SMTP_HOST}`;
    }
}

function createResource(router) {
    router.put('/users/:project_id', ra.validateProjectAccess, updateProjectFavorites);
    router.put('/users', updateUserSettings);
    router.get('/users/validate/:validation_id', getUserRegistrationFromUuid);
    router.get('/users/rvalidate/:validation_id', getUserForPasswordResetFromUuid);
    router.put('/users/:user_id/clear-reset-password', clearUserResetPasswordFlag);
    router.put('/users/:user_id/create_demo_project', createDemoProject);
    router.post('/accounts', createAccount);
    router.post('/accounts/reset', resetPasswordGenerateLink);
}

module.exports = {
    createResource,createDemoProjectRequest
};
