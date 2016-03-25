angular.module('materialscommons').component('checkMdContent', {
    template: `
    <div layout="column" flex>
        <div>Hello there from directive<div>
        <md-content flex>
            <div ng-repeat="item in $ctrl.items">{{item}}</div>
        </md-content>
    </div>
    `,
    controller: CheckMDContentComponentController
});

/*@ngInject*/
function CheckMDContentComponentController() {
    let ctrl = this;
    ctrl.items = [];
    console.log('showing numbers');
    for (let i = 0; i < 1000; i++) {
        ctrl.items.push(i);
    }
}
