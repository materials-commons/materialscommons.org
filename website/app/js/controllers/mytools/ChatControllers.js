function DataChatController($scope, $stateParams, $rootScope, User) {
    $scope.chatMessages = [];
    $scope.sent = 0;
    $scope.me = User.u().split('@')[0]

    if ($rootScope.lastId && $stateParams.id != $rootScope.lastId) {
        $rootScope.stompClient.unsubscribe('/topic/' + $rootScope.lastId);
    }

    $scope.topic = '/topic/' + $stateParams.id;
    $rootScope.lastId = $stateParams.id;

    $rootScope.stompClient.connect("guest", "guest", function() {
        $rootScope.stompClient.subscribe($scope.topic, function(message) {
            $scope.chatMessages.push(message.body);
        });
    }, function () {}, '/');

    $scope.addConversationItem = function () {
        $rootScope.stompClient.send($scope.topic, {}, $scope.me + ': ' + $scope.conversationItem);
        $scope.conversationItem = "";
    }
}