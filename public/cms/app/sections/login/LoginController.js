angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        controller: 'LoginController',
        templateUrl: '/app/sections/login/login.html'
    });
}).controller('LoginController', function ($scope, $state, userService, localStorageService, $rootScope) {
    $scope.user = {};

    $scope.login = function () {
        $scope.loading = true;
        // localStorageService.set('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
        //     $state.go('layout.home');
        userService.login($scope.user).then(function (response) {
            localStorageService.set('token', response.token);
            $state.go('layout.home');
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Invalid email/password.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };
});
