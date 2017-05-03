'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCalendarMonthCtrl', function($scope, moment, calendarHelper, calendarConfig, calendarEventTitle) {

    var vm = this;
    vm.calendarConfig = calendarConfig;
    vm.calendarEventTitle = calendarEventTitle;
    vm.openRowIndex = null;

    $scope.$on('calendar.refreshView', function() {

      vm.weekDays = calendarHelper.getWeekDayNames();

      var monthView = calendarHelper.getMonthView(vm.events, vm.viewDate, vm.cellModifier);
      vm.view = monthView.days;
      vm.monthOffsets = monthView.rowOffsets;

    });

    vm.dayClicked = function(day, dayClickedFirstRun, $event) {

      if (!dayClickedFirstRun && vm.onTimespanClick) {
        vm.onTimespanClick(day.date.toDate(), day, $event);
        if ($event && $event.defaultPrevented) {
          return;
        }
      }

    };

    vm.highlightEvent = function(event, shouldAddClass) {

      vm.view.forEach(function(day) {
        delete day.highlightClass;
        delete day.backgroundColor;
        if (shouldAddClass) {
          var dayContainsEvent = day.events.indexOf(event) > -1;
          if (dayContainsEvent) {
            day.backgroundColor = event.color ? event.color.secondary : '';
          }
        }
      });

    };

    vm.handleEventDrop = function(event, newDayDate, draggedFromDate) {

      var newStart = moment(event.startsAt)
        .year(moment(newDayDate).year())
        .month(moment(newDayDate).month())
        .date(moment(newDayDate).date());

      var newEnd = calendarHelper.adjustEndDateFromStartDiff(event.startsAt, newStart, event.endsAt);

      vm.onEventTimesChanged(
        event,
        newDayDate,
        newStart.toDate(),
        newEnd ? newEnd.toDate() : null,
        draggedFromDate
      );
    };

    vm.getWeekNumberLabel = function(day) {
      var weekNumber = day.date.clone().add(1, 'day').isoWeek();
      if (typeof calendarConfig.i18nStrings.weekNumber === 'function') {
        return calendarConfig.i18nStrings.weekNumber({weekNumber: weekNumber});
      } else {
        return calendarConfig.i18nStrings.weekNumber.replace('{week}', weekNumber);
      }
    };

    vm.onDragSelectStart = function(day) {
      if (!vm.dateRangeSelect) {
        vm.dateRangeSelect = {
          startDate: day.date,
          endDate: day.date
        };
      }
    };

    vm.onDragSelectMove = function(day) {
      if (vm.dateRangeSelect) {
        vm.dateRangeSelect.endDate = day.date;
      }
    };

    vm.onDragSelectEnd = function(day) {
      vm.dateRangeSelect.endDate = day.date;
      if (vm.dateRangeSelect.endDate > vm.dateRangeSelect.startDate) {
        vm.onDateRangeSelect({
          calendarRangeStartDate: vm.dateRangeSelect.startDate.clone().startOf('day').toDate(),
          calendarRangeEndDate: vm.dateRangeSelect.endDate.clone().endOf('day').toDate()
        });
      }
      delete vm.dateRangeSelect;
    };

  })
  .directive('mwlCalendarMonth', function() {

    return {
      template: '<div mwl-dynamic-directive-template name="calendarMonthView" overrides="vm.customTemplateUrls"></div>',
      restrict: 'E',
      require: '^mwlCalendar',
      scope: {
        events: '=',
        viewDate: '=',
        onEventClick: '=',
        onEventTimesChanged: '=',
        onDateRangeSelect: '=',
        onTimespanClick: '=',
        cellModifier: '=',
        slideBoxDisabled: '=',
        customTemplateUrls: '=?',
        templateScope: '=',
        draggableAutoScroll: '='
      },
      controller: 'MwlCalendarMonthCtrl as vm',
      link: function(scope, element, attrs, calendarCtrl) {
        scope.vm.calendarCtrl = calendarCtrl;
      },
      bindToController: true
    };

  });
