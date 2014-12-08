Application.Controllers.controller('projectHome',
    ["$scope", "project", "User", "mcapi", "$compile", "uiCalendarConfig", "Events", "pubsub", projectHome]);

function projectHome($scope, project, User, mcapi, $compile, uiCalendarConfig,  Events, pubsub) {
    $scope.updateName = function () {
        mcapi('/users/%', $scope.mcuser.email)
            .success(function (u) {
                $scope.editFullName = false;
                User.save($scope.mcuser);
            }).put({fullname: $scope.mcuser.fullname});
    };

    $scope.project = project;
    $scope.mcuser = User.attr();
    $scope.service = Events.classify($scope.project);
    $scope.event_reviews = {
        color: '#4884b8' ,
        events: Events.prepareCalendarEvent($scope.service.grouped_reviews)
    };
    $scope.event_notes = {
        color: '#3ea7a0' ,
        events: Events.prepareCalendarEvent($scope.service.grouped_notes)
    };
    $scope.event_processes = {
        color: '#e26a6a' ,
        events: Events.prepareCalendarEvent($scope.service.grouped_processes)
    };
    $scope.event_samples = {
        color: '#f0ad4e' ,
        events: Events.prepareCalendarEvent($scope.service.grouped_samples)
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        var d = date._d;
        var clicked_date = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDay());
        //call service to update date
        Events.updateDate(clicked_date);
        pubsub.send('clicked_date', clicked_date);
    };

    /* Change View */
    $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    /* Change View */
    $scope.renderCalender = function (calendar) {
        if (uiCalendarConfig.calendars[calendar]) {
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* Render Tooltip */
    $scope.eventRender = function (event, element, view) {
        element.attr({
            'tooltip': event.title,
            'tooltip-append-to-body': true
        });
        $compile(element)($scope);
    };
    /* config object */
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
    /* event sources array*/
    $scope.eventSources = [$scope.event_reviews, $scope.event_notes, $scope.event_processes, $scope.event_samples];
}
