/*@ngInject*/
class NavbarComponentController {
    /*@ngInject*/
    constructor(User, $state, $stateParams, searchQueryText, mcstate, navbarOnChange, projectsAPI, demoProjectService,
                blockUI, toast, mcbus, $mdDialog, $timeout) {
        this.User = User;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.searchQueryText = searchQueryText;
        this.mcstate = mcstate;
        this.navbarOnChange = navbarOnChange;
        this.projectsAPI = projectsAPI;
        this.demoProjectService = demoProjectService;
        this.blockUI = blockUI;
        this.toast = toast;
        this.mcbus = mcbus;
        this.inProjectsState = $state.includes('projects');
        this.project = mcstate.get(mcstate.CURRENT$PROJECT);
        this.query = searchQueryText.get();
        this.navbarSearchText = this.inProjectsState ? 'SEARCH PROJECTS...' : 'SEARCH PROJECT...';
        if (User.isAuthenticated()) {
            this.user = User.attr().fullname;
            this.isAdmin = User.attr().admin;
            this.isBetaUser = User.attr().beta_user;
        }
        this.isAuthenticated = User.isAuthenticated();
        this.$mdDialog = $mdDialog;
        this.$timeout = $timeout;

        this.myName = 'NavbarComponentController';
    }

    $onInit() {
        this.searchQueryText.setOnChange(() => {
            this.query = this.searchQueryText.get();
        });

        this.navbarOnChange.setOnChange(() => {
            // Hack, change this later
            if (this.$stateParams.project_id) {
                this.projectsAPI.getProject(this.$stateParams.project_id).then(
                    (proj) => this.mcstate.set(this.mcstate.CURRENT$PROJECT, proj)
                );
            }
        });

        this.mcstate.subscribe(this.mcstate.CURRENT$PROJECT, this.myName, () => {
            this.project = this.mcstate.get(this.mcstate.CURRENT$PROJECT);
            this.published = this.project.datasets.filter(d => d.published);
            this.unusedSamples = this.project.samples.filter(s => s.processes.length === 1);
            this.measuredSamples = this.project.samples.filter(s => s.processes.length > 1);
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

    buildDemoProject() {
        this.blockUI.start("Building demo project (this may take a few seconds)...");
        this.demoProjectService.buildDemoProject(this.User.attr().email).then(
            () => {
                this.blockUI.stop();
                this.mcbus.send('PROJECTS$REFRESH');
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
    constructor(User, $mdDialog, toast) {
        this.User = User;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.email = "";
    }

    done() {
        this.User.switchToUser(this.email).then(
            (user) => this.User.setAuthenticated(true, user.plain()),
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
    constructor(User, $mdDialog, toast, mcapi, Restangular, templates, $state) {
        this.User = User;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.mcapi = mcapi;
        this.Restangular = Restangular;
        this.templates = templates;
        this.$state = $state;
        this.email = '';
        this.password = '';
    }

    login() {
        this.mcapi('/user/%/apikey', this.email, this.password)
            .success((u) => {
                this.$mdDialog.hide();
                this.User.setAuthenticated(true, u);
                this.Restangular.setDefaultRequestParams({apikey: this.User.apikey()});
                this.templates.getServerTemplates().then(
                    (t) => this.templates.set(t)
                );
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
                this.message = "Incorrect Password/Username!";
                this.toast.error(reason.error);
            }).put({password: this.password});
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('navbar', {
    templateUrl: 'app/global.components/navbar/navbar.html',
    controller: NavbarComponentController
});

