Application.Controllers.controller('projectHome',
    ["$scope", "project", "User", "mcapi", "Events", projectHome]);

function projectHome($scope, project, User, mcapi, Events) {
    $scope.updateName = function () {
        mcapi('/users/%', $scope.mcuser.email)
            .success(function (u) {
                $scope.editFullName = false;
                User.save($scope.mcuser);
            }).put({fullname: $scope.mcuser.fullname});
    };

    $scope.project = project;
    $scope.mcuser = User.attr();
    $scope.project = Events.addConvertedTime($scope.project);

    $scope.event_reviews = {
        color: '#4884b8' ,
        events: Events.prepareCalendarEvent($scope.project.reviews)
    };
    $scope.event_notes = {
        color: '#3ea7a0' ,
        events: Events.prepareCalendarEvent($scope.project.notes)
    };
    $scope.event_processes = {
        color: '#e26a6a' ,
        events: Events.prepareCalendarEvent($scope.project.processes)
    };
    $scope.event_samples = {
        color: '#f0ad4e' ,
        events: Events.prepareCalendarEvent($scope.project.samples)
    };

    $scope.alertOnEventClick = function (date, jsEvent, view) {
        var d = date._d;
        var clicked_date = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDay());
        $scope.project = Events.updateDate($scope.project, clicked_date);
    };

    $scope.uiConfig = {
        calendar: {
            height: 450,
            editable: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            dayClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender
        }
    };
    $scope.eventSources = [$scope.event_reviews, $scope.event_notes, $scope.event_processes, $scope.event_samples];
}
