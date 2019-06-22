angular.module('app').factory('stateService', function ($http, config, $q) {
    var factory = {};

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'states',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    return factory;
});
