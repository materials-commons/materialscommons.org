export function NavbarDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/navbar/navbar.html',
        controller: NavbarController,
        controllerAs: 'ctrl',
        bindToController: true
    };

    return directive;
}

class NavbarController {
    constructor(userService, $uibModal, $log, $state) {
        'ngInject';
        this.userService = userService;
        this.$uibModal = $uibModal;
        this.$log = $log;
        this.$state = $state;
        this.navbarCollapsed = true;
    }


    logout() {
        this.userService.setAuthenticated(false);
        this.$state.go("home.top", null, {reload: true});
    }

    sign() {
        this.userService.openModal();
    }
}
