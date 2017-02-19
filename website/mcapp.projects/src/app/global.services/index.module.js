import { UserService } from './user.service';
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
import { mcmodalService } from './mcmodal/mcmodal';
import './toast.service';
import './editoropts.service';
import './samples-service.service';
import './search-query-text.service';
import './api-service.service';
import './select-items/mc-files-select.component';
import './select-items/mc-files-table-select.component';
import './select-items/select-items-processes';
import './select-items/select-items-samples';
import './isimage.service';
import './differencebyid.service';
import './removebyid.service';
import './show-sample-service.service';
import './show-file-service.service';
import './navbar-on-change.service';
import './processes-service.service';
import './process-tree.service';
import './process-graph.service';
import './mcbus.service';
import './mcstate.service';
import './select-items/select-items.service';
import './show/mcshow.service';
import './demo-project.service';

angular.module('materialscommons')
    .factory('User', UserService)
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
    .factory('mcmodal', mcmodalService)
    .factory("templates", templatesService);