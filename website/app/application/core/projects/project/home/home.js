Application.Controllers.controller('projectHome',
    ["$scope", "project", "User", "mcapi", "$compile", "uiCalendarConfig", "$filter","calendarEvents", projectHome]);

function projectHome($scope, project, User, mcapi, $compile, uiCalendarConfig, $filter, calendarEvents) {
    $scope.updateName = function () {
        mcapi('/users/%', $scope.mcuser.email)
            .success(function (u) {
                $scope.editFullName = false;
                User.save($scope.mcuser);
            }).put({fullname: $scope.mcuser.fullname});
    };

    $scope.project = project;
    $scope.mcuser = User.attr();

    $scope.eventSource = {};
    var reviews = [];
    var samples = [];
    var notes = [];
    var processes = [];
    reviews = $filter("byKey")($scope.project.events, 'item_type', 'review');
    samples = $filter("byKey")($scope.project.events, 'item_type', 'sample');
    notes = $filter("byKey")($scope.project.events, 'item_type', 'note');
    processes = $filter("byKey")($scope.project.events, 'item_type', 'provenance');
    processes.push($filter("byKey")($scope.project.events, 'item_type', 'draft'));
    processes = _.flatten(processes);
    $scope.event_reviews = {
        color: '#4884b8' ,
        events: calendarEvents.groupEventsByDate(reviews)
    };
    $scope.event_notes = {
        color: '#3ea7a0' ,
        events: calendarEvents.groupEventsByDate(notes)
    };
    $scope.event_processes = {
        color: '#e26a6a' ,
        events: calendarEvents.groupEventsByDate(processes)
    };
    $scope.event_samples = {
        color: '#f0ad4e' ,
        events: calendarEvents.groupEventsByDate(samples)
    };

    /* alert on eventClick */
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        console.log(date._d);
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
    $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
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
