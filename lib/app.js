exports.views = {

    all_experiments: {
        map: function(doc) {
            if (doc.type == "experiment") {
                emit(doc._id, doc);
            }
        }
    },

    recent_events: {
        map: function(doc) {
            if (doc.type == "event") {
                emit(doc._id, doc);
            }
        }
    }

};
