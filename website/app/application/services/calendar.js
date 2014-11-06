Application.Services.factory('calendar', ["$filter", calendarService]);

function calendarService($filter) {
    var service = {
        todayYYYYMMDDhhmm: function(date) {
            var d = date ? date : new Date();
            return $filter('date')(d, "YYYY/MM/dd:hh:mma");
        }
    };

    return service;
}
