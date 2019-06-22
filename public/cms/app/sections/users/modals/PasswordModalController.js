'use strict';
angular.module('app').controller('PasswordModalController', function ($rootScope, $scope, $mdDialog, userService, user) {
    $scope.user = user;
    $scope.session = $rootScope.session;

    $scope.save = function () {
        $scope.loading = true;
        $scope.model.id = $scope.user.id;
        userService.changePassword($scope.model).then(function (user) {
            $rootScope.$broadcast('toast', { message: 'Successfully changed!' });
            $mdDialog.hide(user);
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
