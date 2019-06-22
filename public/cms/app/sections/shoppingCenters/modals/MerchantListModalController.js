'use strict';
angular.module('app').controller('MerchantListModalController', function ($rootScope, $scope, $mdDialog, shoppingCenterService, shoppingCenter, $state, merchantService) {
    $scope.shoppingCenter = shoppingCenter;
    $scope.params = {page: 1, limit: 10};

    loadData();

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.sortMerchants = function () {
        loadData();
    };

    $scope.goToCouponsPage = function (merchant) {
        console.log('click');
        $state.go('layout.coupons', {merchantId: merchant.id, fmm: true});
        $mdDialog.cancel();
    };

    $scope.openMerchantModal = function (ev, merchant) {
        $mdDialog.show({
            controller: 'MerchantModalController',
            templateUrl: '/app/sections/merchant/modals/merchantModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                merchant: angular.copy(merchant)
            }
        }).then(function (data) {
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
            }, function (err) {
            });
        }, function (err) {
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
            }, function (err) {
            });
        });
    };

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
                }, function (err) {
                });
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data.message ? err.data.message : 'Server error.'
                });
            });
        }, function () {
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
            }, function (err) {
            });
        });
    };

    $scope.onPaginate = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true;

        shoppingCenterService.getMerchantsByShoppingCenter($scope.shoppingCenter.id, $scope.params).then(function (response) {
            $scope.merchants = response.merchants;
            $scope.total = response.total;
        }, function () {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});
