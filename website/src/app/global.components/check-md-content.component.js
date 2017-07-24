angular.module('materialscommons').component('checkMdContent', {
    template: `
        <md-content flex layout="column">
            <div ng-repeat="item in $ctrl.items">{{item}}</div>
        </md-content>
    `,
    controller: CheckMDContentComponentController
});

/*@ngInject*/
function CheckMDContentComponentController() {
    let ctrl = this;
    ctrl.items = [];
    for (let i = 0; i < 1000; i++) {
        ctrl.items.push(i);
    }
}
