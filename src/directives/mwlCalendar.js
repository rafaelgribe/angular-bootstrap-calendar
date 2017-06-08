'use strict';

var angular = require('angular');
var LOG_PREFIX = 'Bootstrap calendar:';

angular
  .module('mwl.calendar')
  .controller('MwlCalendarCtrl', function($scope, $log, $timeout, $attrs, moment, calendarTitle, calendarHelper) {

    var vm = this;

    vm.changeView = function(view, newDay) {
      vm.view = view;
      vm.viewDate = newDay;
    };

    vm.dateClicked = function(date) {

      var rawDate = moment(date).toDate();

      var nextView = {
        year: 'month',
        month: 'day',
        week: 'day'
      };

      if (vm.onViewChangeClick({calendarDate: rawDate, calendarNextView: nextView[vm.view]}) !== false) {
        vm.changeView(nextView[vm.view], rawDate);
      }

    };

    vm.$onInit = function() {
      vm.events = vm.events || [];

      var previousDate = moment(vm.viewDate);
      var previousView = vm.view;

      function checkEventIsValid(event) {
        if (!event.startsAt) {
          $log.warn(LOG_PREFIX, 'Event is missing the startsAt field', event);
        } else if (event.startsAt instanceof moment) {
          event.startsAt = new Date(event.startsAt.format('YYYY-MM-DDTHH:mm:ss'));
        } else if (!angular.isDate(event.startsAt)) {
          $log.warn(LOG_PREFIX, 'Event startsAt should be a javascript date or moment object.', event);
        }

        if (event.endsAt) {
          if (event.endsAt instanceof moment) {
            event.endsAt = new Date(event.endsAt.format('YYYY-MM-DDTHH:mm:ss'));
          } else if (!angular.isDate(event.endsAt)) {
            $log.warn(LOG_PREFIX, 'Event endsAt should be a javascript date or moment object.', event);
          }
          if (moment(event.startsAt).isAfter(moment(event.endsAt))) {
            $log.warn(LOG_PREFIX, 'Event cannot start after it finishes', event);
          }
        }
      }

      function refreshCalendar() {

        if (calendarTitle[vm.view] && angular.isDefined($attrs.viewTitle)) {
          vm.viewTitle = calendarTitle[vm.view](vm.viewDate);
        }

        vm.events.forEach(function(event, index) {
          checkEventIsValid(event);
          event.calendarEventId = index;
        });

        //if on-timespan-click="calendarDay = calendarDate" is set then don't update the view as nothing needs to change
        var currentDate = moment(vm.viewDate);
        var shouldUpdate = true;
        if (
          previousDate.clone().startOf(vm.view).isSame(currentDate.clone().startOf(vm.view)) &&
          !previousDate.isSame(currentDate) &&
          vm.view === previousView
        ) {
          shouldUpdate = false;
        }
        previousDate = currentDate;
        previousView = vm.view;

        if (shouldUpdate) {
          // a $timeout is required as $broadcast is synchronous so if a new events array is set the calendar won't update
          $timeout(function() {
            $scope.$broadcast('calendar.refreshView');
          });
        }
      }

      calendarHelper.loadTemplates().then(function() {
        vm.templatesLoaded = true;

        // Refresh the calendar when any of these variables change.
        $scope.$watchGroup([
          'vm.viewDate',
          'vm.view',
        ], function(newVal, oldVal) {
          if (newVal !== oldVal) {
            refreshCalendar();
          }
        });

        $scope.$watch('vm.events', function(newVal, oldVal) {
          if (!angular.equals(newVal, oldVal)) {
            refreshCalendar();
          }
        }, true);

      }).catch(function(err) {
        $log.error('Could not load all calendar templates', err);
      });

    };

    if (angular.version.minor < 5) {
      vm.$onInit();
    }

  })
  .directive('mwlCalendar', function() {

    return {
      template: '<div mwl-dynamic-directive-template name="calendar" overrides="vm.customTemplateUrls"></div>',
      restrict: 'E',
      scope: {
        events: '=',
        view: '=',
        viewTitle: '=?',
        viewDate: '=',
        customTemplateUrls: '=?',
        draggableAutoScroll: '=?',
        onEventClick: '=',
        onEventTimesChanged: '=',
        onTimespanClick: '=',
        onDateRangeSelect: '=?',
        onViewChangeClick: '&',
        cellModifier: '&',
        dayViewStart: '@',
        dayViewEnd: '@',
        dayViewSplit: '@',
        dayViewEventChunkSize: '@',
        dayViewEventWidth: '@',
        templateScope: '=?',
        dayViewTimePosition: '@',
        today: '='
      },
      controller: 'MwlCalendarCtrl as vm',
      bindToController: true
    };

  });
