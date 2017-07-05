/*@ngInject*/
export function MCPubNavbarDirective() {
    return {
        restrict: 'E',
        templateUrl: 'app/components/navbar/mcpub-navbar.html',
        controller: MCPubNavbarDirectiveController,
        controllerAs: 'ctrl',
        bindToController: true
    };
}

class MCPubNavbarDirectiveController {
    /*@ngInject*/
    constructor(userService, $uibModal, $log, $state) {
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
