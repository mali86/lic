angular.module('app').factory('merchantService', function ($http, config, $q) {
    var factory = {};
    var merchantData = {};

    factory.orderValues = [
        { val: 'name', text: 'A-Z by name' },
        { val: '-name', text: 'Z-A by name' },
    ];

    factory.getCount = function (params) {
        return $http({
            url: config.baseAddress + 'merchants/count',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getUnapprovedCount = function (params) {
        return $http({
            url: config.baseAddress + 'merchants/unapproved-count',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getMerchantsByShoppingCenter = function (shoppingCenterId, params) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + shoppingCenterId + '/merchants',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'merchants',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (id, params) {
        return $http({
            url: config.baseAddress + 'merchants/' + id,
            method: 'DELETE',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'merchants',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.saveCoords = function (merchantId, data) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/kml',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    }

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'merchants/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getCouponsForMerchant = function (merchantId, params) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/coupons',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getById = function (id) {
        return $http({
            url: config.baseAddress + 'merchants/' + id,
            method: 'GET',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getUnapproved = function (params) {
        return $http({
            url: config.baseAddress + 'merchants/unapproved',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.approve = function (merchantId, data) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/approve',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.reject = function (merchantId, data) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/disapprove',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.removeFile = function (merchantId) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/remove-file',
            method: 'DELETE',
            data: { id: merchantId }
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.geoLocationByZip = function (query) {
        return $http({
            url: config.baseAddress + 'merchants/get-address/' + query,
            method: 'GET',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setMerchantData = function (merchant) {
        merchantData = {};
        merchantData = merchant;
    }

    factory.getMerchantData = function () {
        return merchantData;
    }

    return factory;
});
