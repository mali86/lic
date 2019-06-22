'use strict';
angular.module('app').controller('MerchantRequestModalController', function ($rootScope, $scope, $mdDialog, merchantService, merchantRequest, localStorageService) {
    $scope.merchant = merchantRequest;

    $scope.approve = function () {
        $scope.loadingApprove = true;
        merchantService.approve($scope.merchant.id).then(function (response) {
            $rootScope.$broadcast('toast', { message: 'Successfully approved!', type: 'success' });
            $mdDialog.hide();
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loadingApprove = false;
        });
    };

    $scope.reject = function () {
        $scope.loadingReject = true;
        merchantService.reject($scope.merchant.id).then(function (r) {
            $scope.$emit('toast', { message: 'Successfully rejected!', type: 'success' });
            $mdDialog.hide();
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function() {
            $scope.loadingReject = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
