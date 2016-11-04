const db = require('./db');

const Project = db.createModel("projects", {
    id: db.type.string(),
    _type: db.type.string().default("project"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Process = db.createModel("processes", {
    id: db.type.string(),
    _type: db.type.string().default("process"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    destructive: db.type.boolean().default(false),
    does_transform: db.type.boolean().default(false),
    process_type: db.type.string(),
    template_id: db.type.string(),
    template_name: db.type.string(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Sample = db.createModel("samples", {
    id: db.type.string(),
    _type: db.type.string().default("sample"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Experiment = db.createModel("experiments", {
    id: db.type.string(),
    _type: db.type.string().default("experiment"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    note: db.type.string(),
    status: db.type.string().default("active"),
    citations: [db.type.string()],
    collaborators: [db.type.string()],
    funding: [db.type.string()],
    goals: [db.type.string()],
    papers: [db.type.string()],
    publications: [db.type.string()],
    birthtime: db.type.date.default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Datafile = db.createModel("datafiles", {
    id: db.type.string(),
    _type: db.type.string().default("datafile"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    parent: db.type.string(),
    size: db.type.integer(),
    checksum: db.type.string(),
    uploaded: db.type.integer(),
    usesid: db.type.string(),
    mediatype: {
        description: db.type.string(),
        mime: db.type.string()
    },
    birthtime: db.type.date.default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Datadir = db.createModel("datadirs", {
    id: db.type.string(),
    _type: db.type.string().default("datadir"),
    name: db.type.string(),
    owner: db.type.string(),
    parent: db.type.string(),
    birthtime: db.type.date.default(r.now()),
    atime: db.type.date().default(function() { return this.birthtime; }),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

module.exports = {
    Project,
    Process,
    Sample,
    Experiment,
    Datafile,
    Datadir
};
