export class MainController {
    constructor($state) {
        'ngInject';

        $state.go('home.top');
    }
}
