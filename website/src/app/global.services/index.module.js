import { UserService } from './user.service';
import { CachedServiceFactoryService } from './cached-service-factory.service';
import { fileTypeService } from './file-type-service';
import { focusService } from './focus.service';
import { gridFiles } from './grid-files';
import { mcapiService } from './mcapi.service';
import { onChangeService } from './on-change.service';
import { previousStateService } from './previous-state.service';
import { projectsAPIService } from './projects-api.service';
import { projectsService } from './projects-service.service';
import { pubsubService } from './pubsub.service';
import { templateService } from './template.service';
import { templatesService } from './templates.service';
import { selectItemsService } from './select-items/select-items.service';
import { modelProjectsService } from './model/projects-service';
import { mcmodalService } from './mcmodal/mcmodal';
import './toast.service';
import './editoropts.service';
import './samples-service.service';
import './search-query-text.service';
import './api-service.service';


angular.module('materialscommons')
    .factory('selectItems', selectItemsService)
    .factory('User', UserService)
    .factory('CachedServiceFactory', CachedServiceFactoryService)
    .factory("fileType", fileTypeService)
    .factory('focus', focusService)
    .factory('gridFiles', gridFiles)
    .factory('mcapi', mcapiService)
    .factory('onChangeService', onChangeService)
    .factory('previousStateService', previousStateService)
    .factory('projectsAPI', projectsAPIService)
    .factory('projectsService', projectsService)
    .factory('pubsub', pubsubService)
    .factory('template', templateService)
    .factory('modelProjects', modelProjectsService)
    .factory('mcmodal', mcmodalService)
    .factory("templates", templatesService);