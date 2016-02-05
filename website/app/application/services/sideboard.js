(function (module) {
    module.factory("sideboard", sideboardService);
    function sideboardService() {
        var self = this;
        self.byProject = {};

        // initForProject initializes the sideboard state for a project.
        function initForProject(projectID) {
            self.byProject[projectID] = {
                sideboard: [],
                emptySideBoard: []
            };
        }

        function getForProject(projectID) {
            if (!(projectID in self.byProject)) {
                initForProject(projectID);
            }
            return self.byProject[projectID];
        }

        self.service = {
            get: function (projectID) {
                return getForProject(projectID);
            },

            add: function (projectID, entry, type) {
                var proj = getForProject(projectID);
                var i = _.indexOf(proj[type], function (item) {
                    return item.id === entry.id;
                });

                if (i === -1) {
                    var copy = angular.copy(entry);
                    proj[type].push(copy);
                }
            },

            delete: function (projectID, entry, type) {
                var proj = getForProject(projectID);
                var i = _.indexOf(proj[type], function (item) {
                    return item.id === entry.id;
                });
                if (i !== -1) {
                    proj[type].splice(i, 1);
                }
            },

            handleFromEvent: function (projectID, entry, event, type) {
                var el = $("#" + entry.id + " > i");
                if (el.hasClass("inactive")) {
                    self.service.add(projectID, entry, type);
                    el.removeClass("inactive");
                } else {
                    self.service.delete(projectID, entry, type);
                    el.addClass("inactive");
                }
            }
        };

        return self.service;
    }
}(angular.module('materialscommons')));
