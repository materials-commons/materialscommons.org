const r = require('./src/r');
const Builder = require('./src/Builder.js')

function driver(watch_list) {
    watch_list.forEach( (item) =>
        {
            r.table(item.table_name).changes().toStream().on(
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

let builder = new Builder()

driver(builder.get_watch_list());