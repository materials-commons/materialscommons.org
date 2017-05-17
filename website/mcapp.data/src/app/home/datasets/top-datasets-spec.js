'use strict';

describe('controllers', function () {
    let ctrl;

    beforeEach(angular.mock.module('mcpub'));

    beforeEach(angular.mock.module('mock.top-datasets'));

    beforeEach(inject(function ($controller) {
        ctrl = $controller('TopDataSetsController', {datasets: [{}, {}]})
    }));
});
