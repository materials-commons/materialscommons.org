angular.module('materialscommons').component('mcEditableHeader', {
    template: `
    <div layout="column" layout-align="start stretch">
        <span ng-if="!$ctrl.editField"
              ng-click="$ctrl.editField = true"
              ng-class="$ctrl.headerClasses"
              style="cursor: pointer">
            {{::$ctrl.header}}
        </span>
        <input ng-if="$ctrl.editField"
               type="text" class="mc-input-as-line"
               on-enter="$ctrl.editField = false"
               ng-model="$ctrl.header"
               ng-model-options="{debounce: 250}"
               ng-change="$ctrl.onChange && $ctrl.onChange({what: $ctrl.header})"
               ng-class="$ctrl.inputClasses"
               ng-mouseleave="$ctrl.editField = false">
    </div>
    `,
    bindings: {
        header: '=',
        headerClasses: '@',
        inputClasses: '@',
        onChange: '&'
    }
});
