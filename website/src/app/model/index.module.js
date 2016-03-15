import { measurementsService } from './processes/measurements.service';
import { processTemplates } from './processes/process-templates.service';

angular.module('materialscommons')
    .factory('measurements', measurementsService)
    .factory("processTemplates", processTemplates);
