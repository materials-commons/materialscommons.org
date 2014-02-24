Application.Services.factory('dateGenerate',
    [ function () {
        var currentTime, day, month, year, formatted_date;
        return {
            new_date: function () {
                currentTime = new Date();
                month = currentTime.getMonth() + 1;
                day = currentTime.getDate();
                year = currentTime.getFullYear();
                formatted_date = month + "/" + day + "/" + year;
                return formatted_date;
            }
        };



    }]);