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
                var copy = angular.copy(entry);
                proj[type].push(copy);
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
            var el = document.getElementById(entry.id);
            if (event.type === 'drop') {
                //If entry type is file. Then there are no childNodes. We have to apply className to the parent element.
                if (el.children.length === 0){
                    el.className =  'fa fa-fw fa-clipboard';
                }else{
                    el.children[0].className =  'fa fa-fw fa-clipboard';
                }

                self.service.add(projectID, entry, type);
            } else {
                if ($(event.target).hasClass("inactive")) {
                    self.service.add(projectID, entry, type);
                    $(event.target).removeClass("inactive");
                } else {
                    self.service.delete(projectID, entry, type);
                    $(event.target).addClass("inactive");
                    if (el.children.length === 0){
                        el.className =  'fa fa-fw fa-clipboard inactive';
                    }else{
                        el.children[0].className =  'fa fa-fw fa-clipboard inactive';
                    }
                }
            }
        }
    };

    return self.service;
}
