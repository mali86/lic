'use strict';
angular.module('app').controller('MerchantNotificationModalController', function ($rootScope, $scope, $mdDialog, merchantService, merchant, pushNotificationService, localStorageService, areaService, shoppingCenterService, categoryService, FileUploader, $timeout) {
    $scope.merchant = merchant;
    
    $scope.send = function() {
        $scope.loading = true;

        pushNotificationService.send($scope.notification, 'merchant-' + $scope.merchant.id, $scope.merchant.id).then(function(response) {
            $rootScope.$broadcast('toast', { message: 'Successfully sent' });
            $scope.loading = false;

        }, function(err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    }

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
