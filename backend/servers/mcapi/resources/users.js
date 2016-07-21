module.exports = function(users, experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');

    return {
        updateProjectFavorites,
        updateUserSettings,
        createAccount
    };

    function* updateProjectFavorites(next) {
        let attrs = yield parse(this);
        this.body = yield users.updateProjectFavorites(this.reqctx.user.id, this.params.project_id, attrs);
        this.status = 200;
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
            }
        }
        yield next;
    }

    function* validateCreateAccount(accountArgs) {
        return yield schema.validate(schema.userAccountSchema, accountArgs);
    }
};
