function DataChatController($scope, $routeParams, $rootScope, User) {
    $scope.chatMessages = [];
    $scope.sent = 0;
    $scope.me = User.u().split('@')[0]

    if ($rootScope.lastId && $routeParams.id != $rootScope.lastId) {
        $rootScope.stompClient.unsubscribe('/topic/' + $rootScope.lastId);
    }

    $scope.topic = '/topic/' + $routeParams.id;
    $rootScope.lastId = $routeParams.id;

    $rootScope.stompClient.connect("guest", "guest", function() {
        $rootScope.stompClient.subscribe($scope.topic, function(message) {
            $scope.chatMessages.push(message.body);
        });
    }, function() {}, '/');

    $scope.addConversationItem = function() {
        $rootScope.stompClient.send($scope.topic, {}, $scope.me + ': ' + $scope.conversationItem);
        $scope.conversationItem = "";
    }
}