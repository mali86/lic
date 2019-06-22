angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('confirm-email', {
        controller: 'ConfirmEmailController',
        url: '/confirm-email?token&data',
        templateUrl: '/app/sections/confirmEmail/confirmEmail.html',
        requiresLogin: false
    });
}).controller('ConfirmEmailController', function ($rootScope, $scope, userService, $state, $stateParams) {
    $scope.loading = true;
    userService.confirmEmail({
        token: $stateParams.token,
        data: $stateParams.data
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
});
