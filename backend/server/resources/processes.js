module.exports = function (processes, schema) {
    const status = require('http-status');

    return {
        getProcess,
        getProjectProcesses
    };

    /////////////////////////

    function* getProcess(next) {
        let rv = yield processes.getProcess(this.params.process_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* getProjectProcesses(next) {
        let rv = yield processes.getProjectProcesses(this.params.project_id);
        if (rv.error) {
            this.status = status.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = rv.val;
        }
        yield next;
    }
};
