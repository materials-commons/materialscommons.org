const r = require('./db/r');
const mtime = require('./db/model/mtime');

function* logEvent(next) {
    try {
        switch (this.req.method) {
            case "POST":
                yield logActivityEvent(this.params, this.reqctx.user, 'create');
                break;
            case "PUT":
                yield logActivityEvent(this.params, this.reqctx.user, 'update');
                break;
            case "PATCH":
                yield logActivityEvent(this.params, this.reqctx.user, 'update');
                break;
            case "DELETE":
                // yield logDeleteEvent(this.params);
                break;
        }
    } catch (error) {
        console.log('Error logging event', this.params, error);
    }

    yield next;
}

function* logActivityEvent(params, user, eventType) {
    yield updateMTimesBaseOnParams(params);

    if (!params.project_id) {
        return false;
    }

    let activity = new Activity(params.project_id, user, eventType);
    yield addActivityEvent(activity, params);

    return true;
}

function* addActivityEvent(activity, params) {
    if (params.file_id) {
        yield addFileEvent(activity, params.file_id);
    } else if (params.sample_id) {
        yield addSampleEvent(activity, params.sample_id);
    } else if (params.template_id) {
        yield addProcessTemplateEvent(activity,params.template_id);
    } else if (params.process_id) {
        yield addProcessEvent(activity, params.process_id);
    } else if (params.experiment_id) {
        yield addExperimentEvent(activity, params.experiment_id);
    } else {
        yield addProjectEvent(activity, params.project_id);
    }
}

function* addFileEvent(activity, fileId) {
    yield addEvent('datafiles', fileId, 'file', activity);
}

function* addSampleEvent(activity, sampleId) {
    yield addEvent('samples', sampleId, 'sample', activity);
}

function* addProcessEvent(activity, processId) {
    yield addEvent('processes', processId, 'process', activity);
}

function* addExperimentEvent(activity, experimentId) {
    yield addEvent('experiments', experimentId, 'experiment', activity);
}

function* addProjectEvent(activity, projectId) {
    yield addEvent('projects', projectId, 'project', activity);
}

function* addProcessTemplateEvent(activity, templateId) {
    yield addEvent('templates', templateId, 'process-create', activity);
}

function* addEvent(table, id, itemType, activity) {
    const item = yield r.table(table).get(id);
    activity.itemType(itemType).itemName(item.name).itemId(id);
    yield r.table('events').insert(activity);
}

function* updateMTimesBaseOnParams(params) {
    if (params.project_id) {
        yield mtime.update('projects', params.project_id);
    }

    if (params.experiment_id) {
        yield mtime.update('experiments', params.experiment_id);
    }

    if (params.process_id) {
        yield mtime.update('processes', params.process_id);
    }

    if (params.sample_id) {
        yield mtime.update('samples', params.sample_id);
    }

    if (params.file_id) {
        yield mtime.update('datafiles', params.file_id);
    }

    if (params.directory_id) {
        yield mtime.update('datadirs', params.directory_id);
    }
}

function* logDeleteEvent(params) {
}

class Activity {
    constructor(projectId, user, eventType) {
        this.project_id = projectId;
        this.item_type = '';
        this.item_id = '';
        this.item_name = '';
        this.birthtime = r.now();
        this.event_type = eventType;
        this.user = {
            id: user.id,
            name: user.fullname
        };
    }

    itemType(itemType) {
        this.item_type = itemType;
        return this;
    }

    itemName(itemName) {
        this.item_name = itemName;
        return this;
    }

    itemId(itemId) {
        this.item_id = itemId;
        return this;
    }

    eventType(eventType) {
        this.event_type = eventType;
        return this;
    }
}

module.exports = {
    logEvent
};
