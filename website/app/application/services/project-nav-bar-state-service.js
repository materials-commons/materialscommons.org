(function (module) {
    module.factory("navBarState", navBarStateService);

    function navBarStateService() {
        var self = this;
        self.current = {
            activePage: ""
        };

        return {
            getActiveState: function (state) {
                if (self.current.activePage !== "") {
                    return self.current.activePage;
                } else {
                    if (state.current.templateUrl.match('/home')) {
                        self.current.activePage = "home";
                    } else if (state.current.templateUrl.match('/processes')) {
                        self.current.activePage = "processes";
                    } else if (state.current.templateUrl.match('/reviews')) {
                        self.current.activePage = "reviews";
                    } else if (state.current.templateUrl.match('/samples')) {
                        self.current.activePage = "samples";
                    } else if (state.current.templateUrl.match('/notes')) {
                        self.current.activePage = "notes";
                    } else if (state.current.templateUrl.match('/files')) {
                        self.current.activePage = "files";
                    }
                    return self.current.activePage;
                }


            },

            setActiveState: function (type) {
                self.current.activePage = type;
            },

            setProject: function (project) {
                self.current.project = project;
            }
        };
    }
}(angular.module('materialscommons')));