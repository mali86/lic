'use strict';
angular.module('app').controller('DetailsModalController', function ($rootScope, $scope, $mdDialog, couponService, localStorageService, FileUploader, config, merchantService, merchant) {
    
    $scope.coupon = {};
    $scope.merchant = merchant;

    $scope.coupon.start_date = moment().toDate();
    $scope.coupon.end_date = moment().add(1, 'days').toDate();

    $scope.save = function () {
        var coupon = angular.copy($scope.coupon);
        coupon.start_date = moment(coupon.start_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.end_date = moment(coupon.end_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.merchant_id = parseInt($scope.merchant);
        coupon.image = couponService.image;
        $scope.loading = true;

        var promise = couponService.add(coupon);
        promise.then(function (response) {
                $scope.coupon.id = response.id;
                $rootScope.$broadcast('toast', { message: 'Successfully saved' });
                $scope.loading = false;
                $mdDialog.hide($scope.coupon);
        }, function (err) {
            $scope.loading = false;
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };
    
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
