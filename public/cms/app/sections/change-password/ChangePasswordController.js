angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('change-password', {
        controller: 'ChangePasswordController',
        url: '/change-password?token&data',
        templateUrl: '/app/sections/change-password/change-password.html',
        requiresLogin: false
    });
}).controller('ChangePasswordController', function ($rootScope, $scope, userService, $state, $stateParams) {
    $scope.data = {password: '', password_confirmation: ''};

    $scope.changePassword = function () {
        $scope.loading = true;
        userService.passwordReset({
            token: $stateParams.token,
            data: $stateParams.data,
            password: $scope.data.password,
            password_confirmation: $scope.data.password_confirmation
        }).then(function (data) {
            if (data && data.id) $scope.success = true;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data.message ? err.data.message : 'Server error.'
            });

            $state.go('login');
        }).finally(function () {
            $scope.loading = false;
        });
    };
});
