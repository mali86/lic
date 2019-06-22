angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.areas', {
        url: '/areas',
        controller: 'AreaController',
        templateUrl: '/app/sections/areas/area.html',
        requiresLogin: true
    });
}).controller('AreaController', function ($rootScope, $scope, $state, $mdDialog, areaService, $timeout) {
    $scope.params = { page: 1, limit: 10 };

    loadData();

    $scope.areaModal = function (ev, area) {
        $mdDialog.show({
            controller: 'AreaModalController',
            templateUrl: '/app/sections/areas/modals/areaModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                area: angular.copy(area)
            }
        }).then(function (data) {
            $scope.params.page = 1;
            loadData();
        }, function (err) { });
    };

    $scope.openAreaAdd = function () {
        areaService.setAreaData(null);
        $state.go('layout.areas-edit');
    }

    $scope.openAreaEdit = function (area) {
        areaService.setAreaData(angular.copy(area));
        $state.go('layout.areas-edit');
    }

    $scope.removeModal = function (ev, area) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            area.loading = true;
            areaService.remove(area).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                area.loading = false;
            });
        }, function (err) { });
    };

    var filterTextTimeout;
    $scope.search = function () {
        $scope.params.page = 1;
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
        filterTextTimeout = $timeout(function () {
            loadData();
        }, 250);
    };

    $scope.onPaginate = function () {
        loadData();
    };

    $scope.sortAreas = function() {
        loadData();
    };

    function loadData() {
        $scope.loading = true;
        areaService.get($scope.params).then(function (response) {
            $scope.areas = response.areas;
            $scope.total = response.total;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});