exports.views = {

    all_experiments: {
        map: function (doc) {
            if (doc.type == "experiment") {
                emit(doc._id, doc);
            }
        }
    },

    recent_events: {
        map: function (doc) {
            if (doc.type == "event") {
                emit(doc._id, doc);
            }
        }
    },

    all_mcusers: {
        map: function (doc) {
            if (doc.type == "mcuser") {
                emit(doc._id, doc);
            }
        }
    },

    mcusers_by_email: {
        map: function (doc) {
            if (doc.type == "mcuser") {
                emit(doc.email, doc);
            }
        }
    },

    experiments_with_data: {
        map: function (doc) {
            if (doc.type == "experiment") {
                emit([doc._id, 0], doc);
            }
            else if (doc.type == "data") {
                for (var i = 0; i < doc.experiments.length; i++) {
                    var experimentId = doc.experiments[i];
                    emit([experimentId, 1], doc);
                }
            }
        }
    },

    all_datagroups: {
        map:function(doc) {
            if (doc.type == "datagroup") {
                emit(doc._id, doc);
            }
        }
    },

    datagroups_with_data: {
        map: function(doc) {
            if (doc.type == "datagroup") {
                emit([doc._id, 0], doc);
                for (var i = 0; i < doc.parentDataGroups.length; i++) {
                    var parentDgId = doc.parentDataGroups[i];
                    emit([parentDgId, 1], doc);
                }
            }
            else if (doc.type == "data") {
                for (var i = 0; i < doc.dataGroups.length; i++) {
                    var dgId = doc.dataGroups[i];
                    emit([dgId, 2], doc);
                }
            }
        }
    },

    all_data: {
        map: function (doc) {
            if (doc.type == "data") {
                emit(doc._id, doc);
            }
        }
    },

    data_by_user: {
        map: function (doc) {
            if (doc.type == "data") {
                emit(doc.user, doc);
            }
        }
    },

    all_usergroups: {
        map: function(doc) {
            if (doc.type == "usergroup") {
                emit(doc._id, doc);
            }
        }
    },
//
//    usergroups_by_user: {
//        map: function(doc) {
//            if (doc.type == "usergroup") {
//                for (var i = 0; i < doc.users.length; i++) {
//                    emit(doc.users[i], doc);
//                }
//            }
//        }
//    },
//
//    usergroups_by_name: {
//        map: function(doc) {
//            if (doc.type == "usergroup") {
//                emit(doc.name, doc);
//            }
//        }
//    },

    data_by_dir: {
        map: function (doc) {
            if (doc.type == "data") {
                emit(doc.dir, doc);
            }
        }
    },

    all_forms: {
        map: function (doc) {
            if (doc.type == "form") {
                emit(doc._id, doc);
            }
        }
    },

    form_by_user: {
        map: function (doc) {
            if (doc.type == "form") {
                emit(doc.user, doc);
            }
        }
    }
};
