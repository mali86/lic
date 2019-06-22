angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.coupon-edit', {
        url: '/merchants/coupon/addEditCoupon/coupon-edit',
        controller: 'CouponAddEditController',
        templateUrl: '/app/sections/merchant/coupon/addEditCoupon/couponAddEdit.html',
        requiresLogin: true
    });
}).controller('CouponAddEditController', function ($rootScope, $scope, $mdDialog, couponService, localStorageService, FileUploader, config, merchantService) {
    
    $scope.coupon = couponService.getCouponData();
    $scope.merchant = couponService.getMerchant();

    if ($scope.coupon && $scope.coupon.id) {
        $scope.coupon.start_date = moment($scope.coupon.start_date).toDate();
        $scope.coupon.end_date = moment($scope.coupon.end_date).toDate();
        if ($scope.coupon && $scope.coupon.files) {
            _.each($scope.coupon.files, function (file) {
                file.extension = file.url.substr(file.url.lastIndexOf('.') + 1);
            });
        }
    } else {
        $scope.coupon.start_date = moment().toDate();
        $scope.coupon.end_date = moment().add(1, 'days').toDate();
    }

    $scope.uploader = new FileUploader({
        url: config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file',
        headers: {
            'Authorization': localStorageService.get('token')
        }
    });

    $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|pdf|'.indexOf(type) !== -1;
        }
    });

    $scope.uploader.onBeforeUploadItem = function (item) {
        console.log(item);
        item.url = config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file';
        item.formData.push({ 'coupon_id': $scope.coupon.id });
        
    };

    $scope.uploader.onCompleteAll = function () {
        $scope.loading = false;
        $rootScope.$broadcast('toast', { message: 'Successfully saved' });
        $mdDialog.hide($scope.coupon);
    };

    $scope.save = function () {
        var coupon = angular.copy($scope.coupon);
        coupon.start_date = moment(coupon.start_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.end_date = moment(coupon.end_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.merchant_id = $scope.merchant.id;
        $scope.loading = true;

        var promise = coupon.id ? couponService.update(coupon) : couponService.add(coupon);
        promise.then(function (response) {
            if ($scope.uploader.queue && $scope.uploader.queue.length) {
                $scope.coupon.id = response.id;
                $scope.uploader.uploadAll();
            } else {
                $rootScope.$broadcast('toast', { message: 'Successfully saved' });
                $scope.loading = false;
                $mdDialog.hide($scope.coupon);
            }
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.removeFile = function (file) {
        file.loading = true;
        couponService.removeFile($scope.coupon, file).then(function () {
            $scope.coupon.files = _.reject($scope.coupon.files, function (fileFromList) {
                return file.id == fileFromList.id;
            });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            file.loading = false;
        });
    }

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
