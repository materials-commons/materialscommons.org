'use strict';


function LoginController($scope, $location, $timeout, cornercouch, User, $rootScope) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.alerts = [];
    $scope.failedLogin = false;
    $scope.successfulLogin = false;
    //$rootScope.me = User.get_username();
    //$rootScope.user_name = 'Login'

    $scope.login = function () {
        $scope.mcdb.query("materialscommons-app", "mcusers_by_email", {key: $scope.email})
            .success(function () {
                if ($scope.mcdb.rows.length > 0) {
                    console.log("Comparing passwords");
                    var db_password = $scope.mcdb.rows[0].value.password;
                    if (db_password == $scope.password) {
                        console.log("Inside of check");
                        $rootScope.email_address = $scope.mcdb.rows[0].value.email;
                        User.setAuthenticated(true, $scope.email);
                        //flash("Logged in");
                        $scope.failedLogin = false;
                        $scope.successfulLogin = true;
                        //$scope.me = User.get_username();
                        $location.path('/user_functions');
                        //$timeout(function() {
                        //  $location.path("#/partials/user_functions/");
                        //}, 2000);
                    } else {
                        $scope.failedLogin = true;
                    }
                } else {
                    $scope.failedLogin = true;
                }
            })
            .error(function () {
                console.log("Query Failed!!!");
            });
    }

    $scope.cancel = function () {
        $location.path("/home");
    }

    $scope.closeAlert = function () {
        $scope.alerts.splice(0, 1);
    }

    $scope.get_user_name = function () {
        $scope.user = User.get_username;
        console.log($scope.user);

    }

}

function LogOutController($scope, $rootScope, User) {
    $rootScope.email_address = '';
    User.setAuthenticated(false, '');
}

function AccountController($scope, $rootScope, $routeParams, cornercouch, $location, flash) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.create_account = function () {
        //console.log($scope.user_name) ;
        $scope.new_account = $scope.mcdb.newDoc();
        $scope.new_account.password = $scope.password;
        //$scope.new_account.confirm_password =   $scope.confirm_password;
        $scope.new_account.email = $scope.email;
        //$scope.new_account.confirm_email = $scope.confirm_email;
        $scope.new_account.type = 'mcuser';
        $scope.mcdb.query("materialscommons-app", "mcusers_by_email", {key: $scope.email}).success(function () {
            if ($scope.mcdb.rows.length > 0) {
                alert('Account has already been created using ' + $scope.email);
                $location.path('/create-account');
            }
            else {
                if (($scope.password == $scope.confirm_password) && ($scope.email == $scope.confirm_email)) {
                    $scope.new_account.save();
                    flash("Account Created");
                    $location.path('/login');
                }
                else {
                    alert("Unable to Create Your Account. Confirmation is being entered incorrectly");
                    $location.path('/create-account');
                }

            }
        });
    }
}

function MessagesController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "recent_events");
}

function ChartController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.chart_data = $scope.mcdb.getDoc("942ecdf121a6f788cc86a10a7e3e8ab6");
}

function FrontPageController($scope, $routeParams, $location, ngstomp, cornercouch) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function () {
        $location.path("/searchindex/search_key/" + $scope.keyword);
    }

//    $scope.server = cornercouch();
//    $scope.server.session();
//    $scope.server.login("testuser", "testing").success(function () {
//        console.log("success");
//    }).error(function () {
//            console.log("in error");
//        });

//    users.create('testuser', 'testing', {roles: ['example']}, function (err) {
//        if (err) {
//            console.log("Error adding user");
//            console.dir(err);
//        }
//    });


//    users.list(function (err, list) {
//        if (err) {
//            console.log("Error retrieving users");
//        }
//        else {
//            console.log("Users: ");
//            console.dir(list);
//        }
//    });

//    $scope.client = ngstomp('http://localhost:15674/stomp');
//    $scope.client.connect("guest", "guest", function(){
//        $scope.client.subscribe("/topic/test", function(message) {
//            $scope.messages.push(message.body);
//            if ($scope.sent == 0) {
//                $scope.client.send("/topic/test", {}, "from AngularStomp");
//                $scope.sent = 1;
//            }
//        });
//    }, function(){}, '/');

}

function HomeController($scope, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");

    $scope.mcdb.query("materialscommons-app", "news_by_date", {descending: true});
}


function DataSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ModelsSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ExploreController($scope, $routeParams) {
    $scope.pageDescription = "Explore";
    $scope.rowCollection = [
        {id: 0, firstName: 'Laurent', lastName: 'Renard', birthDate: new Date('1987-05-21'), balance: 102, email: 'laurent34azerty@gmail.com', nested: {value: 2323}},
        {id: 1, firstName: 'Blandine', lastName: 'Faivre', birthDate: new Date('1987-04-25'), balance: -2323.22, email: 'laurent34azerty@gmail.com', nested: {value: 123}},
        {id: 2, firstName: 'Francoise', lastName: 'Frere', birthDate: new Date('1955-08-27'), balance: 42343, email: 'laurent34azerty@gmail.com', nested: {value: 565}}
    ];

    for (var i = 0; i < $scope.rowCollection.length; i++) {
        var obj = $scope.rowCollection[i];
        obj.id = i;
    }

    $scope.columnCollection = [
        {label: 'id', map: 'id', isEditable: true},
        {label: 'FirsName', map: 'firstName'},
        {label: 'LastName', map: 'lastName', isSortable: false},
        {label: 'birth date', map: 'birthDate', formatFunction: 'date', type: 'date'},
        {label: 'balance', map: 'balance', isEditable: true, type: 'number', formatFunction: 'currency', formatParameter: '$'},
        {label: 'email', map: 'email', type: 'email', isEditable: true},
        {label: 'nested', map: 'nested.value', formatFunction: 'currency', formatParameter: '$', type: 'number', isEditable: true}
    ];

    $scope.globalConfig = {
        isPaginationEnabled: true,
        isGlobalSearchActivated: true,
        itemsByPage: 10,
        selectionMode: 'single'
    };
}

function AboutController($scope, $routeParams, $rootScope, uploadService) {
    $scope.pageDescription = "About";

    // 'files' is an array of JavaScript 'File' objects.
    $scope.files = [];

    $scope.$watch('files', function (newValue, oldValue) {
        // Only act when our property has changed.
        if (newValue != oldValue) {
            console.log('Controller: $scope.files changed. Start upload.');
            for (var i = 0, length = $scope.files.length; i < length; i++) {
                // Hand file off to uploadService.
                uploadService.send($scope.files[i]);
            }
        }
    }, true);

    $rootScope.$on('upload:loadstart', function () {
        console.log('Controller: on `loadstart`');
    });

    $rootScope.$on('upload:error', function () {
        console.log('Controller: on `error`');
    });


}

function ContactController($scope, $routeParams) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope, $routeParams) {
    $scope.pageDescription = "Help";
}


//Test Javascript to access keys
function AccessController($scope, $routeParams, cornercouch) {

    $scope.search_doc = function () {
        $scope.server = cornercouch();
        $scope.server.session();
        $scope.mcdb = $scope.server.getDB("angularphonecat");
        $scope.doc = $scope.mcdb.getDoc("86e8234752cca516c8b8ecdd68004122");
        //console.log($scope.doc);
    }
}


function DataGroupController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.list = $scope.mcdb.query("materialscommons-app", "all_experiments");

}
