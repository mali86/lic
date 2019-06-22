'use strict';
angular.module('app').controller('ShoppingCenterTimeModalController', function ($rootScope, $scope, $mdDialog, shoppingCenterService) {
    $scope.all = {
        from: '',
        to: ''
    };

    $scope.workingDays = angular.copy(shoppingCenterService.workingDays);

    $scope.setTime = function() {
        _.each($scope.workingDays, function(day) {
            day.from = $scope.all.from;
            day.to = $scope.all.to;
        });
    };

    $scope.save = function () {
        _.each($scope.workingDays, function(day) {
            day.from = moment(day.from).format('hh:mm A');
            day.to = moment(day.to).format('hh:mm A');
        });
        $mdDialog.hide($scope.workingDays);
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
