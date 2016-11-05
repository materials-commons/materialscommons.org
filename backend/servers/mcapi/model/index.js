const db = require('./db');
const r = db.r;

const Project = db.createModel("projects", {
    id: db.type.string(),
    _mctype: db.type.string().default("project"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

/*
 * A Process also has:
 *    input_samples
 *    output_samples
 *    input_files
 *    output_files
 *
 *    TODO: Need to add setups
 */
const Process = db.createModel("processes", {
    id: db.type.string(),
    _mctype: db.type.string().default("process"),
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

const Setup = db.createModel("setups", {
    id: db.type.string(),
    _mctype: db.type.string().default("settings"),
    name: db.type.string(),
    attribute: db.type.string(),
    birthtime: db.type.date().default(r.now())
});

/*
 * A Sample may also have:
 *    property_set_id
 *    files
 *    processes
 *    measurements
 */
const Sample = db.createModel("samples", {
    id: db.type.string(),
    _mctype: db.type.string().default("sample"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Experiment = db.createModel("experiments", {
    id: db.type.string(),
    _mctype: db.type.string().default("experiment"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    note: db.type.string(),
    status: db.type.string().default("active"),
    citations: db.type.array().schema(db.type.string()),
    collaborators: db.type.array().schema(db.type.string()),
    funding: db.type.array().schema(db.type.string()),
    goals: db.type.array().schema(db.type.string()),
    papers: db.type.array().schema(db.type.string()),
    publications: db.type.array().schema(db.type.string()),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Dataset = db.createModel("datasets", {
    id: db.type.string(),
    _mctype: db.type.string().default("dataset"),
    title: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    doi: db.type.string(),
    institution: db.type.string(),
    authors: db.type.array().schema(db.type.object().schema({
        firstname: db.type.string(),
        lastname: db.type.string(),
        affiliation: db.type.string()
    }).removeExtra()),
    papers: db.type.array().schema(db.type.object().schema({
        abstract: db.type.string(),
        authors: db.type.string(),
        doi: db.type.string(),
        link: db.type.string(),
        title: db.type.string()
    }).removeExtra()),
    license: db.type.object().schema({
        link: db.type.string(),
        name: db.type.string()
    }).removeExtra(),
    funding: db.type.string(),
    published: db.type.boolean().default(false),
    published_date: db.type.date(),
    embargo_date: db.type.date(),
    keywords: db.type.array().schema(db.type.string()),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Datafile = db.createModel("datafiles", {
    id: db.type.string(),
    _mctype: db.type.string().default("datafile"),
    name: db.type.string(),
    description: db.type.string(),
    owner: db.type.string(),
    parent: db.type.string(),
    size: db.type.number().integer(),
    checksum: db.type.string(),
    uploaded: db.type.number().integer(),
    usesid: db.type.string(),
    mediatype: db.type.object().schema({
        description: db.type.string(), mime: db.type.string()
    }).removeExtra(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const Datadir = db.createModel("datadirs", {
    id: db.type.string(),
    _mctype: db.type.string().default("datadir"),
    name: db.type.string(),
    owner: db.type.string(),
    parent: db.type.string(),
    birthtime: db.type.date().default(r.now()),
    atime: db.type.date().default(function() { return this.birthtime; }),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const ExperimentNote = db.createModel("experimentnotes", {
    id: db.type.string(),
    _mctype: db.type.string().default("note"),
    owner: db.type.string(),
    note: db.type.string(),
    name: db.type.string(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

const ExperimentTask = db.createModel("experimenttasks", {
    id: db.type.string(),
    _mctype: db.type.string().default("experiment_task"),
    name: db.type.string(),
    note: db.type.string(),
    owner: db.type.string(),
    process_id: db.type.string(),
    parent_id: db.type.string(),
    template_id: db.type.string(),
    template_name: db.type.string(),
    index: db.type.number().integer(),
    flags: db.type.object().schema({
        done: db.type.boolean(),
        flagged: db.type.boolean(),
        onhold: db.type.boolean(),
        starred: db.type.boolean()
    }).removeExtra(),
    birthtime: db.type.date().default(r.now()),
    mtime: db.type.date().default(function() { return this.birthtime; })
});

module.exports = {
    Project,
    Process,
    Setup,
    Sample,
    Experiment,
    Dataset,
    Datafile,
    Datadir,
    ExperimentNote,
    ExperimentTask
};
