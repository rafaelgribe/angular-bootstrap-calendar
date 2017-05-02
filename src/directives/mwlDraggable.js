'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlDraggableCtrl', function($element, $scope, $window, $parse, $attrs, $timeout, interact) {

    if (!interact) {
      return;
    }

    var snap, snapGridDimensions;
    if ($attrs.snapGrid) {
      snapGridDimensions = $parse($attrs.snapGrid)($scope);
      snap = {
        targets: [
          interact.createSnapGrid(snapGridDimensions)
        ]
      };
    }

    function translateElement(elm, transformValue) {
      return elm
        .css('-ms-transform', transformValue)
        .css('-webkit-transform', transformValue)
        .css('transform', transformValue);
    }

    var autoScroll = $parse($attrs.autoScroll)($scope);
    if (typeof autoScroll === 'undefined') {
      autoScroll = true;
    }

    interact($element[0]).draggable({
      autoScroll: autoScroll,
      snap: snap,
      onstart: function(event) {
        angular.element(event.target).addClass('dragging-active');
        event.target.dropData = $parse($attrs.dropData)($scope);
        event.target.style.pointerEvents = 'none';
        if ($attrs.onDragStart) {
          $parse($attrs.onDragStart)($scope);
          $scope.$apply();
        }
      },
      onmove: function(event) {

        var elm = angular.element(event.target);
        var x = (parseFloat(elm.attr('data-x')) || 0) + (event.dx || 0);
        var y = (parseFloat(elm.attr('data-y')) || 0) + (event.dy || 0);

        switch ($parse($attrs.axis)($scope)) {
          case 'x':
            y = 0;
            break;

          case 'y':
            x = 0;
            break;

          default:
        }

        if ($window.getComputedStyle(elm[0]).position === 'static') {
          elm.css('position', 'relative');
        }

        translateElement(elm, 'translate(' + x + 'px, ' + y + 'px)')
          .css('z-index', 50)
          .attr('data-x', x)
          .attr('data-y', y);

        if ($attrs.onDrag) {
          $parse($attrs.onDrag)($scope, {x: x, y: y});
          $scope.$apply();
        }

      },
      onend: function(event) {

        var elm = angular.element(event.target);
        var x = elm.attr('data-x');
        var y = elm.attr('data-y');

        event.target.style.pointerEvents = 'auto';
        if ($attrs.onDragEnd) {
          $parse($attrs.onDragEnd)($scope, {x: x, y: y});
          $scope.$apply();
        }

        $timeout(function() {
          translateElement(elm, '')
            .css('z-index', 'auto')
            .removeAttr('data-x')
            .removeAttr('data-y')
            .removeClass('dragging-active');
        });

      }
    }).styleCursor(false);

    $scope.$on('$destroy', function() {
      interact($element[0]).unset();
    });

  })
  .directive('mwlDraggable', function() {

    return {
      restrict: 'A',
      controller: 'MwlDraggableCtrl'
    };

  });
