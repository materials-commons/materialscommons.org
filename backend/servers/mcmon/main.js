const cliArgs = require('command-line-args');
const r = require('./src/r');
const WatchList = require('./src/WatchList');
const Parameters = require('./src/Parameters');

function driver(watch_list) {
    watch_list.forEach( (item) =>
        {
            r.table(item.table_name).changes({squash: false}).toStream().on(
                'data',
                function(x) {
                    if (item.filter(x)) {
                        item.action(x)
                    }
                }
            )
        }
    );
}

const optionsDef = [
        {name: 'servertype', type: String, alias: 's', description: 'Server type: unit or production'}
    ];
const options = cliArgs(optionsDef);
const server_type = options.servertype || 'unit';
console.log('Running with server type: ' + server_type + '; pid: ' + process.pid);

let parameters = new Parameters();
if (! parameters.get_mc_dir_paths()) {
    console.log("Error: MCDIR is not defined.");
    process.exit()(1);
}

parameters.set_server_type(server_type);

let list_source = new WatchList(parameters);

driver(list_source.get_watch_list());
