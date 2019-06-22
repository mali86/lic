angular.module('app').factory('userService', function ($http, config, $q) {
    var factory = {};
    var userInfo = {};
    var isProfileEdit;
    var previousState = {};

    factory.userRolesObject = {
        1: 'Merchant',
        2: 'Shopping Center',
        // 3: 'Admin'
    };

    factory.userTypes = [
        {name: "Merchant", id: 1},
        {name: "Shopping Center", id: 2}
    ];

    factory.userRoles = [
        {name: "All"},
        {name: "Merchant", id: 1},
        {name: "Shopping Center", id: 2},
        // {name: "Admin", id: 3}
    ];

    factory.setUser = function(data, isProfileEdit) {
        // console.log('service', data, isProfileEdit);
        userInfo = data;
        isProfileEdit = isProfileEdit;
    }

    factory.getUser = function() {
        return userInfo;
    }

    factory.isProfileEdit = function() {
        return isProfileEdit;
    }

    factory.login = function (data) {
        return $http({
            url: config.baseAddress + 'login',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.register = function (data) {
        return $http({
            url: config.baseAddress + 'register',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'users',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.me = function (params) {
        return $http({
            url: config.baseAddress + 'users/me',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.statistic = function(data) {
        return $http({
            url: config.baseAddress + 'statistic',
            method: 'GET',
            data: data
        }).then( function(response) {
            return response.data;
        }, function(err) {
            return $q.reject(err);
        });
    }

    factory.getTypeInfo = function(data) {
        return $http({
            url: config.baseAddress + 'users/typeInfo/' + data,
            method: 'GET',
            data: data
        }).then( function(response) {
            return response.data;
        }, function(err) {
            return $q.reject(err);
        });
    }

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'users',
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
            url: config.baseAddress + 'users/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.changePassword = function (data) {
        return $http({
            url: config.baseAddress + 'users/' + data.id + '/change-password',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.forgotPassword = function (data) {
        return $http({
            url: config.baseAddress + 'password/email',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.passwordReset = function (data) {
        return $http({
            url: config.baseAddress + 'password/reset',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.checkEmail = function (params) {
        return $http({
            url: config.baseAddress + 'check-email',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.activate = function (data) {
        return $http({
            url: config.baseAddress + 'users/' + data.id + '/activate',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.deactivate = function (data) {
        return $http({
            url: config.baseAddress + 'users/' + data.id + '/deactivate',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getHomeInformation = function (params) {
        return $http({
            url: config.baseAddress + 'home',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (user, params) {
        return $http({
            url: config.baseAddress + 'users/' + user.id,
            method: 'DELETE',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.confirmEmail = function (data) {
        return $http({
            url: config.baseAddress + 'users/confirm/email',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    return factory;
});
