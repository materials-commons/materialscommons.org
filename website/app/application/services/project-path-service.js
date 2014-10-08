Application.Services.factory('ProjectPath',
    [ 'pubsub', function (pubsub) {
        var pathtrail = [], pathdir = [], chosen_project = "", current_item = "", from = false;
        return {
            populate: function (trail, dir) {
                pathtrail = trail;
                pathdir = dir;
            },
            get_trail: function () {
                return pathtrail;
            },
            get_dir: function () {
                return pathdir;
            },
            update_dir: function (item) {
                pathdir = item.children;
                current_item = item;
                pubsub.send('update_dir');
                return pathdir;
            },

            set_project: function (id) {
                chosen_project = id;
            },
            get_project: function () {
                return chosen_project;
            },

            get_current_item: function () {
                return current_item;
            },

            set_from: function(value){
                from = value;
            },
            get_from: function(){
                return from;
            }

        };
    }]);