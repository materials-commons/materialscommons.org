/*@ngInject*/
class NavbarComponentController {
    /*@ngInject*/
    constructor(User, $state, mcbus, $stateParams, searchQueryText, demoProjectService,
                blockUI, toast, $mdDialog, mcprojstore) {
        this.User = User;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.searchQueryText = searchQueryText;
        this.demoProjectService = demoProjectService;
        this.blockUI = blockUI;
        this.toast = toast;
        this.inProjectsState = $state.includes('projects');
        this.query = searchQueryText.get();
        this.mcbus = mcbus;
        this.navbarSearchText = this.inProjectsState ? 'SEARCH PROJECTS...' : 'SEARCH PROJECT...';
        if (User.isAuthenticated()) {
            this.user = User.attr().fullname;
            this.isAdmin = User.attr().admin;
            this.isBetaUser = User.attr().beta_user;
        }
        this.isAuthenticated = User.isAuthenticated();
        this.$mdDialog = $mdDialog;
        this.mcprojstore = mcprojstore;
        this.project = this.mcprojstore.currentProject;

        this.myName = 'NavbarComponentController';
    }

    $onInit() {
        this.searchQueryText.setOnChange(() => {
            this.query = this.searchQueryText.get();
        });

        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROJECT, this.mcprojstore.EVSET, (proj) => {
            this.project = proj;
            let experiments = _.values(this.project.experiments);
            this.published = 0;
            experiments.forEach(
                e => {
                    if (e.datasets) {
                        e.datasets.forEach(d => {
                            if (d.published) {
                                this.published++;
                            }
                        })
                    }
                });
        });

        this.mcbus.subscribe('USER$NAME', this.myName, () => {
            this.user = this.User.attr().fullname;
        });

        this.mcbus.subscribe('USER$LOGIN', this.myName, () => {
            this.user = this.User.attr().fullname;
            this.isAdmin = this.User.attr().admin;
            this.isBetaUser = this.User.isBetaUser();
            this.isAuthenticated = this.User.isAuthenticated();
        });
    }

    $onDestroy() {
        this.unsubscribe();
    }

    buildDemoProject() {
        this.blockUI.start("Building demo project (this may take a few seconds)...");
        this.demoProjectService.buildDemoProject(this.User.attr().email).then(
            (p) => {
                this.mcprojstore.addProject(p);
                this.blockUI.stop();
            },
            (error) => {
                this.blockUI.stop();
                let message = `Status: ${error.status}; Message: ${error.data}`;
                this.toast.error(message, 'top right');
            }
        );
    }

    search() {
        if (this.query !== '') {
            this.$state.go('project.search', {query: this.query}, {reload: true});
        }
    }

    home() {
        this.$state.go('projects');
    }

    logout() {
        this.User.setAuthenticated(false);
        this.user = "";
        this.isAdmin = false;
        this.isBetaUser = false;
        this.isAuthenticated = this.User.isAuthenticated();
        this.$state.go('data.home.top');
        this.mcprojstore.reset();
    }

    loginOrRegister() {
        this.$mdDialog.show({
            templateUrl: 'app/global.components/navbar/login-dialog.html',
            controller: MCLoginDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        }).then(
            () => {
                this.user = this.User.attr().fullname;
                this.isAdmin = this.User.attr().admin;
                this.isBetaUser = this.User.isBetaUser();
                this.isAuthenticated = this.User.isAuthenticated();
            }
        )
    }

    projectSiteActive() {
        return this.$state.current.name.startsWith('project');
    }

    dataSiteActive() {
        return this.$state.current.name.startsWith('data');
    }

    switchToUser() {
        this.$mdDialog.show({
            templateUrl: 'app/global.components/navbar/switch-user-dialog.html',
            controller: MCSwitchUserDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        });
    }
}

class MCSwitchUserDialogController {
    /*@ngInject*/
    constructor(User, $mdDialog, toast, mcprojstore) {
        this.User = User;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.mcprojstore = mcprojstore;
        this.email = "";
    }

    done() {
        this.User.switchToUser(this.email).then(
            (user) => {
                this.User.setAuthenticated(true, user.plain());
                this.mcprojstore.reset();
            },
            () => this.toast.error(`Unable to switch to user ${this.email}`)
        );
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class MCLoginDialogController {
    /*@ngInject*/
    constructor(User, $mdDialog, toast, mcapi, Restangular, templates, $state, mcprojstore) {
        this.User = User;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.mcapi = mcapi;
        this.Restangular = Restangular;
        this.templates = templates;
        this.$state = $state;
        this.email = '';
        this.password = '';
        this.mcprojstore = mcprojstore;
    }

    login() {
        this.mcapi('/user/%/apikey', this.email, this.password)
            .success((u) => {
                this.User.setAuthenticated(true, u);
                this.Restangular.setDefaultRequestParams({apikey: this.User.apikey()});
                this.templates.getServerTemplates().then((t) => this.templates.set(t));
                this.mcprojstore.reset().then(() => this.$mdDialog.hide());
                // if (u.default_project && u.default_project !== '' && u.default_experiment && u.default_experiment !== '') {
                //     this.$state.go('project.experiment.workflow', {
                //         project_id: u.default_project,
                //         experiment_id: u.default_experiment
                //     });
                // } else if (u.default_project && u.default_project !== '') {
                //     this.$state.go('project.home', {project_id: u.default_project});
                // } else {
                //     this.$state.go('projects.list');
                // }
            })
            .error((reason) => {
                this.message = "Incorrect Username or Password.";
                this.toast.error(reason.error);
            }).put({password: this.password});
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponentController
});
