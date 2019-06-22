angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.merchant', {
        url: '/merchants',
        controller: 'MerchantController',
        templateUrl: '/app/sections/merchant/merchant.html',
        requiresLogin: true
    });
}).controller('MerchantController', function ($rootScope, $scope, $state, $mdDialog, merchantService, $timeout, categoryService) {
    $scope.params = { page: 1, limit: 10, sort_by: 'id'};

    $scope.orderValues = merchantService.orderValues;
    var shoppingCenterId = 424;

    loadData();
    loadCategories();

    $scope.sortMerchants = function () {
        loadData();
    };

    var filterTextTimeout;
    $scope.search = function () {
        $scope.params.page = 1;
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
        filterTextTimeout = $timeout(function () {
            loadData();
        }, 250);
    };

    $scope.selectFilter = function() {
        for(i=0; i < 4; i++) {
            $scope.params["filters["+ i +"]"] = null;
        }
        $scope.filters.forEach(function(data, index) {
            $scope.params["filters["+ index +"]"] = data;
        });
        $scope.params.page = 1;
        loadData();

    }

    function loadCategories() {
        $scope.categoryLoading = true;
        categoryService.get({ limit: 10, page: 1 }).then(function (response) {
            $scope.categoryLoading = false;
            $scope.categories = response.categories;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    // $scope.openMerchantModal = function (ev, merchant) {
    //     $mdDialog.show({
    //         controller: 'MerchantModalController',
    //         templateUrl: '/app/sections/merchant/modals/merchantModal.html',
    //         parent: angular.element(document.body),
    //         targetEvent: ev,
    //         size: 'lg',
    //         clickOutsideToClose: false,
    //         locals: {
    //             merchant: angular.copy(merchant)
    //         }
    //     }).then(function (data) {
    //         loadData();
    //     }, function (err) { });
    // };

    $scope.openMerchantAdd = function() {
        merchantService.setMerchantData(null);
        $state.go('layout.merchants-edit.edit');
    }

    $scope.openMerchantEdit = function(merchant) {
        merchantService.setMerchantData(angular.copy(merchant));
        $state.go('layout.merchants-edit.edit');
    }

    $scope.removeModal = function (ev, merchant) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            merchantService.remove(merchant.id).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data.message ? err.data.message : 'Server error.'
                });
            });
        });
    };

    $scope.sendNotification = function (ev, merchant) {
        console.log('send notification.');
         $mdDialog.show({
            controller: 'MerchantNotificationModalController',
            templateUrl: '/app/sections/merchant/modals/notificationModal/merchantNotificationModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                merchant: angular.copy(merchant)
            }
        }).then(function (data) {
            loadData();
        }, function (err) { });
    }

    $scope.onPaginate = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true
;        merchantService.get($scope.params).then(function (response) {
            $scope.merchants = response.merchants;
            $scope.total = response.total;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});
