'use strict';
angular.module('app').controller('UserModalController', function ($rootScope, $scope, $mdDialog, userService, user, profileEdit, merchantService, shoppingCenterService) {
    $scope.session = $rootScope.session;
    $scope.userRoles = userService.userRoles;
    $scope.user = user ? user : {};
    $scope.profileEdit = profileEdit;
    $scope.data = {};
    if (!$scope.user.id) $scope.user.type = $scope.userRoles[1].id;

    $scope.save = function () {
        $scope.loading = true;
        var promise = $scope.user.id ? userService.update($scope.user) : userService.add($scope.user);
        promise.then(function (user) {
            $rootScope.$emit('toast', {message: 'Successfully saved!', type: 'success'});
            $scope.loading = false;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    $scope.loadMerchants = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;
        return merchantService.get(query).then(function (response) {
            return response.merchants;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.selectMerchant = function (merchant) {
        if (merchant) {
            $scope.user.merchant_id = merchant.id;
        } else {
            $scope.user.merchant_id = undefined;
            $scope.data.searchMerchantText = '';
        }
    };

    $scope.loadShoppingCenters = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;

        return shoppingCenterService.get(query).then(function (response) {
            return response.shopping_centers;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.selectShoppingCenter = function (shoppingCenter) {
        if (shoppingCenter) {
            $scope.user.shopping_center_id = shoppingCenter.id;
        } else {
            $scope.user.shopping_center_id = undefined;
            $scope.data.searchTextShoppingCenter = '';
        }
    };

    $scope.roleChanged = function () {
        $scope.user.shopping_center_id = undefined;
        $scope.user.merchant_id = undefined;
        $scope.data = {};
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
