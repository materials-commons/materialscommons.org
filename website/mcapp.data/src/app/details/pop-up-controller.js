export class PopUpController {
  constructor(file, $uibModalInstance) {
    'ngInject';
    this.file = file;
    this.$uibModalInstance = $uibModalInstance;
  }

  ok() {
    this.$uibModalInstance.close();
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

