Application.Services.factory('ui', uiService);

// uiService tracks various ui component states by project.
function uiService() {
    var self = this;
    self.byProject = {};

    function columnEntry(name, show) {
        return {
            name: name,
            show: show
        };
    }

    // initForProject initializes the ui state for a project.
    function initForProject(projectID) {
        self.byProject[projectID] = {
            files: false,
            expanded: {}//,
            // homeColumns: {
            //     column1: [
            //         columnEntry("calendar", false),
            //         columnEntry("reviews", true),
            //         columnEntry("files", true)
            //     ],
            //     column2: [
            //         columnEntry("sideboard", false),
            //         columnEntry("samples", true),
            //         columnEntry("notes", true),
            //         columnEntry("processes", true)
            //     ]
            // }
        };
    }

    // getForProject returns a ui state for a project. It
    // creates the project entry if it doesn't exist.
    function getForProject(projectID) {
        if (!(projectID in self.byProject)) {
            initForProject(projectID);
        }
        return self.byProject[projectID];
    }

    // getIsExpanded returns an expanded key state. If the
    // key doesn't exist it creates it. If the project doesn't
    // exist it creates the project.
    function getIsExpanded(projectID, what) {
        var proj = getForProject(projectID);
        if (!(what in proj.expanded)) {
            proj.expanded[what] = false;
        }
        return proj.expanded[what];
    }

    return {
        // showFiles returns the state of files.
        showFiles: function(projectID) {
            return getForProject(projectID).files;
        },

        // setShowFiles sets the state of files attribute.
        setShowFiles: function(projectID, what) {
            var filesState = getForProject(projectID);
            filesState.files = what;
        },

        // isExpanded returns true the state for the given true.
        isExpanded: function(projectID, what) {
            return getIsExpanded(projectID, what);
        },

        // anyExpandedExcept checks if any expanded is set to true, except the
        // key given.
        anyExpandedExcept: function(projectID, what) {
            var expanded = getForProject(projectID).expanded;
            var anyTrue = false;
            Object.keys(expanded).forEach(function(key) {
                if (key !== what && expanded[key]) {
                    anyTrue = true;
                }
            });
            return anyTrue;
        },

        // setIsExpanded sets the the given expanded state.
        setIsExpanded: function(projectID, what, to) {
            var proj = getForProject(projectID);
            proj.expanded[what] = to;
        },

        toggleIsExpanded: function(projectID, what) {
            var proj = getForProject(projectID);
            proj.expanded[what] = !getIsExpanded(projectID, what);
        }
    };
}
