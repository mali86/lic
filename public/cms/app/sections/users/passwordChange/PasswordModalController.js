angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.password-change', {
        url: '/users/password-change',
        controller: 'PasswordModalController',
        templateUrl: '/app/sections/users/passwordChange/passwordModal.html',
        requiresLogin: true
    });
}).controller('PasswordModalController', function ($rootScope, $scope, $state, $mdDialog, userService, $stateParams) {
    // $scope.user = $stateParams.userId;
    $scope.user = userService.getUser();
    $scope.session = $rootScope.session;
    $scope.model = {};
    $scope.save = function () {

        $scope.loading = true;
        if($scope.user.user_id) {
            $scope.model.id = $scope.user.user_id;
        } else {
            $scope.model.id = $scope.user.id;
        }

        // console.log('pw', $scope.model);
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
