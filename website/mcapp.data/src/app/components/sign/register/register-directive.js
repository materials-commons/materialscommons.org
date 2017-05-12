export function RegisterDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/sign/register/register.html',
        scope: true
    };
    return directive;
}
