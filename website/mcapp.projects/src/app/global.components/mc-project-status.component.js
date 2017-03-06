angular.module('materialscommons').component('mcProjectStatus', {
    template: `
    <div ng-switch="$ctrl.status">
        <span ng-switch-when="none" class="mc-dark-grey-color"><i class="fa fa-fw fa-circle"></i></span>
        <span ng-switch-when="flag" class="mc-flagged-color"><i class="fa fa-fw fa-flag"></i></span>
        <span ng-switch-when="important" class="mc-important-color"><i class="fa fa-fw fa-exclamation-circle"></i></span>
        <span ng-switch-when="good" class="mc-done-color"><i class="fa fa-fw fa-check"></i></span>
        <span ng-switch-default class="mc-dark-grey-color"><i class="fa fa-fw fa-circle"></i></span>
    </div>
    `,
    bindings: {
        status: '<'
    }
});
