angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.shopping-centers', {
        url: '/shopping-centers',
        controller: 'ShoppingCenterController',
        templateUrl: '/app/sections/shoppingCenters/shopping-centers.html',
        requiresLogin: true
    });
}).controller('ShoppingCenterController', function ($rootScope, $scope, $state, $mdDialog, shoppingCenterService, $timeout, merchantService) {
    $scope.params = { page: 1, limit: 10 };

    loadData();

    $scope.merchantsModal = function (ev, shoppingCenter) {
        $mdDialog.show({
            controller: 'MerchantListModalController',
            templateUrl: '/app/sections/shoppingCenters/modals/merchantListModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                shoppingCenter: angular.copy(shoppingCenter)
            }
        }).then(function (data) {
        }, function (err) { });
    };

    $scope.shoppingCenterModal = function (ev, shoppingCenter) {
        $mdDialog.show({
            controller: 'ShoppingCenterModalController',
            templateUrl: '/app/sections/shoppingCenters/modals/shoppingCenterModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                shoppingCenter: angular.copy(shoppingCenter)
            }
        }).then(function (data) {
            $scope.params.page = 1;
            loadData();
        }, function (err) { });
    };

    $scope.removeModal = function (ev, shoppingCenter) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            shoppingCenter.loading = true;
            shoppingCenterService.remove(shoppingCenter).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                shoppingCenter.loading = false;
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

    $scope.sortShoppingCenters = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true;
        shoppingCenterService.get($scope.params).then(function (response) {
            $scope.shoppingCenters = response.shopping_centers;
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
