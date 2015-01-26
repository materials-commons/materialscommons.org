Application.Services.factory("sideboard", sideboardService);
function sideboardService() {
    var self = this;
    self.byProject = {};

    // initForProject initializes the sideboard state for a project.
    function initForProject(projectID) {
        self.byProject[projectID] = {
            sideboard: [],
            emptySideBoard : []
        };
    }

    function getForProject(projectID) {
        if (!(projectID in self.byProject)) {
            initForProject(projectID);
        }
        return self.byProject[projectID];
    }

    self.service = {
        get: function(projectID) {
            return getForProject(projectID);
        },

        add: function(projectID, entry, type) {
            var proj = getForProject(projectID);
            var i = _.indexOf(proj[type], function(item) {
                return item.id === entry.id;
            });

            if (i === -1) {
                proj[type].push(entry);
            }
        },

        delete: function(projectID, entry, type) {
            var proj = getForProject(projectID);
            var i = _.indexOf(proj[type], function(item) {
                return item.id === entry.id;
            });
            if (i !== -1) {
                proj[type].splice(i, 1);
            }
        },

        handleFromEvent: function(projectID, entry, event, type) {
            if (event.type === 'drop') {
                self.service.add(projectID, entry, type);
            } else {
                if ($(event.target).hasClass("inactive")) {
                    self.service.add(projectID, entry, type);
                    $(event.target).removeClass("inactive");
                } else {
                    self.service.delete(projectID, entry, type);
                    $(event.target).addClass("inactive");
                }
            }
        }
    };

    return self.service;
}
