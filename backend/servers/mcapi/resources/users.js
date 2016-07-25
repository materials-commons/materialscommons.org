module.exports = function(users, experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');

    return {
        updateProjectFavorites,
        updateUserSettings,
        createAccount,
        getUserRegistrationFromUuid,
        updatePassword
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
                let evl = yield emailValidationLink(rv.val);
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
        let verifyArgs = yield parse(this);
        console.log("getUserDataForVerifyFromUuid: " + verifyArgs.uuid);
        verifyArgs.uuid = '07c9404b-7bef-4183-820b-2b3c7524e3ac';
        console.log("getUserDataForVerifyFromUuid - faking UUID " + verifyArgs.uuid);
        let result = yield users.getUserRegistrationFromUuid(verifyArgs.uuid);
        if (result.error) {
            this.status = status.BAD_REQUEST;
            this.body = result;
        } else {
            this.status = status.OK;
            this.body = result.val;
        }
        yield next;
    }

    function* setUserFromRegistration(next) {
        let verifyArgs = yield parse(this);
        console.log("setUserFromRegistration: " + verifyArgs.id + "," + verifyArgs.password);
        verifyArgs.id = 'terry.weymouth@gmail.com';
        verifyArgs.password = 'fizzbuzz';
        console.log("setUserFromRegistration - faking data "  + verifyArgs.id + "," + verifyArgs.password);
        let result = yield users.setUserFromRegistration(verifyArgs.id,verifyArgs.pasword);
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

    function* emailValidationLink(userData) {
        var nodemailer = require('nodemailer');

        var fromEmailAddress = process.env.MC_VERIFY_EMAIL;
        var fromEmailPass = process.env.MC_VERIFY_PASS;
        var mailURL = 'smtps://' + fromEmailAddress + ':' + fromEmailPass + '@smtp.gmail.com';
        console.log(mailURL);
        var transporter = nodemailer.createTransport(mailURL);

        var sendTo = userData.id;
        var validationLink = "http://mctest.localhost/#/validate/" + userData.validate_uuid;
        var planTextBody = "Validate with the URL: " + validationLink;
        var htmlBody = "Validate with <a href='" + validationLink + "'>this<a/> link: " + validationLink;

        var mailOptions = {
            from: fromEmailAddress,
            to: sendTo,
            subject: 'MaterialCommons - login verification',
            text: planTextBody,
            html: htmlBody
        };

        console.log("emailValidation: " + sendTo);

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log('Send error: ' + error);
                return error;
            }
            console.log('Message sent: ' + info.response);
        });

        return {val: userData}
    }

};
