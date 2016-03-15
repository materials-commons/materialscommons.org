import { measurementsService } from './processes/measurements.service';
import { processTemplates } from './processes/process-templates.service';

angular.module('mc.model', [])
    .factory('measurements', measurementsService)
    .factory("processTemplates", processTemplates);
