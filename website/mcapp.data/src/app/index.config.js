export function config($logProvider, toastrConfig, RestangularProvider, $windowProvider, tagsInputConfigProvider) {
    'ngInject';
    // Enable log
    $logProvider.debugEnabled(true);
    var $window = $windowProvider.$get();

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 750;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    //
    tagsInputConfigProvider.setDefaults('tagsInput', {
        placeholder: 'Type here to add tags; end with return.'
    });

    //set the base url for api calls on RESTful services
    var apiBaseUrl = $window.location.protocol + "//" + $window.location.hostname + ':' + $window.location.port + '/api';

    RestangularProvider.setBaseUrl(apiBaseUrl);
}
