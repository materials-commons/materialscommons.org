class ToastService {
    /*@ngInject*/
    constructor($mdToast) {
        this.$mdToast = $mdToast;
    }

    error(msg, position = 'top right') {
        let build = this.$mdToast.simple()
            .textContent('Error: ' + msg)
            .position(position)
            .theme('error');
        return this.$mdToast.show(build);
    }

    success(msg, position = 'top right') {
        let build = this.$mdToast.simple()
            .textContent(msg)
            .position(position)
            .theme('success-toast');
        return this.$mdToast.show(build);
    }
}

angular.module('materialscommons').service('toast', ToastService);
