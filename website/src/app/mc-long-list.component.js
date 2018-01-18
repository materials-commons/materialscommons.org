class MCLongListComponentController {
    constructor() {
        this.stuff = [];
        for (let i = 0; i < 1000; i++) {
            this.stuff.push({content: `item number ${i}`});
        }
    }
}

angular.module('materialscommons').component('mcLongList', {
    controller: MCLongListComponentController,
    template: `
<md-content flex layout="column">
    <ul>
        <li ng-repeat="item in $ctrl.stuff">{{item.content}}</li>
    </ul>
</md-content>
    `
});