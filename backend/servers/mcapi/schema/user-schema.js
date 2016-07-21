module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineUserAccountSchema
    };

    function defineUserAccountSchema() {
        let userAccountSchema = schema.defineSchema('UserAccountSchema', {
            fullname: {
                type: 'string',
                nullable: false
            },

            email: {
                type: 'string',
                nullable: false
            }
        });
        userAccountSchema.setDefaults({});
        userAccountSchema.validateAsync = promise.promisify(userAccountSchema.validate);
        return userAccountSchema;
    }
};
