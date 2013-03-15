
function MyFormsController($scope, $routeParams, $location, cornercouch) {
    $scope.newitems = [];
    $scope.choices = [
        {type:"text", title:"", id:1},
        {type:"number", title:"number", id:2},
        {type:"date", title:"date", id:3},
        {type: "url", title:"url", id:4}
    ];

    $scope.itemtitle = null;

    $scope.newItemDropped = function(event, ui) {
//        for (var i = 0; i < $scope.choices.length; i++) {
//            console.log("choices[" + i + "] =");
//            console.dir($scope.choices[i]);
//        }
//
//        for (var i = 0; i < $scope.newitems.length; i++) {
//            console.log("newitems[" + i + "] =");
//            console.dir($scope.newitems[i]);
//        }

        console.log($scope.itemtitle);
        if ($scope.itemtitle != null) {
            $scope.newitems[$scope.newitems.length-1].title = $scope.itemtitle;
            $scope.itemtitle = null;
        }

        addItemBack();
    }

    function addItemBack() {
        var sawText = sawNumber = sawDate = sawUrl = false;

        for (var i = 0; i < $scope.choices.length; i++) {
            switch ($scope.choices[i].type) {
                case "text":
                    sawText = true;
                    break;
                case "number":
                    sawNumber = true;
                    break;
                case "date":
                    sawDate = true;
                    break;
                case "url":
                    sawUrl = true;
                    break;
            }
        }

        if (! sawText) {
            $scope.choices.splice(0,0, {type:"text", title:"text", id:1});
        }
        else if (! sawNumber) {
            $scope.choices.splice(1,0, {type:"number", title:"number", id:2});
        }
        else if (! sawDate) {
            $scope.choices.splice(1,0, {type:"date", title:"date", id:3});
        }
        else if (! sawUrl) {
            $scope.choices.splice(1,0, {type:"url", title:"url", id:4});
        }
    }
}