const {Action, api} = require('actionhero');
const objectTypes = require('@lib/object-types');

module.exports.SetTagsAction = class SetTagsAction extends Action {
    constructor() {
        super();
        this.name = 'setTags';
        this.description = 'Sets tags on the given object';
        this.inputs = {
            project_id: {
                required: true,
            },

            object_type: {
                required: true,
                validator: param => objectTypes.validate(param)
            },

            object_id: {
                required: true,
            },

            tags: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        await api.mc.check.validateObjectInProjectThrow(params.object_type, params.object_id, params.project_id);
    }
};

module.exports.AddTagsAction = class AddTagsAction extends Action {
    constructor() {
        super();
        this.name = 'addTags';
        this.description = 'Add tags to the given object';
        this.inputs = {
            project_id: {
                required: true,
            },

            object_type: {
                required: true,
                validator: param => objectTypes.validate(param)
            },

            object_id: {
                required: true,
            },

            tags: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        await api.mc.check.validateObjectInProjectThrow(params.object_type, params.object_id, params.project_id);
    }
};

module.exports.RemoveTagsAction = class RemoveTagsAction extends Action {
    constructor() {
        super();
        this.name = 'removeTags';
        this.description = 'Remove tags from the given object';
        this.inputs = {
            project_id: {
                required: true,
            },

            object_type: {
                required: true,
                validator: param => objectTypes.validate(param)
            },

            object_id: {
                required: true,
            },

            tags: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        await api.mc.check.validateObjectInProjectThrow(params.object_type, params.object_id, params.project_id);
    }
};

module.exports.GetTagsAction = class GetTagsAction extends Action {
    constructor() {
        super();
        this.name = 'getTags';
        this.description = 'Get tags for the given object';
        this.inputs = {
            project_id: {
                required: true,
            },

            object_type: {
                required: true,
                validator: param => objectTypes.validate(param)
            },

            object_id: {
                required: true,
            },
        };
    }

    async run({response, params}) {
        await api.mc.check.validateObjectInProjectThrow(params.object_type, params.object_id, params.project_id);
    }
};

module.exports.FindMatchingTagAction = class FindMatchingTagsAction extends Action {
    constructor() {
        super();
        this.name = 'findMatchingTag';
        this.description = 'Finds objects matching tag';
        this.inputs = {
            project_id: {
                required: true,
            },

            object_type: {
                required: true,
                validator: param => objectTypes.validate(param)
            },

            tag: {
                required: true
            }
        };
    }

    async run({response, params}) {
        await api.mc.check.validateObjectInProjectThrow(params.object_type, params.object_id, params.project_id);
    }
};