angular.module('materialscommons').component('mcProcessDetailsRoSetupPropertyValue', {
    template: `
    <div ng-switch="$ctrl.property.otype">
        <div ng-switch-when="selection">{{$ctrl.property.value.name ? $ctrl.property.value.name : $ctrl.property.value}}</div>
        <div ng-switch-default>
            {{$ctrl.property.value}} <span ng-if="$ctrl.property.unit !== ''"> {{$ctrl.property.unit}}</span>
        </div>
    </div>
    `,
    bindings: {
        property: '<'
    }
});
