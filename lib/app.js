exports.views = {

    tags_by_count: {
        map: function (doc) {
            if (doc.type == "data" && doc.tags) {
                doc.tags.forEach(function (tag) {
                    emit([tag, doc.type], 1);
                });
            }
        },

        reduce: function (keys, values, rereduce) {
            return sum(values);
        }
    },

    tags_by_user: {
        map: function (doc) {
            if (doc.type == "data" && doc.tags) {
                doc.tags.forEach(function(tag) {
                    emit([doc.owner, tag], 1);
                })
            }
        },

        reduce: function(keys, values, rereduce) {
            return sum(values);
        }
    },

    docs_by_tag: {
        map: function (doc) {
            if (doc.type == "data" && doc.tags) {
                doc.tags.forEach(function (tag) {
                    emit(tag, doc);
                });
            }
        }
    },

    docs_by_user_and_tag: {
        map: function (doc) {
            if (doc.type == "data" && doc.tags) {
                doc.tags.forEach(function (tag) {
                    emit([doc.owner, tag], doc);
                });
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

    datagroup_by_name: {
        map: function (doc) {
            if (doc.type == "datagroup") {
                emit(doc.name, doc);
            }
        }
    },

    items_by_type_and_date: {
        map: function (doc) {
            if (doc.type == "datagroup") {
                emit([doc.dateAdded, "datagroup"], doc);
            } else if (doc.type == "data") {
                emit([doc.dateAdded, "data"], doc);
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

    all_datagroups: {
        map: function (doc) {
            if (doc.type == "datagroup") {
                emit(doc._id, doc);
            }
        }
    },

    datagroups_with_data: {
        map: function (doc) {
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

    data_by_owner: {
        map: function (doc) {
            if (doc.type == "data") {
                emit([doc.owner, doc.access], doc);
            }
        }
    },

    all_usergroups: {
        map: function (doc) {
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
    },

    all_news: {
        map: function (doc) {
            if (doc.type = "news") {
                emit(doc._id, doc);
            }
        }
    },

    news_by_date: {
        map: function (doc) {
            if (doc.type == "news") {
                emit(doc.date, doc);
            }
        }
    }
};

exports.filters = {
    nouser: function (doc, req) {
        if (doc.type == "mcuser") {
            return false;
        }
        else {
            return true;
        }
    }
};

exports.rewrites = [

    { "from": "/materialscommons/*", "to": "../../*" },
    {"from": "/", "to": "index.html"},
    {"from": "/*", "to": "*"}
];
