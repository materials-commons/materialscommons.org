var app = angular.module('materialscommons',
    ['ui', 'Filter', 'materialsCommonsServices', 'materialsdirective', 'jqyoui', 'AngularStomp',
        'ui.bootstrap', 'NgTree', 'ngCookies', '$strap.directives', 'ngGrid','Provenance']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider) {
    Stomp.WebSocketClass = SockJS;
    mcglobals = {};
    doConfig();

    /*
     ** CORS support
     */
    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider.
        when('/home', {templateUrl: 'partials/home.html', controller: HomeController}).
        when('/searchindex/:subpage/:name',
        {templateUrl: 'partials/search.html', controller: SearchIndexController}).

        when('/subpage-template/:tab', {templateUrl: 'partials/my-tools.html', controller: SubPageController}).
        /*
         ** Account controllers
         */
        when('/account/login', {templateUrl: 'partials/account/login.html', controller: LoginController}).
        when('/account/logout', {templateUrl: 'partials/about.html', controller: LogOutController}).
        when('/account/create-account', {templateUrl: 'partials/account/create-account.html', controller: CreateAccountController}).
        when('/account/details', {templateUrl: 'partials/account/account-details.html', controller: AccountDetailsController}).
        when('/account/details/apikey/view', {templateUrl: 'partials/account/details/apikeyview.html', controller: ApiKeyController}).
        when('/account/details/apikey/reset', {templateUrl: 'partials/account/details/apikeyreset.html', controller: ApiKeyResetController}).
        /*
         ** UserGroups controllers
         */
        when('/usergroups/my_usergroups', {templateUrl: 'partials/usergroups/my_usergroups.html', controller: ListUserGroupController}).
        when('/usergroups/create', {templateUrl: 'partials/usergroups/usergroup-create.html', controller: CreateUserGroupController}).
        when('/usergroups/list_all', {templateUrl: 'partials/usergroups/usergroups_list_all.html', controller: ListUserGroupController}).
        when('/usergroups/list_users/:usergroup_name', {templateUrl: 'partials/usergroups/usergroup_list_users.html', controller: ListUserController}).

        /*
         ** Top level controllers
         */
        when('/about', {templateUrl: 'partials/about.html', controller: AboutController}).
        when('/contact', {templateUrl: 'partials/contact.html', controller: ContactController}).
        when('/help', {templateUrl: 'partials/help.html', controller: HelpController}).
        when('/search', {templateUrl: 'partials/search.html', controller: SearchIndexController}).
        when('/my-tools', {templateUrl: 'partials/my-tools.html', controller: FrontPageController}).

        /*
         ** Controllers with in the My Tools subpages
         */

        /*
         ** Data Groups
         */
        //when('/datagroups/tree', {templateUrl: 'partials/datagroups/tree.html', controller: MyDataGroupsTreeController}).
        //when('/datagroups/tree/group', {templateUrl: 'partials/datagroups/tree.html', controller: MyGroupsDataGroupsTreeController}).
        when('/datagroups/data/:id', {templateUrl: 'partials/datagroups/datareport.html', controller: DataDirReportController}).
        //when('/datagroups',
       // {templateUrl: 'partials/datagroups/my_data_groups.html', controller: MyDataGroupsController}).
        //when('/datagroupgrid', {templateUrl: 'partials/thumbnail.html', controller: DataGroupGridController}).


        /*
         ** Other
         */
        when('/my_lab', {templateUrl: 'partials/datagroups/my_lab.html', controller: LabController}).
        when('/results_by_date',
        {templateUrl: 'partials/datagroups/results_by_date.html', controller: SearchByDateController}).

        /*
         ** Data
         */
        when('/data/edit/:id', {templateUrl: 'partials/data/data-edit.html', controller: DataEditController}).
        //when('/data/mydata', {templateUrl: 'partials/data/my-data.html', controller: MyDataController}).

        /*
         ** Tags
         */
        //when('/tags/list/:listtype', {templateUrl: 'partials/tags/tags-list.html', controller: AllTagsController}).
        when('/tags/data/bytag/:tag/:user',
        {templateUrl: 'partials/tags/data-for-tag.html', controller: TagDataController}).
        when('/tags/tag_info/:tag_name', {templateUrl: 'partials/tags/tag_info.html', controller: AllTagsController}).
        //when('/tags/cloud/global', {templateUrl: 'partials/tags/tagcloud.html', controller: GlobalTagCloudController}).

        /*
         ** Upload/Download
         */
        when('/upload/file', {templateUrl: 'partials/updownload/upload-file.html', controller: UploadFileController}).
        when('/upload/directory', {templateUrl: 'partials/updownload/upload-directory.html', controller: UploadDirectoryController}).
        when('/updownload/queue', {templateUrl: 'partials/updownload/udqueue.html', controller: UpDownLoadQueueController}).
        /*
        ** Conditions
         */
        //when('/conditions/template/create', {templateUrl: 'partials/conditions/create-condition-template.html', controller: CreateConditionControllers}).
        when('/conditions/template/list', {templateUrl: 'partials/conditions/list-condition-template.html', controller: ListConditionControllers}).
        when('/provenance', {templateUrl: 'partials/provenance.html', controller: ProvenanceController}).
        when('/conditions/template-report/:id', {templateUrl: 'partials/conditions/template-report.html', controller: TemplateReportController}).

        otherwise({redirectTo: '/home'});
}]);

app.run(function ($rootScope, $location, $cookieStore, User, ngstomp) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (matchesPartial(next, "partials/front-page", "HomeController")) {
            setActiveMainNav("#home-nav");
        }
        else if (matchesPartial(next, "partials/my-tools", "FrontPageController")) {
            setActiveMainNav("#user-nav");
        }
        else if (matchesPartial(next, "partials/explore", "ExploreController")) {
            setActiveMainNav("#explore-nav");
        }
        else if (matchesPartial(next, "partials/about", "AboutController")) {
            setActiveMainNav('#about-nav');
        }
        else if (matchesPartial(next, "partials/contact", "ContactController")) {
            setActiveMainNav('#contact-nav');
        }
        else if (matchesPartial(next, "partials/help", "HelpController")) {
            setActiveMainNav("#help-nav");
        }

        if (!$rootScope.stompClient) {
            var chatConnection = "http://" + document.location.hostname + ":15674/stomp";
            if (document.location.hostname == "materialscommons.org") {
                chatConnection = "https://materialscommons.org:55674/stomp";
            }

            $rootScope.stompClient = ngstomp(chatConnection);
        }

        if (mcglobals.bypasslogin) {
            if (mcglobals.username) {
                User.setAuthenticated(true, mcglobals.apikey, mcglobals.username);
                $rootScope.email_address = mcglobals.username;
            }
            return;
        }

        if (!User.isAuthenticated()) {
            if (next.templateUrl && next.templateUrl.indexOf("partials/my-tools") != -1) {
                $location.path("/account/login");
            }
        }
        else {
            $rootScope.email_address = User.u();
        }
    });

});

function matchesPartial(next, what, controller) {
    if (!next.templateUrl) {
        return false;
    }
    else {
        var value = next.templateUrl.indexOf(what) != -1;
        /*
         Hack to look at controller name to figure out tab. We do this so that partials can be
         shared by controllers, but we need to show which tab is active. So, we look at the
         name of the controller (only if controller != 'ignore').
         */
        if (controller == "ignore") {
            return value;
        }
        else if (value) {
            return true;
        }
        else {
            return next.controller.toString().indexOf(controller) != -1;
        }
    }
}
