Application.Services.factory("sideboard", sideboardService);
function sideboardService() {
    var self = this;
    self.byProject = {};

    function getForProject(projectID) {
        if (!(projectID in self.byProject)) {
            self.byProject[projectID] = [];
        }
        return self.byProject[projectID];
    }

    self.service = {
        get: function(projectID) {
            return getForProject(projectID);
        },

        add: function(projectID, entry) {
            var sideboard = getForProject(projectID);
            var i = _.indexOf(sideboard, function(item) {
                return item.id === entry.id;
            });

            if (i === -1) {
                sideboard.push(entry);
            }
        },

        delete: function(projectID, entry) {
            var sideboard = getForProject(projectID);
            var i = _.indexOf(sideboard, function(item) {
                return item.id === entry.id;
            });
            if (i !== -1) {
                sideboard.splice(i, 1);
            }
        },

        handleFromEvent: function(projectID, entry, event) {
            if ($(event.target).hasClass("in-sideboard")) {
                self.service.delete(projectID, entry);
                $(event.target).removeClass("in-sideboard");
            } else {
                self.service.add(projectID, entry);
                $(event.target).addClass("in-sideboard");
            }
        }
    };

    return self.service;
}
