const r = require('./../../dash');

function View(user_id, item_type, item_id) {
    this.user_id = user_id;
    this.item_type = item_type;
    this.item_id = item_id;
    this.birthtime = r.now();
    this.mtime = this.birthtime;
    this.otype = "view";
    this.count = 1;
}

module.exports = {
    View: View
}