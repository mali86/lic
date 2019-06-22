angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.areas-edit', {
        url: '/areas/areas-edit',
        controller: 'AreaAddEditController',
        templateUrl: '/app/sections/areas/addEditAreas/areaAddEdit.html',
        requiresLogin: true
    });
}).controller('AreaAddEditController', function ($scope, $mdDialog, areaService, stateService) {
    $scope.area = areaService.getAreaData();
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
            $rootScope.$broadcast('toast', { message: 'Successfully saved!' });
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
