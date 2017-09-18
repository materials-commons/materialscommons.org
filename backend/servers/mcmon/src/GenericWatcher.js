class GenericWatcher {

    constructor(parameters) {
        this.parameters = parameters;
        this.table_name = null;
        this.verbose_log = parameters.get_server_type() == "unit";
    }

    filter(delte) {
        return true;
    }

    action(delta) {
        console.log(delta);
    }

    verbose(){
        return this.verbose_log;
    }

}

module.exports = GenericWatcher;