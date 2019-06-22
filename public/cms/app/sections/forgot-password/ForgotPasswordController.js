angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('forgot-password', {
        url: '/forgot-password',
        controller: 'ForgotPasswordController',
        templateUrl: '/app/sections/forgot-password/forgot-password.html'
    });
}).controller('ForgotPasswordController', function ($scope, $state, userService, $rootScope) {
    $scope.data = {email: ''};

    $scope.forgotPassword = function () {
        $scope.loading = true;
        userService.forgotPassword({email: $scope.data.email}).then(function (response) {
            $scope.email = '';
            $rootScope.$broadcast('toast', {
                message: 'Email successfully sent, please check you email.'
            });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };
});
