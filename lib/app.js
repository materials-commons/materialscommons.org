exports.views = {

    all_experiments: {
        map: function(doc) {
            if (doc.type == "experiment") {
                emit(doc._id, doc);
            }
        }
    }

};
