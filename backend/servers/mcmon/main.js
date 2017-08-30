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

let parameters = new Parameters();
if (! parameters.get_mc_dir_paths()) {
    console.log("Error: MCDIR is not defined.");
    process.exit()(1);
}

let list_source = new WatchList(parameters);

driver(list_source.get_watch_list());
