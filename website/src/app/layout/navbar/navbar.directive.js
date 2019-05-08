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
            this.saveBetaUser = this.isBetaUser;
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
                        });
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
        this.blockUI.start('Building demo project (this may take a few seconds)...');
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
        this.user = '';
        this.isAdmin = false;
        this.isBetaUser = false;
        this.isAuthenticated = this.User.isAuthenticated();
        this.$state.go('data.home.top');
        this.mcprojstore.reset();
        this.mcprojstore.remove();
    }

    loginOrRegister() {
        this.$state.go('login');
    }

    projectSiteActive() {
        return this.$state.current.name.startsWith('project');
    }

    dataSiteActive() {
        return this.$state.current.name.startsWith('data');
    }

    switchToUser() {
        this.$mdDialog.show({
            templateUrl: 'app/modals/switch-user-dialog.html',
            controller: MCSwitchUserDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
        });
    }

    toggleBetaUser() {
        this.User.toggleBetaUser();
        this.isBetaUser = !this.isBetaUser;
    }
}

class MCSwitchUserDialogController {
    /*@ngInject*/
    constructor(User, $mdDialog, toast, mcprojstore) {
        this.User = User;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.mcprojstore = mcprojstore;
        this.email = '';
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

angular.module('materialscommons').component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponentController
});
