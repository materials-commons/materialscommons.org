class GenericWatcher {

    constructor(parameters) {
        this.parameters = parameters;
        this.table_name = null;
        this.verbose_log =
            (parameters.get_server_type() == "unit")
            || (parameters.get_server_type() == "dev");
        if (this.verbose_log) {
            console.log("GenericWatcher: verbose flag set to true");
        }
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