angular.module('app').factory('shoppingCenterService', function ($http, config, $q) {
    var factory = {};
    var shoppingCenterData = {};

    factory.workingDays = [
        { day: 'Monday', from: '', to: '' },
        { day: 'Tuesday', from: '', to: '' },
        { day: 'Wednesday', from: '', to: '' },
        { day: 'Thursday', from: '', to: '' },
        { day: 'Friday', from: '', to: '' },
        { day: 'Saturday', from: '', to: '' },
        { day: 'Sunday', from: '', to: '' },
    ];

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'shopping-centers',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getById = function (shoppingCenterId) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + shoppingCenterId,
            method: 'GET'
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    }

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'shopping-centers',
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
            url: config.baseAddress + 'shopping-centers/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (data) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + data.id,
            method: 'DELETE',
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

    factory.removeFile = function (shoppingCenterId) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + shoppingCenterId + '/remove-file',
            method: 'DELETE',
            data: { id: shoppingCenterId }
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setShoppingCenter = function (shoppingCenter) {
        shoppingCenterData = shoppingCenter;
    }

    factory.getShoppingCenter = function () {
        return shoppingCenterData;
    }




    return factory;
});
