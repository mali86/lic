angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.coupons', {
        url: '/merchants/:merchantId/coupons?fmm',
        controller: 'MerchantCouponController',
        templateUrl: '/app/sections/merchant/coupon/coupon.html',
        requiresLogin: true
    });
}).controller('MerchantCouponController', function ($rootScope, $scope, $state, $mdDialog, couponService, merchantService, userService, $stateParams) {
    var imageExtensions = ['jpg', 'jpeg', 'png', 'bpm'];
    $scope.params = { page: 1, limit: 10 };
    
    merchantService.getById($stateParams.merchantId).then(function (response) {
        $scope.merchant = response;
    }, function (err) {
        $rootScope.$broadcast('toast', {
            message: err.data && err.data.message ? err.data.message : 'Server error'
        });
    });

    userService.me().then(function (response) {
        if(response.type == 1) {
            $stateParams.merchantId = response.merchant_id;
        }
        loadData();
    }, function (err) {
        loadData();
        $rootScope.$broadcast('toast', {
            message: err.data && err.data.message ? err.data.message : 'Server error'
        });
    });

    $scope.goBack = function () {
      if ($stateParams.fmm) {
          $state.go('layout.shopping-centers');
      } else {
          $state.go('layout.merchant');
      }
    };

    $scope.openPixieEditor = function(ev, cupon) {
        couponService.setIsOpen(false);
        $state.go('layout.pixie', {merchantId: $stateParams.merchantId});
    };

    // $scope.openCouponModal = function (ev, cupon) {
    //     $mdDialog.show({
    //         controller: 'CouponModalController',
    //         templateUrl: '/app/sections/merchant/coupon/modals/couponModal.html',
    //         parent: angular.element(document.body),
    //         targetEvent: ev,
    //         size: 'lg',
    //         clickOutsideToClose: false,
    //         locals: {
    //             coupon: angular.copy(cupon),
    //             merchant: angular.copy($scope.merchant)
    //         }
    //     }).then(function (data) {
    //         loadData();
    //     }, function (err) { });
    // };

    $scope.openCouponEdit = function (coupon) {
        couponService.setCouponData(angular.copy(coupon));
        couponService.setMerchant(angular.copy($scope.merchant));
        $state.go('layout.coupon-edit');
    };

    $scope.openCouponAdd = function () {
        couponService.setCouponData({});
        couponService.setMerchant(angular.copy($scope.merchant));
        $state.go('layout.coupon-edit'); 
    }

    $scope.removeModal = function (ev, coupon) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            coupon.deleteLoading = true;
            couponService.remove(coupon).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                coupon.deleteLoading = false;
            });
        }, function (err) { });
    };

    $scope.onPaginate = function () {
        loadData();
    };

    $scope.sortBy = function () {
        loadData();
    };

    $scope.toggleActive = function (coupon) {
        var tmpCoupon = angular.copy(coupon);
        coupon.toggleLoading = true;
        tmpCoupon.active = !tmpCoupon.active;
        couponService.toggleActive($stateParams.merchantId, tmpCoupon).then(function () {
            coupon.active = tmpCoupon.active;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error'
            });
        }).finally(function () {
            coupon.toggleLoading = false;
        });
    };

    function loadData() {
        $scope.loading = true;
        merchantService.getCouponsForMerchant($stateParams.merchantId, $scope.params).then(function (response) {
            $scope.coupons = response.coupons;
            _.each($scope.coupons, function(coupon) {
                var image = _.find(coupon.files, function (file) {
                    var extension = file.url.substr(file.url.lastIndexOf('.') + 1);
                    return imageExtensions.indexOf(extension) != -1;
                });

                if (image) coupon.image = image;
            });
            $scope.total = response.total;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }

});
