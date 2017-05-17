export function LoginDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/sign/login/login.html',
        scope: true
    };
    return directive;
}


