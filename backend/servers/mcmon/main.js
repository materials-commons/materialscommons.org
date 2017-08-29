const r = require('./src/r');
const WatchList = require('./src/WatchList.js')

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

let list_source = new WatchList()

driver(list_source.get_watch_list());