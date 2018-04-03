// source: https://docs.angularjs.org/api/ngMock/service/$httpBackend

// The module code
angular
    .module('MyApp', [])
    .controller('MyController', MyController);

// The controller code
function MyController($scope, $http) {
    var authToken;

    $http.get('/auth.py').then(function(response) {
        authToken = response.headers('A-Token');
        $scope.user = response.data;
    });

    $scope.saveMessage = function(message) {
        var headers = { 'Authorization': authToken };
        $scope.status = 'Saving...';

        $http.post('/add-msg.py', message, { headers: headers } ).then(function(response) {
            $scope.status = '';
        }).catch(function() {
            $scope.status = 'Failed...';
        });
    };
}

// testing controller
xdescribe('http call mock example', function () {
    var $httpBackend, $rootScope, createController, authRequestHandler;

    // Set up the module
    beforeEach(module('MyApp'));

    beforeEach(inject(function($injector) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        authRequestHandler = $httpBackend.when('GET', '/auth.py')
            .respond({userId: 'userX'}, {'A-Token': 'xxx'});

        // Get hold of a scope (i.e. the root scope)
        $rootScope = $injector.get('$rootScope');
        // The $controller service is used to create instances of controllers
        var $controller = $injector.get('$controller');

        createController = function() {
            return $controller('MyController', {'$scope' : $rootScope });
        };
    }));


    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should fetch authentication token', function() {
        $httpBackend.expectGET('/auth.py');
        var controller = createController();
        $httpBackend.flush();
    });


    it('should send msg to server', function() {
        var controller = createController();
        $httpBackend.flush();

        // now you don’t care about the authentication, but
        // the controller will still send the request and
        // $httpBackend will respond without you having to
        // specify the expectation and response for this request

        $httpBackend.expectPOST('/add-msg.py', 'message content').respond(201, '');
        $rootScope.saveMessage('message content');
        expect($rootScope.status).toBe('Saving...');
        $httpBackend.flush();
        expect($rootScope.status).toBe('');
    });


    it('should send auth header', function() {
        var controller = createController();
        $httpBackend.flush();

        $httpBackend.expectPOST('/add-msg.py', undefined, function(headers) {
            // check if the header was sent, if it wasn't the expectation won't
            // match the request and the test will fail
            return headers['Authorization'] === 'xxx';
        }).respond(201, '');

        $rootScope.saveMessage('whatever');
        $httpBackend.flush();
    });
});
