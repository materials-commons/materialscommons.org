export function ResetPasswordDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/sign/reset/reset-password.html',
        scope: true
    };
    return directive;
}

