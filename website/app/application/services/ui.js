(function (module) {
    module.factory('ui', [uiService]);

// uiService tracks various ui component states by project.
    function uiService() {
        var self = this;
        self.byProject = {};

        // initForProject initializes the ui state for a project.
        function initForProject(projectID) {
            self.byProject[projectID] = {
                files: false,
                expanded: {},
                activePage: {
                    'home': 'home'
                },
                panels: {
                    reviews: true,
                    samples: true,
                    files: true,
                    notes: true,
                    processes: true,
                    calendar: false,
                    sideboard: false,
                    settings: false,
                    provwizard: false,
                    drafts: false,
                    emptyboard: false
                },
                split: {
                    column1: false,
                    column2: false
                }
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

        function hidePanels(projectID, what) {
            var proj = getForProject(projectID);
            _.keys(proj.panels).forEach(function (key) {
                if (key === what) {
                    proj.panels[key] = true;
                } else {
                    proj.panels[key] = false;
                }
            });
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
            isActivePage: function (projectID) {
                var proj = getForProject(projectID);
                if (_.values(proj.activePage)[0]) {
                    return _.values(proj.activePage)[0];
                } else {
                    return 'home';
                }
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

            setActivePage: function (projectID, what) {
                var proj = getForProject(projectID);
                proj.activePage[what] = what;
                return proj.activePage[what];
            },
            togglePanelState: function (projectID, what) {
                var proj = getForProject(projectID);
                proj.panels[what] = !proj.panels[what];
            },

            setPanelState: function (projectID, what, to) {
                var proj = getForProject(projectID);
                proj.panels[what] = to;
            },

            showPanel: function (projectID, what) {
                var proj = getForProject(projectID);
                return proj.panels[what];
            },

            resetPanels: function (projectID) {
                var proj = getForProject(projectID);
                proj.panels = {
                    reviews: true,
                    samples: true,
                    files: true,
                    notes: true,
                    processes: true,
                    calendar: false,
                    sideboard: false,
                    settings: false,
                    provwizard: false,
                    drafts: false,
                    emptyboard: false
                };
            },

            //Eg:1  If 'what=reviews', 'col=column1": Meaning when you split reviews
            //column 1 & 3 should be open
            //And hide all other panels except for reviews.And col3 will have sideboard open.
            //Eg: 2  If 'what=sideboard', 'col=column3"
            // hide all panels except sideboard in column2. Along with that open empty sideboard in column 3
            toggleColumns: function (projectID, what, col) {
                var proj = getForProject(projectID);
                var splitStatus = this.getSplitStatus(projectID);
                if (splitStatus) {
                    initForProject(projectID);
                } else {
                    switch (col) {
                    case 'column1':
                        proj.split.column2 = !proj.split.column2;
                        proj.split.column3 = !proj.split.column3;
                        break;
                    case 'column2':
                        proj.split.column1 = !proj.split.column1;
                        proj.split.column3 = !proj.split.column3;

                        break;
                    case 'column3':
                        proj.split.column1 = true;
                        proj.split.column2 = false;
                        proj.split.column3 = !proj.split.column3;
                        proj.emptySplitBoard = true;
                        break;
                    }
                    hidePanels(projectID, what);
                }
            },

            getSplitStatus: function (projectID) {
                var proj = getForProject(projectID);
                if (proj.expanded.sideboard === true) {
                    return false;
                } else {
                    return true;
                }
            },

            togglesideboards: function (projectID) {
                var proj = getForProject(projectID);
                proj.split.column1 = false;
                proj.split.column2 = false;
                proj.panels = {
                    reviews: false,
                    samples: false,
                    files: false,
                    notes: false,
                    processes: false,
                    calendar: false,
                    sideboard: true,
                    settings: false,
                    provwizard: false,
                    drafts: false,
                    emptyboard: true
                };
            },

            getColumn: function (projectID, col) {
                var proj = getForProject(projectID);
                return proj.split[col];
            },
            showPanelByCalendarEvent: function (projectID, what) {
                hidePanels(projectID, what);
            }
        };
    }
}(angular.module('materialscommons')));
