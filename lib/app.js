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
    },

    all_mcusers: {
        map: function(doc) {
            if (doc.type == "mcuser") {
                emit(doc._id, doc);
            }
        }
    },

    mcusers_by_email: {
        map: function(doc) {
            if (doc.type == "mcuser") {
                emit(doc.email, doc);
            }
        }
    }
};
