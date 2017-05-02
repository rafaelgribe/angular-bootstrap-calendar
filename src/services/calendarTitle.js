'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .factory('calendarTitle', function(calendarConfig, calendarHelper) {

    function month(viewDate) {
      return calendarHelper.formatDate(viewDate, calendarConfig.titleFormats.month);
    }

    function year(viewDate) {
      return calendarHelper.formatDate(viewDate, calendarConfig.titleFormats.year);
    }

    return {
      month: month,
      year: year
    };

  });
