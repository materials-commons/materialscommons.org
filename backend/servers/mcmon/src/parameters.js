class Parameters {

    constructor() {
        this.mc_dir_paths = null;
        this.server_type = process.env.SERVERTYPE || "dev";
        if (process.env.MCDIR) {
            let path_list = process.env.MCDIR;
            let paths = path_list.split(":");
            this.mc_dir_paths = paths;
        }
    }

    get_mc_dir_paths() {
        return this.mc_dir_paths
    }

    set_server_type(type) {
        if (!type) type = 'unit';
        this.server_type = type;
    }

    get_server_type() {
        return this.server_type;
    }
}

module.exports = Parameters;