/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:11 PM
 * To change this template use File | Settings | File Templates.
 */

var Filter = angular.module('Filter', []);

Filter.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

Filter.filter('matchDates', function() {
    return function( search_results, start_end_dates ) {
        var arrayToReturn = [];
        utc_start_date =  Date.parse(start_end_dates[0])/1000;
        utc_end_date =  Date.parse(start_end_dates[1])/1000;
            for (var i=0; i< search_results.length; i++){
            if ( (search_results[i].key[1] == start_end_dates[2]) && (search_results[i].key[0] > utc_start_date) && (search_results[i].key[0] < utc_end_date)) {
                arrayToReturn.push(search_results[i]);
            }
        }

        return arrayToReturn;

    };
});

Filter.filter('private', function(){
   return function(list){
       //console.log('entered filetr');
       var return_array = [];
       for (i=0; i< list.length; i++){
           if (list[i].value.access == "private"){
               return_array.push(list[i]);
           }
       }
       return return_array;
   };

});

Filter.filter('public', function(){
    return function(list){
        //console.log('entered filetr');
        var return_array = [];
        for (i=0; i< list.length; i++){
            if (list[i].value.access == "public"){
                return_array.push(list[i]);
            }
        }
        return return_array;
    };

});

Filter.filter('data_by_user', function(){
    return function(list, user){
        var return_array = [];
        for(i=0; i< list.length;i++){
            if (list[i].key[0] == "esitzman"){
                return_array.push(list[i]);
            }
        }
        return return_array;

    }
})

