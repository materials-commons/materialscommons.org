const r = require('../r');
const db = require('./db');

const experiments = require('./experiments');
const experimentDelete = require('./experiment-delete');
const projects = require('./projects');

function* deleteProject(projectId, options) {

    let dryRun = !!(options && options.dryRun);

    let errorAddIn =
        " WARNING. The project may have been partially deleted - project state unknown.";

    console.log(dryRun);

    results = yield projects.getProject(projectId);

    let project = null;
    let datasets = [];
    let samples = [];

    if (results.val) {
        project = results.val;
        datasets = project.datasets;
        samples = project.samples;
    } else {
        let error = results.error;
        error += errorAddIn;
        return {
            error: error
        }
    }

    let hasPublishedDatasets = yield testForPublishedDatasets(projectId);
    if (hasPublishedDatasets) {
        return {error: "Can not delete an experiment with published datasets"}
    }

    let results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    let deletedExperiments = [];
    for (let i = 0; i < experimentList.length; i++) {
        let experiment = experimentList[i];
        let results = yield experimentDelete
            .deleteExperiment(projectId, experiment.id, {deleteProcesses: true, dryRun: dryRun});
        if (results.val) {
            let tally = results.val;
            deletedExperiments.push(
                {
                    experiment: experiment,
                    deleted: tally
                }
            );
        } else {
            let error = results.error;
            error += errorAddIn;
            return {
                error: error
            }
        }
    }

    console.log("Langth of samples 1: ", samples.length);

    let sampleMap = new Map();
    samples.forEach(sample => {
       sampleMap.set(sample.id,sample);
       console.log(sample.id);
    });

    console.log(deletedExperiments.length);
    deletedExperiments.forEach((entry) => {
        console.log(entry);
        let experimentSamples = entry.experiment.samples;
        console.log("Number of exp samples: ", experimentSamples.length);
    //     experimentSamples.forEach(sample => {
    //         let sampleId = sample.id;
    //         if (sampleMap.has(sampleId)) {
    //             sampleMap.delete(sampleId);
    //             console.log("Deleted? ", sampleId, sampleMap.has(sampleId));
    //         }
    //     });
     });

    samples = [];
    console.log("Langth of samples 2: ", samples.length);

    sampleMap.forEach( (sample,id,map) => {
        if (sampleMap.has(id)) {
            samples.push(sample);
            console.log(sample.id);
        }
    });

    console.log("Length of samples 3: ", samples.length);

    let files = yield r.table("project2datafile")
        .getAll(projectId,{index: "project_id"}).getField('datafile_id');

    let ret = {
        val: {
            project: project,
            experiments: deletedExperiments,
            datasets: datasets,
            files: files,
            samples: samples
        }
    };

    if (!dryRun) {
        //do the actual delete of the non-experiment objects
        // delete datasets
        // delete remaining samples
        // delete files

    }

    return ret;
}

module.exports = {
    deleteProject
};


function* testForPublishedDatasets(projectId){

    let results = yield experiments.getAllForProject(projectId);
    let experimentList = results.val;

    for (let i = 0; i < experimentList.length; i++) {
        let datasetList = experimentList[i].datasets;
        for (let j = 0; j < datasetList.length; j++) {
            let dataset = datasetList[j];
            if (datasetList[j].published) {
                return true;
            }
        }
    }
    return false;
}