function UserfunctionController($scope, Mcdb){
    $scope.mcdb = Mcdb.db();

    $scope.mcdb.query("materialscommons-app","tags_by_count", {group_level:1}).success(function(){
        if ($scope.mcdb.rows.length > 0) {
            $scope.word_list = [];
            angular.forEach($scope.mcdb.rows, function(row){
                $scope.word_list.push({text: row.key[0], weight: row.value, link: "http://localhost:5984/materialscommons/_design/materialscommons-app/index.html#/tags/data/bytag/"+row.key[0]+"/esitzmann"});

            });
        }
    });
}

/*
$scope.word_list = [
    {text: "Lorem", weight: 15},
    {text: "Ipsum", weight: 9, link: "http://jquery.com/"},
    {text: "Dolor", weight: 6, html: {title: "I can haz any html attribute"}},
    {text: "Sit", weight: 7},
    {text: "Amet", weight: 5}

];
    */