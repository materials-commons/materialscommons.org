/*@ngInject*/
export function setupViewController(template, $modalInstance) {
    const ctrl = this;

    ctrl.dismiss = dismiss;
    ctrl.template = template.create();
    ctrl.properties = ctrl.template.setup.settings[0].properties;

    function dismiss() {
        $modalInstance.dismiss('cancel');
    }
}
