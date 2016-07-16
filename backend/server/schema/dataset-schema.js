module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateDatasetSchema,
        defineUpdateDatasetSchema,
        defineDatasetAuthorSchema
    };

    function defineCreateDatasetSchema() {
        let createDatasetSchema = schema.defineSchema('CreateDataset', {
            title: {
                type: 'string',
                nullable: false
            },
            description: {
                type: 'string',
                nullable: true
            }
        });
        createDatasetSchema.setDefaults({
            description: ''
        });
        createDatasetSchema.validateAsync = promise.promisify(createDatasetSchema.validate);
        return createDatasetSchema;
    }

    function defineDatasetAuthorSchema() {
        let datasetAuthorSchema = schema.defineSchema('DatasetAuthor', {
            lastname: {
                type: 'string',
                nullable: false
            },
            firstname: {
                type: 'string',
                nullable: false
            },

            affiliation: {
                type: 'string',
                nullable: false
            }
        });
        datasetAuthorSchema.setDefaults({});
        datasetAuthorSchema.validateAsync = promise.promisify(datasetAuthorSchema.validate);
        return datasetAuthorSchema;
    }

    function defineUpdateDatasetSchema() {
        let updateDatasetSchema = schema.defineSchema('UpdateDataset', {
            title: {
                type: 'string',
                nullable: true
            },

            institution: {
                type: 'string',
                nullable: true
            },

            authors: {
                type: 'array',
                nullable: true
            },

            publication: {
                nullable: true,

                title: {
                    type: 'string',
                    nullable: true
                },

                abstract: {
                    type: 'string',
                    nullable: true
                },

                link: {
                    type: 'string',
                    nullable: true
                },

                doi: {
                    type: 'string',
                    nullable: true
                }
            },

            embargo_date: {
                type: 'date',
                nullable: true
            },

            doi: {
                type: 'string',
                nullable: true
            },

            description: {
                type: 'string',
                nullable: true
            },

            license: {
                type: 'string',
                nullable: true
            }
        });
        updateDatasetSchema.setDefaults({});
        updateDatasetSchema.validateAsync = promise.promisify(updateDatasetSchema.validate);
        return updateDatasetSchema;
    }
};
