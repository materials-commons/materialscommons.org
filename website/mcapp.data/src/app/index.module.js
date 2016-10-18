import {config} from './index.config';
import {routerConfig} from './index.route';
import {runBlock} from './index.run';
import {MainController} from './main.controller.js';
import {HomeController} from './home/home.controller';
import {SignController} from '../app/components/sign/sign-controller';
import {LoginDirective} from '../app/components/sign/login/login.directive';
import {RegisterDirective} from '../app/components/sign/register/register-directive';
import {ResetPasswordDirective} from '../app/components/sign/reset/reset-password.directive'
import {SearchController} from './search/search-controller';
import {RecentDatasetsController} from './home/datasets/recent-datasets-controller';
import {TopDatasetsController} from './home/datasets/top-datasets-controller';
import {PopUpController} from './details/pop-up-controller';
import {DetailsController} from './details/details-controller';
import {BrowseController} from './browse/browse-controller';
import {TagController} from './tags/tags-controller';
import {BrowseDatasetsController} from './browse/datasets/browse-datasets-controller';
import {BrowseTagsController} from './browse/tags/browse-tags-controller';
import {BrowseAuthorsController} from './browse/authors/browse-author-controller';
import {CommentDirective} from './details/comment-directive';
import {
    DatasetDetailsOutlineController,
    mcpubDatasetDetailsOutlineDirDirective
} from './details/outline/mcpub-dataset-details-outline.component';
import {MCPubDatasetFilesListComponentController} from './details/mcpub-dataset-files-list.component';
import {MCPubProcessDetailsComponentController} from './details/outline/mcpub-process-details.component';
import {MCPubProcessDetailsSetupComponentController} from './details/outline/mcpub-process-details-setup.component';
import {DatasetDetailsSummaryDirective} from './details/mcpub-dataset-details-summary.directive';
import {DatasetDetailsOtherdsDirective} from './details/mcpub-dataset-details-otherds.directive';
import {DatasetDetailsVotesController} from './details/mcpub-dataset-details-votes.component';
import {NavbarDirective} from '../app/components/navbar/navbar.directive';
import {HomeTabDirective} from '../app/home/home-tab-directive';
import {MCPubSearchbarDirective} from '../app/directives/mcpub-searchbar.directive';
import {PropertyValueDirective} from '../app/directives/property-value-directive';
import {DisplayImageDirective} from '../app/directives/display-image-directive';
import {releaseService} from './services/release-service';
import {searchService} from './search/search-service';
import {userService} from './services/user-service';
import {actionsService} from './services/actions-service';
import {browseService} from '../app/browse/browse-service';
import {bytesFilter} from '../app/filters/bytes-filter';
import {toDateStringFilter} from '../app/filters/to-date-string-filter';
import {pubAPIService} from './services/pub-api.service';
import {mcapiService} from './services/mc-api.service';
import {AccountsService} from './services/accounts-service.service';
import {ValidateController} from './components/sign/validate/validate.controller';
import {SearchModel} from './services/search-model.service';
import {focusService} from './services/focus.service';
import {onEnterDirective} from './directives/on-enter.directive';

angular.module('mcpub', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria',
    'restangular', 'ui.router', 'ui.bootstrap', 'toastr', 'ct.ui.router.extras',
    'angularUtils.directives.dirPagination', 'RecursionHelper',
    'ngTagsInput', 'ngFileUpload'])
    .config(config)
    .config(routerConfig)
    .run(runBlock)
    .controller('MainController', MainController)
    .controller('HomeController', HomeController)
    .controller('SignController', SignController)
    .controller('SearchController', SearchController)
    .controller('RecentDatasetsController', RecentDatasetsController)
    .controller('TopDatasetsController', TopDatasetsController)
    .controller('PopUpController', PopUpController)
    .controller('DetailsController', DetailsController)
    .controller('BrowseController', BrowseController)
    .controller('TagController', TagController)
    .controller('BrowseDatasetsController', BrowseDatasetsController)
    .controller('BrowseTagsController', BrowseTagsController)
    .controller('BrowseAuthorsController', BrowseAuthorsController)
    .controller('ValidateController', ValidateController)
    .directive('mcpubNavbar', NavbarDirective)
    .directive('homeTabDirective', HomeTabDirective)
    .directive('mcpubSearchbar', MCPubSearchbarDirective)
    .directive('propertyValue', PropertyValueDirective)
    .directive('displayImage', DisplayImageDirective)
    .directive('loginDirective', LoginDirective)
    .directive('registerDirective', RegisterDirective)
    .directive('resetPasswordDirective', ResetPasswordDirective)
    .directive('commentDirective', CommentDirective)
    .directive('mcpubDatasetDetailsSummary', DatasetDetailsSummaryDirective)
    .directive('mcpubDatasetDetailsOtherds', DatasetDetailsOtherdsDirective)
    .directive('onEnter', onEnterDirective)
    .service('pubAPI', pubAPIService)
    .service('mcapi', mcapiService)
    .service('accountsService', AccountsService)
    .service('releaseService', releaseService)
    .service('searchService', searchService)
    .service('userService', userService)
    .service('actionsService', actionsService)
    .service('browseService', browseService)
    .service('searchModel', SearchModel)
    .factory('focus', focusService)
    .filter('bytesFilter', bytesFilter)
    .filter('toDateStringFilter', toDateStringFilter);

angular.module('mcpub').component('mcpubDatasetDetailsOutline', {
    templateUrl: 'app/details/outline/mcpub-dataset-details-outline.html',
    controller: DatasetDetailsOutlineController,
    bindings: {
        dataset: '<'
    }
});

angular.module('mcpub').component('mcpubDatasetFilesList', {
    templateUrl: 'app/details/mcpub-dataset-files-list.html',
    controller: MCPubDatasetFilesListComponentController,
    bindings: {
        files: '<'
    }
});

angular.module('mcpub').component('mcpubProcessDetails', {
    templateUrl: 'app/details/outline/mcpub-process-details.html',
    controller: MCPubProcessDetailsComponentController,
    bindings: {
        process: '<'
    }
});

angular.module('mcpub').component('mcpubProcessDetailsSetup', {
    templateUrl: 'app/details/outline/mcpub-process-details-setup.html',
    controller: MCPubProcessDetailsSetupComponentController,
    bindings: {
        processSetup: '<'
    }
});

angular.module('mcpub').component('mcpubDatasetDetailsVotes', {
    templateUrl: 'app/details/mcpub-dataset-details-votes.html',
    controller: DatasetDetailsVotesController,
    bindings: {
        dataset: '='
    }
});

angular.module('mcpub').component('mcpubSetupPropertyValue', {
    templateUrl: 'app/details/outline/mcpub-setup-property-value.html',
    bindings: {
        property: '<'
    }
});

angular.module('mcpub').component('mcpubDatasetOverview', {
    templateUrl: 'app/home/datasets/mcpub-dataset-overview.html',
    bindings: {
        dataset: '<'
    }
});

angular.module('mcpub').directive('mcpubDatasetDetailsOutlineDir', mcpubDatasetDetailsOutlineDirDirective);
