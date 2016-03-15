import { bytesFilter } from './bytes';
import { toDateStringFilter } from './todatestring-filter';

angular.module('materialscommons')
    .filter('bytes', bytesFilter)
    .filter('toDateString', toDateStringFilter);
