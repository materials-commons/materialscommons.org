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
            },

            site: {
                type: 'string',
                nullable: true
            }
        });
        userAccountSchema.setDefaults({site: 'materialscommons'});
        userAccountSchema.validateAsync = promise.promisify(userAccountSchema.validate);
        return userAccountSchema;
    }
};
