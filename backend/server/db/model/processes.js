module.exports = function(r) {
    const dbExec = require('./run');
    const commonQueries = require('./common-queries');

    return {
        getProcess,
        getProjectProcesses,
        r: r
    };

    function* getProcess(processID) {
        let rql = commonQueries.processDetailsRql(r.table('processes').getAll(processID), r);
        let process = yield dbExec(rql);
        return process.length ? {val: process[0]} : {error: `No such process ${processID}`};
    }

    function* getProjectProcesses(projectID) {
        let rql = commonQueries.processDetailsRql(r.table('project2process').getAll(projectID, {index: 'project_id'})
            .eqJoin('process_id', r.table('processes')).zip().filter(r.row('process_type').ne('as_received')), r);
        let processes = yield dbExec(rql);
        return {val: processes};
    }
};
