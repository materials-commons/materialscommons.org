class Toast {
    /*@ngInject*/
    constructor($mdToast) {
        this.$mdToast = $mdToast;
    }

    error(msg) {
        let build = this.$mdToast.simple()
            .textContent('Error: ' + msg)
            .position('top right')
            .theme('error');
        return this.$mdToast.show(build);
    }
}

angular.module('materialscommons').service('toast', Toast);
