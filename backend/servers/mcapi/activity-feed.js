const r = require('./db/r');
const mtime = require('./db/model/mtime');

function* logEvent(next) {
    switch (this.req.method) {
        case "POST":
            yield logPostEvent(this.params, this.reqctx.user);
            break;
        case "PUT":
            yield logPutEvent(this.params, this.reqctx.user);
            break;
        case "DELETE":
            // yield logDeleteEvent(this.params);
            break;
    }
    yield next;
}

class Activity {
    constructor(projectId, user) {
        this.project_id = projectId;
        this.item_type = '';
        this.item_id = '';
        this.item_name = '';
        this.birthtime = r.now();
        this.event_type = 'update';
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


function* logPostEvent(params, user) {
    yield updateMTimesBaseOnParams(params);
    if (!params.project_id) {
        return false;
    }

    if (params.file_id) {
        yield addFileEvent(params.project_id, params.file_id, user);
    } else if (params.sample_id) {

    } else if (params.process_id) {

    } else if (params.experiment_id) {

    } else {
        yield addProjectEvent(params.project_id, user);
    }

    return true;
}

function* logPutEvent(params, user) {
    yield updateMTimesBaseOnParams(params);

    if (!params.project_id) {
        return false;
    }

    if (params.file_id) {
        yield addFileEvent(params.project_id, params.file_id, user);
    } else if (params.sample_id) {

    } else if (params.process_id) {

    } else if (params.experiment_id) {

    } else {
        yield addProjectEvent(params.project_id, user);
    }

    return true;
}

function* addFileEvent(projectId, fileId, user) {
    yield addEvent('datafiles', projectId, fileId, user, 'file');
}

function* addProjectEvent(projectId, user) {
    yield addEvent('projects', projectId, projectId, user, 'project');
}

function* addEvent(table, projectId, id, user, itemType) {
    const f = yield r.table(table).get(id);
    const activity = new Activity(projectId, user);
    activity.itemType(itemType).itemName(f.name).itemId(id);
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

module.exports = {
    logEvent
};
