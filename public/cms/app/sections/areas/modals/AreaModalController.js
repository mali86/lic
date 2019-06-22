'use strict';
angular.module('app').controller('AreaModalController', function ($scope, $mdDialog, areaService, area, stateService) {
    $scope.area = area;
    if ($scope.area && $scope.area.id) {
        $scope.selectedState = { id: $scope.area.state_id, name: $scope.area.state_name };
        $scope.searchStateText = $scope.area.state_name;
    }

    $scope.loadStates = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;

        return stateService.get(query).then(function (response) {
            return response.states;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.save = function () {
        $scope.loading = true;
        var area = angular.copy($scope.area);
        area.state_id = $scope.selectedState.id;
        var promise = area.id ? areaService.update(area) : areaService.add(area);
        promise.then(function (area) {
            $mdDialog.hide(area);
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function() {
            $scope.loading = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
