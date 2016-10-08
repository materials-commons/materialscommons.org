export function DatasetDetailsOtherdsDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/details/mcpub-dataset-details-otherds.html',
    scope: {
      dataset: "="
    },
    controller: DatasetDetailsOtherdsController,
    controllerAs: 'ctrl',
    bindToController: true
  };
  return directive;
}

class DatasetDetailsOtherdsController {

  constructor(userService) {
    'ngInject';
    this.user = userService.u();
  }
}
