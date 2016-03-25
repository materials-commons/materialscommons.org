angular.module('materialscommons').component('checkMdContent', {
    template: `
    <div ng-if="$ctrl.show">
        Hello there
        <md-content>
            <div ng-repeat="item in $ctrl.items">{{item}}</div>
        </md-content>
    </div>
    `,
    controller: CheckMDContentComponentController,
    bindings: {
        show: '<'
    }
});

/*@ngInject*/
function CheckMDContentComponentController() {
    let ctrl = this;
    ctrl.items = [];
    if (ctrl.show) {
        console.log('showing numbers');
        for (let i = 0; i < 1000; i++) {
            ctrl.items.push(i);
        }
    }
}
