'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .factory('calendarEventTitle', function(calendarDateFilter) {

    function yearView(event) {
      return event.title + ' (' + calendarDateFilter(event.startsAt, 'datetime', true) + ')';
    }

    function monthView(event) {
      return event.title + ' (' + calendarDateFilter(event.startsAt, 'time', true) + ')';
    }

    function monthViewTooltip(event) {
      return calendarDateFilter(event.startsAt, 'time', true) + ' - ' + event.title;
    }

    return {
      yearView: yearView,
      monthView: monthView,
      monthViewTooltip: monthViewTooltip,
    };

  });
