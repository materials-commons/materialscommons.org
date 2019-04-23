const {nameToAttr} = require('./util');

function Project(name, description, owner) {
    this.name = name.trim();
    this.description = description;
    this.overview = '';
    this.status = 'active';
    this.flag = 'none';
    this.tags = [];
    this.reminders = [];
    this.owner = owner;
    this.birthtime = new Date();
    this.mtime = this.birthtime;
    this.mediatypes = {};
    this.size = 0;
    this.otype = 'project';
    this.todos = [];
}

function Access(project_name, project_id, user_id) {
    this.project_name = project_name;
    this.project_id = project_id;
    this.user_id = user_id;
    this.birthtime = new Date();
    this.mtime = this.birthtime;
    this.dataset = '';
    this.permissions = '';
    this.status = '';
}

function Sample(name, description, owner) {
    this.name = name.trim();
    this.description = description;
    this.owner = owner;
    this.birthtime = new Date();
    this.mtime = this.birthtime;
    this.is_grouped = false;
    this.has_group = false;
    this.group_size = 0;
    this.otype = 'sample';
}

function Process(name, owner, templateId, transform) {
    this.name = name.trim();
    this.owner = owner;
    this.template_id = templateId;
    this.process_type = transform ? 'transform' : 'measurement';
    this.birthtime = new Date();
    this.mtime = this.birthtime;
    this.otype = 'process';
    this.note = '';
    this.does_transform = transform;
}

function Process2Setup(processID, setupID) {
    this.setup_id = setupID;
    this.process_id = processID;
}

function Process2Measurement(processID, mID) {
    this.measurement_id = mID;
    this.process_id = processID;
}

function Process2Sample(processID, sampleID, psetID, direction) {
    this.sample_id = sampleID;
    this.process_id = processID;
    this.property_set_id = psetID;
    this.direction = direction;
    if (!this.direction) {
        this.direction = 'in';
    }
}

function Process2Setupfile(processID, fileID) {
    this.process_id = processID;
    this.datafile_id = fileID;
}

function Process2File(processID, fileID, direction) {
    this.process_id = processID;
    this.datafile_id = fileID;
    this.direction = direction;
}

function Setups(name, attribute) {
    this.name = name.trim();
    this.attribute = attribute ? attribute.trim() : nameToAttr(name);
    this.birthtime = new Date();
    this.otype = 'settings';
}

function SetupProperty(setupID, name, description, otype, value, unit) {
    this.setup_id = setupID;
    this.name = name.trim();
    this.description = description;
    this.attribute = nameToAttr(attribute);
    this.otype = otype;
    this.value = value;
    this.unit = unit;
}

function Measurement(name, attribute, sampleID) {
    this.name = name.trim();
    this.attribute = attribute ? attribute.trim() : nameToAttr(name);
    this.sample_id = sampleID;
    this.otype = 'measurement';
    this.file = {};
}

Measurement.prototype.setValue = function(value, units, otype, nvalue, nunits, element) {
    this.value = value;
    this.otype = otype;
    this.unit = units;
    this.element = element;
    this.nvalue = nvalue ? nvalue : value;
    this.nunits = nunits ? nunits : units;
};

Measurement.prototype.setFile = function(f) {
    this.file = f;
};

function Property(name, attribute) {
    this.parent_id = '';
    this.birthtime = new Date();
    this.otype = 'property';
    this.name = name.trim();
    this.attribute = attribute ? attribute.trim() : nameToAttr(name);
    this.best_measure_id = '';
}

function PropertySet(current, parent_id) {
    this.current = current ? current : false;
    this.parent_id = parent_id ? parent_id : '';
}

function Property2Measurement(attrID, measurementID) {
    this.property_id = attrID;
    this.measurement_id = measurementID;
}

function Property2Process(attrID, processID) {
    this.property_id = attrID;
    this.process_id = processID;
}

function Project2Process(projectID, processID) {
    this.project_id = projectID;
    this.process_id = processID;
}

function Project2Sample(projectID, sampleID) {
    this.project_id = projectID;
    this.sample_id = sampleID;
}

function Sample2PropertySet(sampleID, psetID, current) {
    this.property_set_id = psetID;
    this.sample_id = sampleID;
    this.current = current ? current : false;
}

function PropertySet2Property(attrID, asetID) {
    this.property_set_id = asetID;
    this.property_id = attrID;
}

function BestMeasureHistory(propertyID, mID) {
    this.property_id = propertyID;
    this.measurement_id = mID;
    this.when = new Date();
    this.otype = 'best_measure_history';
}

function Sample2Datafile(sampleID, datafileID) {
    this.datafile_id = datafileID;
    this.sample_id = sampleID;
}

function Note(title, note, owner) {
    let now = new Date();
    this.title = title;
    this.note = note;
    this.owner = owner;
    this.mtime = now;
    this.birthtime = now;
}

function Note2Item(itemID, itemType, noteID) {
    this.item_id = itemID;
    this.item_type = itemType;
    this.note_id = noteID;
}

function Tag2Item(tagID, itemID, itemType) {
    this.tag_id = tagID;
    this.item_type = itemType;
    this.item_id = itemID;
}

function Directory(name, owner, project, parent) {
    let now = new Date();
    this.otype = 'datadir';
    this.owner = owner;
    this.name = name.trim();
    this.project = project;
    this.parent = parent;
    this.birthtime = now;
    this.mtime = now;
    this.atime = now;
    this.shortcut = false;
}

function Project2DataDir(projectID, dirID) {
    this.project_id = projectID;
    this.datadir_id = dirID;
}

function Sample2Sample(parentID, childID) {
    this.parent_sample_id = parentID;
    this.sample_id = childID;
}

function Share(projectID, itemID, itemType, itemName) {
    let now = new Date();
    this.otype = 'share';
    this.project_id = projectID;
    this.item_id = itemID;
    this.item_type = itemType;
    this.item_name = itemName;
    this.birthtime = now;
}

function User2Share(userID, shareID) {
    this.user_id = userID;
    this.share_id = shareID;
}

function User(email, fullname, apikey) {
    let now = new Date();
    this.name = email;
    this.fullname = fullname;
    this.email = email;
    this.password = '';
    this.id = email;
    this.apikey = apikey;
    this.birthtime = now;
    this.demo_installed = false;
    this.converted = true; // New users have the converted flag set for their passwords being converted from pbkdf2
    this.mtime = now;
    this.avatar = '';
    this.description = '';
    this.affiliation = '';
    this.homepage = '';
    this.admin = false;
    this.preferences = {
        tags: [],
        templates: []
    };
    this.validate_uuid = '';
}

function Experiment(name, owner) {
    let now = new Date();
    this.name = name.trim();
    this.owner = owner;
    this.otype = 'experiment';
    this.description = '';
    this.note = '<h2>Experiment Notes</h2>';
    this.status = 'active';
    this.birthtime = now;
    this.mtime = now;
    this.goals = [];
    this.collaborators = [];
    this.funding = [];
    this.papers = [];
    this.publications = [];
    this.citations = [];
}

function ExperimentTask(name, owner) {
    let now = new Date();
    this.name = name;
    this.owner = owner;
    this.index = 0;
    this.otype = 'experiment_task';
    this.note = 'Notes here...';
    this.estimate = {
        value: 0,
        unit: ''
    };
    this.due_date = 0;
    this.flags = {
        starred: false,
        flagged: false,
        onhold: false,
        done: false
    };
    this.template_id = '';
    this.process_id = '';
    this.parent_id = '';
    this.birthtime = now;
    this.mtime = now;
}

function Experiment2ExperimentTask(experimentID, experimentTaskID) {
    this.experiment_id = experimentID;
    this.experiment_task_id = experimentTaskID;
}

function Project2Experiment(project_id, experiment_id) {
    this.project_id = project_id;
    this.experiment_id = experiment_id;
}

function ExperimentNote(name, note, owner) {
    let now = new Date();
    this.name = name;
    this.note = note;
    this.owner = owner;
    this.birthtime = now;
    this.mtime = now;
}

function Experiment2ExperimentNote(experimentID, experimentNoteID) {
    this.experiment_id = experimentID;
    this.experiment_note_id = experimentNoteID;
}

function Experiment2Process(experimentID, processID) {
    this.experiment_id = experimentID;
    this.process_id = processID;
}

function Experiment2DataFile(experimentId, fileId) {
    this.experiment_id = experimentId;
    this.datafile_id = fileId;
}

function Experiment2Sample(experimentId, sampleId) {
    this.experiment_id = experimentId;
    this.sample_id = sampleId;
}

function ExperimentEtlMetadata(experimentId, json, owner) {
    let now = new Date();
    this.otype = 'experiment_etl_metadata';
    this.birthtime = now;
    this.mtime = now;
    this.experiment_id = experimentId;
    this.json = json;
    this.owner = owner;
}

function Dataset(title, owner) {
    let now = new Date();
    this.owner = owner;
    this.title = title.trim();
    this.otype = 'dataset';
    this.institution = '';
    this.authors = [];
    this.birthtime = now;
    this.mtime = now;
    this.published_date = now;
    this.embargo_date = '';
    this.papers = [];
    this.funding = '';
    this.keywords = [];
    this.funding = '';
    this.doi = '';
    this.description = '';
    this.license = {
        name: '',
        link: ''
    };
    this.published = false;
}

function Experiment2Dataset(experimentId, datasetId) {
    this.experiment_id = experimentId;
    this.dataset_id = datasetId;
}

function Dataset2Sample(datasetId, sampleId) {
    this.dataset_id = datasetId;
    this.sample_id = sampleId;
}

function Dataset2Process(datasetId, processId) {
    this.dataset_id = datasetId;
    this.process_id = processId;
}

function Dataset2ExperimentNote(datasetId, experimentNoteId) {
    this.dataset_id = datasetId;
    this.experiment_note_id = experimentNoteId;
}

function Dataset2Datafile(datasetId, datafileId) {
    this.dataset_id = datasetId;
    this.datafile_id = datafileId;
}

function DataFile(name, owner) {
    this.otype = 'datafile';
    this.current = true;
    this.description = '';
    this.parent = '';
    this.usesid = '';
    let now = new Date();
    this.birthtime = now;
    this.mtime = now;
    this.atime = now;
    this.name = name.trim();
    this.owner = owner;
    this.size = 0;
    this.uploaded = 0;
}

function Project2DataFile(projectId, datafileId) {
    this.project_id = projectId;
    this.datafile_id = datafileId;
}

function DataDir2DataFile(dirId, datafileId) {
    this.datadir_id = dirId;
    this.datafile_id = datafileId;
}

function Comment(item_id, item_type, owner, text) {
    this.otype = 'comment';
    let now = new Date();
    this.birthtime = now;
    this.mtime = now;
    this.atime = now;

    this.owner = owner;
    this.text = text;
    this.item_id = item_id;
    this.item_type = item_type;
}

module.exports = {
    Project: Project,
    Access: Access,
    Sample: Sample,
    Process: Process,
    Process2Setup: Process2Setup,
    Process2Measurement: Process2Measurement,
    Process2Sample: Process2Sample,
    Process2Setupfile: Process2Setupfile,
    Process2File: Process2File,
    Setups: Setups,
    SetupProperty: SetupProperty,
    Measurement: Measurement,
    Property: Property,
    Property2Process: Property2Process,
    Property2Measurement: Property2Measurement,
    PropertySet: PropertySet,
    PropertySet2Property: PropertySet2Property,
    Project2Process: Project2Process,
    Project2Sample: Project2Sample,
    Sample2PropertySet: Sample2PropertySet,
    BestMeasureHistory: BestMeasureHistory,
    Sample2Datafile: Sample2Datafile,
    Note: Note,
    Note2Item: Note2Item,
    Tag2Item: Tag2Item,
    Directory: Directory,
    Project2DataDir: Project2DataDir,
    Sample2Sample: Sample2Sample,
    Share: Share,
    User2Share: User2Share,
    Experiment: Experiment,
    Project2Experiment: Project2Experiment,
    ExperimentTask,
    Experiment2ExperimentTask,
    ExperimentNote,
    Experiment2ExperimentNote,
    Experiment2Process,
    Experiment2DataFile,
    Experiment2Sample,
    ExperimentEtlMetadata,
    User,
    Dataset,
    Experiment2Dataset,
    Dataset2Sample,
    Dataset2Process,
    Dataset2ExperimentNote,
    Dataset2Datafile,
    DataFile,
    Project2DataFile,
    DataDir2DataFile,
    Comment
};

