Application.Services.factory('ui', ["pubsub", uiService]);

// uiService tracks various ui component states by project.
function uiService(pubsub) {
    var self = this;
    self.byProject = {};

    // initForProject initializes the ui state for a project.
    function initForProject(projectID) {
        self.byProject[projectID] = {
            files: false,
            expanded: {},
            panels: {
                reviews: true,
                samples: true,
                files: true,
                notes: true,
                processes: true,
                calendar: false,
                sideboard: false
            },
            split: {
                column1: false,
                column2: false,
                sideboard: false
            } ,
            emptySplitBoard: false
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
        showFiles: function (projectID) {
            return getForProject(projectID).files;
        },

        // setShowFiles sets the state of files attribute.
        setShowFiles: function (projectID, what) {
            var filesState = getForProject(projectID);
            filesState.files = what;
        },

        // isExpanded returns true the state for the given true.
        isExpanded: function (projectID, what) {
            return getIsExpanded(projectID, what);
        },

        // anyExpandedExcept checks if any expanded is set to true, except the
        // key given.
        anyExpandedExcept: function (projectID, what) {
            var expanded = getForProject(projectID).expanded;
            var anyTrue = false;
            Object.keys(expanded).forEach(function (key) {
                if (key !== what && expanded[key]) {
                    anyTrue = true;
                }
            });
            return anyTrue;
        },

        // setIsExpanded sets the the given expanded state.
        setIsExpanded: function (projectID, what, to) {
            var proj = getForProject(projectID);
            proj.expanded[what] = to;
        },

        toggleIsExpanded: function (projectID, what) {
            var proj = getForProject(projectID);
            proj.expanded[what] = !getIsExpanded(projectID, what);
        },

        togglePanelState: function (what, projectID) {
            var proj = getForProject(projectID);
            proj.panels[what] = !proj.panels[what];
        },

        showPanel: function (what, projectID) {
            var proj = getForProject(projectID);
            return proj.panels[what];
        },

        setColumn: function (what, col, projectID) {
            var proj = getForProject(projectID);
                if(col){
                    if (col === 'column1') {
                        proj.split.column2 = !proj.split.column2;
                    } else {
                        proj.split.column1 = !proj.split.column1;
                    }
                }else{
                    //consider what === sideboard
                    proj.split.column1 = true;
                    proj.split.column2 = false;
                    proj.emptySplitBoard = true;
                }
            proj.split.sideboard = !proj.split.sideboard;
            _.keys(proj.panels).forEach(function (key) {
                if (key === what) {
                    proj.panels[key] = true;
                } else {
                    proj.panels[key] = false;
                }
            });
        },
        getColumn: function (col, projectID) {
            var proj = getForProject(projectID);
            return proj.split[col];
        } ,
        getEmptySplitBoardStatus: function(projectID){
            var proj = getForProject(projectID);
            return proj.emptySplitBoard;
        },
        anySplitActivated: function(projectID){
            var proj = getForProject(projectID);
            console.log(proj);
            if(proj.split.column1 === true || proj.split.column2 === true){
                return true;
            } else{
                return false;
            }
        }

    };
}
