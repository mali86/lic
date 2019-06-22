angular.module('app').factory('categoryService', function ($http, config, $q) {
    var factory = {};
    var categoryData = {};

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'categories',
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
            url: config.baseAddress + 'categories',
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
            url: config.baseAddress + 'categories/' + data.id,
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
            url: config.baseAddress + 'categories/' + data.id,
            method: 'DELETE',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.removeFile = function (categoryId) {
        return $http({
            url: config.baseAddress + 'categories/' + categoryId + '/remove-file',
            method: 'DELETE',
            data: { id: categoryId }
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setCategoryData = function (category) {
        categoryData = category;
    }

    factory.getCategoryData = function () {
        return categoryData;
    }

    return factory;
});
