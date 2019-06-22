angular.module('app').factory('couponService', function ($http, config, $q) {
    var factory = {};
    var image;
    var isOpen = true;
    var couponData = {};
    var merchantData = {};

    factory.setIsOpen = function(value) {
        isOpen = value;
    }

    factory.isOpen = function() {
        return isOpen;
    }

    factory.toggleActive = function (merchantId, coupon) {
        var url;
        if (coupon.active) {
            url = config.baseAddress + 'coupons/' + coupon.id + '/activate';
        } else {
            url = config.baseAddress + 'coupons/' + coupon.id + '/deactivate';
        }
        return $http({
            url: url,
            method: 'PUT',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (coupon) {
        return $http({
            url: config.baseAddress + 'coupons/' + coupon.id,
            method: 'DELETE',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.removeFile = function (coupon, file, params) {
        return $http({
            url: config.baseAddress + 'coupons/' + coupon.id + '/remove-file/' + file.id,
            method: 'DELETE',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    // factory.get = function (params) {
    //     return $http({
    //         url: config.baseAddress + 'admin/coupons',
    //         method: 'GET',
    //         params: params
    //     }).then(function (response) {
    //         return response.data;
    //     }, function (err) {
    //         return $q.reject(err);
    //     });
    // };

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'coupons',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'coupons/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setCouponData = function (data) {
        couponData = data;
    };

    factory.getCouponData = function () {
        return couponData;
    }

    factory.setMerchant = function (data) {
        merchantData = data;
    }

    factory.getMerchant = function () {
        return merchantData;
    } 

    

    return factory;
});
