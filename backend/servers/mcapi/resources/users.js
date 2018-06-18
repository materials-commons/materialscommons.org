const users = require('../db/model/users');
const projects = require('../db/model/projects');
const check = require('../db/model/check');
const profiles = require('../db/model/user_profiles');
const schema = require('../schema');
const parse = require('co-body');
const status = require('http-status');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const mailTransport = mailTransportConfig();
const ra = require('./resource-access');
const buildDemoProject = require('../build-demo/build-demo-project');
const Mailgen = require('mailgen');

function* updateProjectFavorites(next) {
    let attrs = yield parse(this);
    this.body = yield users.updateProjectFavorites(this.reqctx.user.id, this.params.project_id, attrs);
    this.status = status.OK;
    yield next;
}

function* updateUserSettings(next) {
    let args = yield parse(this);
    let errors = yield validateUserSettingsArgs(args, this.reqctx.user.id);
    if (errors !== null) {
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

        if (args.demo_installed) {
            settingArgs.demo_installed = args.demo_installed;
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

function* getUser(next) {
    let user = users.getUser(this.params.user_id);
    if (!user) {
        this.status = status.BAD_REQUEST;
        this.body = {error: `Failed to retrieve user ${this.param.user_id}`};
    } else if (user.apikey !== this.query.apikey) {
        this.status = status.BAD_REQUEST;
        this.body = {error: `No such user or access denied: ${this.params.user_id}`};
    } else {
        delete user.apikey;
        delete user.admin;
        delete user.password;
        this.body = user;
    }

    yield next;
}

function* getAllUsers(next) {
    let allUsersList = yield users.getAllUsersExternal();
    this.body = {val: allUsersList};
    yield next;
}

function* becomeUser(next) {
    if (!this.reqctx.user.isAdmin) {
        this.status = status.BAD_REQUEST;
        this.body = {error: `You are not allowed to switch to another user`};
    } else {
        let userArgs = yield parse(this);
        let user = yield users.getUser(userArgs.email);
        if (!user) {
            this.status = status.BAD_REQUEST;
            this.body = {error: `Failed to retrieve user ${userArgs.email}`};
        } else {
            delete user.password;
            this.body = user;
        }
    }

    yield next;
}

function* getValueFromProfile(next) {
    let name = this.params.name;
    let userId = this.params.user_id;
    let checkUserId = this.reqctx.user.id;
    if (userId !== checkUserId) {
        this.body = {
            error: 'Current user, ' + checkUserId + ', is not requesting user, ' + userId
        };
        this.status = status.UNAUTHORIZED;
    } else {
        let rv = yield profiles.getFromUserProfile(userId, name);
        if (rv === null) rv = '';
        this.body = {
            val: rv
        };
    }
    yield next;
}

function* updateValueInProfile(next) {
    let name = this.params.name;
    let userId = this.params.user_id;
    let checkUserId = this.reqctx.user.id;
    if (userId !== checkUserId) {
        this.body = {
            error: 'Current user, ' + checkUserId + ', is not requesting user, ' + userId
        };
        this.status = status.UNAUTHORIZED;
    } else {
        let attrs = yield parse(this);
        let value = attrs.value;
        let rv = yield profiles.storeInUserProfile(userId, name, value);
        if (rv === null) rv = '';
        this.body = {
            val: rv
        };
    }
    yield next;
}


function* deleteValueInPreofile(next) {
    let name = this.params.name;
    let userId = this.params.user_id;
    let checkUserId = this.reqctx.user.id;
    if (userId !== checkUserId) {
        this.body = {
            error: 'Current user, ' + checkUserId + ', is not requesting user, ' + userId
        };
        this.status = status.UNAUTHORIZED;
    } else {
        let rv = yield profiles.clearFromUserProfile(userId, name);
        if (rv === null) rv = '';
        this.body = {
            val: rv
        };
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
            this.body = rv.val;
            // let evl = emailValidationLinkToUser(rv.val, accountArgs.site);
            // if (evl.error) {
            //     this.status = status.BAD_REQUEST;
            //     this.body = evl;
            // } else {
            //     this.body = evl.val;
            // }
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
    if ((!this.reqctx.user.isAdmin) && (userId !== checkId)) {
        this.status = status.BAD_REQUEST;
        this.body = "Must be admin to create demo project for non-self user: " + userId;
    } else {
        if (!user) {
            this.status = status.BAD_REQUEST;
            this.body = "Unable to create demo project; no user = " + userId;
        } else {
            let result = yield createDemoProjectRequest(user);
            if (result.error) {
                this.status = status.BAD_REQUEST;
                this.body = result.error;
            } else {
                yield users.updateUserSettings(userId, {demo_installed: true});
                this.status = status.OK;
                this.body = result.val;
            }
        }
    }
    yield next;
}

function* createDemoProjectRequest(user) {
    let current_dir = process.cwd();
    let parts = current_dir.split('/');
    let last = parts[parts.length - 1];

    if ((last !== "backend") && (last !== "materialscommons.org")) {
        let message = 'Cannot create project with process running in unexpected base dir: ';
        message = message + current_dir;
        console.log("Build demo project fails - " + message);
        return {error: "Cannot create demo project: admin see log"};
    }

    let prefix = current_dir + "/backend/";
    if (last === "backend") {
        prefix = current_dir + "/";
    }

    let ret = yield buildDemoProject.findOrBuildAllParts(user, prefix);

    if (!ret.error) {
        ret = yield projects.getProject(ret.val.project.id);
    }

    return ret;
}

function emailResetLinkToUser(userData, site) {
    let transporter = nodemailer.createTransport(mailTransport),
        sendTo = userData.id,
        siteLink = site === 'mcpub' ? process.env.MCPUB_BASE_API_LINK : process.env.MC_BASE_API_LINK,
        validationLink = `${process.env.MC_BASE_API_LINK}/rvalidate/${userData.validate_uuid}`,
        mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Materials Commons',
                link: siteLink
            }
        });

    if (site === 'mcpub') {
        validationLink = `${process.env.MCPUB_BASE_API_LINK}/rvalidate/${userData.validate_uuid}`
    }

    let email = {
        body: {
            name: userData.fullname,
            intro: 'You have requsted a password reset for Materials Commons. If you did not make this request please ignore this email.',
            action: {
                instruction: 'To reset your password please click here:',
                button: {
                    color: '#22bc66',
                    text: 'Reset your password',
                    link: validationLink
                }
            },
            outro: `Need help or have questions? Send an email to help@materialscommons.org, we'd love to help!`
        }
    };

    let mailOptions = {
        from: process.env.MC_VERIFY_EMAIL,
        to: sendTo,
        subject: 'Material Commons - Password Reset Request',
        text: mailGenerator.generatePlaintext(email),
        html: mailGenerator.generate(email)
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error) {
        if (error !== null) {
            console.log(error);
        }
        transporter.close();
    });

    return {val: userData}
}

function emailValidationLinkToUser(userData, site) {
    let transporter = nodemailer.createTransport(mailTransport);
    let sendTo = userData.id;
    let siteLink = site === 'mcpub' ? process.env.MCPUB_BASE_API_LINK : process.env.MC_BASE_API_LINK;
    let mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Materials Commons',
            link: siteLink
        }
    });

    let validationLink = `${process.env.MC_BASE_API_LINK}/validate/${userData.validate_uuid}`;
    if (site === 'mcpub') {
        validationLink = `${process.env.MCPUB_BASE_API_LINK}/validate/${userData.validate_uuid}`
    }

    let email = {
        body: {
            name: userData.fullname,
            intro: `Welcome to Materials Commons! We're very excited to have you on board.`,
            action: {
                instructions: 'To complete your registration process please click here:',
                button: {
                    color: '#22bc66',
                    text: 'Confirm your account',
                    link: validationLink
                }
            },
            outro: `Need help or have questions? Send an email to help@materialscommons.org, we'd love to help!`
        }
    };

    let mailOptions = {
        from: process.env.MC_VERIFY_EMAIL,
        to: sendTo,
        subject: 'Welcome to Material Commons - account verification',
        text: mailGenerator.generatePlaintext(email),
        html: mailGenerator.generate(email)
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error) {
        if (error !== null) {
            console.log(error);
        }
        transporter.close();
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
    router.get('/users', getAllUsers);
    router.put('/users', updateUserSettings);
    router.get('/users/:user_id', getUser);
    router.put('/users/:project_id', ra.validateProjectAccess, updateProjectFavorites);
    router.get('/users/:user_id/profiles/:name', getValueFromProfile);
    router.put('/users/:user_id/profiles/:name', updateValueInProfile);
    router.delete('/users/:user_id/profiles/:name', deleteValueInPreofile);
    router.put('/users_become', becomeUser);
    router.get('/users/validate/:validation_id', getUserRegistrationFromUuid);
    router.get('/users/rvalidate/:validation_id', getUserForPasswordResetFromUuid);
    router.put('/users/:user_id/clear-reset-password', clearUserResetPasswordFlag);
    router.put('/users/:user_id/create_demo_project', createDemoProject);
    router.post('/accounts', createAccount);
    router.post('/accounts/reset', resetPasswordGenerateLink);
}

module.exports = {
    createResource, createDemoProjectRequest
};
