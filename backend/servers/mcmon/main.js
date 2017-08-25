const r = require('./r');

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

function action_log (x) {
    let old_value = x.old_val?x.old_val.published:false;
    let new_value = x.new_val?x.new_val.published:false;
    let name = x.old_val?x.old_val.title:(x.new_val?x.new_val.title:"unkn");
    message = "from " + (old_value?"Published":"Unpublished")
        + " to " + (new_value?"Published":"Unpublished");
    console.log(name + ": " + message);
}

const watch_list = [
    {
        table_name: 'datasets',
        filter: (x) => {
            let old_value = x.old_val?x.old_val.published:false;
            let new_value = x.new_val?x.new_val.published:false;
            let change = (old_value != new_value);
            return change;
        },
        action: action_log
    }
];

driver(watch_list);