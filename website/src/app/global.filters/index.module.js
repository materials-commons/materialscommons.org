import { bytesFilter } from './bytes';
import { toDateStringFilter } from './todatestring-filter';

angular.module('mc.global.filters', [])
    .filter('bytes', bytesFilter)
    .filter('toDateString', toDateStringFilter);
