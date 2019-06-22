angular.module('app').factory('areaService', function ($http, config, $q) {
    var factory = {};
    var areaData = {};

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'areas',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'areas',
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
            url: config.baseAddress + 'areas/' + data.id,
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
            url: config.baseAddress + 'areas/' + data.id,
            method: 'DELETE',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setAreaData = function (area) {
        areaData = area;
    }

    factory.getAreaData = function() {
        return areaData;
    }

    return factory;
});
