module.exports = function(users, experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');
    const nodemailer = require('nodemailer');
    const smtpTransport = require('nodemailer-smtp-transport');
    let mailTransport = mailTransportConfig();

    return {
        updateProjectFavorites,
        updateUserSettings,
        createAccount,
        resetPasswordGenerateLink,
        getUserRegistrationFromUuid
    };

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
            let settingArgs = {
                default_project: args.default_project,
                default_experiment: args.default_experiment
            };
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
            let errorMessage = "No registered user for given email address: "+ resetArgs.email + ". Please register anew.";
            this.body = {error: errorMessage};
        } else {
            let rv = yield users.createPasswordResetRequest(user);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                schema.prepare(schema.userAccountSchema, user);
                let evl = emailValidationLinkToUser(rv.val, user.site);
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

    function* getUserRegistrationFromUuid(next) {
        console.log("backend - getUserRegistrationFromUuid")
        let result = yield users.getUserRegistrationFromUuid(this.params.validation_id);
        console.log("results ", result);
        if (result.error) {
            this.status = status.BAD_REQUEST;
            this.body = result;
        } else {
            this.status = status.OK;
            this.body = result.val;
        }
        yield next;
    }

    function* validateUserSettingsArgs(args, userId) {
        if (!args.default_project || !_.isString(args.default_project)) {
            return {error: `Bad argument for default_project`};
        }

        let isValidProject = yield users.userHasProjectAccess(userId, args.default_project);
        if (!isValidProject) {
            return {error: `No such project: ${args.default_project}`};
        }

        if (args.default_experiment && !_.isString(args.default_experiment)) {
            return {error: `Bad argument for default_experiment`};
        }

        if (args.default_experiment) {
            let experimentInProject = yield experiments.experimentExistsInProject(args.default_project, args.default_experiment);
            if (!experimentInProject) {
                return {error: `No such experiment ${args.default_experiment} in project ${args.default_project}`};
            }
        } else {
            args.default_experiment = '';
        }

        return null;
    }

    function* validateCreateAccount(accountArgs) {
        return yield schema.validate(schema.userAccountSchema, accountArgs);
    }

    function emailValidationLinkToUser(userData, site) {
        var transporter = nodemailer.createTransport(mailTransport);
        var sendTo = userData.id;
        var validationLink = `${process.env.MC_VERIFY_LINK}/${userData.validate_uuid}`;
        if (site === 'mcpub') {
            validationLink = `${process.env.MCPUB_VERIFY_LINK}/${userData.validate_uuid}`
        }
        let emailMsg =
            `Thank you for registering for an account with Materials Commons. To complete the registration
            process please click on the given link or copy and paste in the url given below.`;
        var plainTextBody = `${emailMsg} Please validate using the following URL: ${validationLink}`;
        var htmlBody = `${emailMsg} Please validate by clicking <a href='${validationLink}'>here</a>  or using the following link link: ${validationLink}`;

        var mailOptions = {
            from: process.env.MC_VERIFY_EMAIL,
            to: sendTo,
            subject: 'MaterialCommons - account verification',
            text: plainTextBody,
            html: htmlBody
        };

        console.log("emailValidation: " + sendTo);

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log('Send error: ' + error);
                return {error: error};
            }
            console.log('Message sent: ' + info.response);
        });

        return {val: userData}
    }

    function mailTransportConfig() {
        if (process.env.MC_SMTP_HOST === 'localhost') {
            console.log('Email Server - localhost:25');
            return smtpTransport();
        } else {
            let mailURL = `smtps://${process.env.MC_VERIFY_EMAIL}:${process.env.MC_VERIFY_PASS}@${process.env.MC_SMTP_HOST}`;
            console.log(`Email server - ${mailURL}`);
            return mailURL;
        }
    }

};
