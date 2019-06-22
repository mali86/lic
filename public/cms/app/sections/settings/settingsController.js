angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.settings', {
        url: '/settings',
        controller: 'SettingsController',
        templateUrl: '/app/sections/settings/settings.html',
        requiresLogin: true
    });
}).controller('SettingsController', function ($rootScope, $stateParams, $scope, $mdDialog, userService, merchantService, shoppingCenterService) {

    $scope.session = $rootScope.session;
    $scope.userRoles = userService.userRoles;
    // $scope.user = user ? user : {};
    $scope.user = {};
    // $scope.profileEdit = profileEdit;
    $scope.profileEdit = false;

    loadUserData();

    if($scope.session.role == 'user') {
        $scope.profileText = "Profile";
    } else {
        $scope.profileText =  "Edit";
    }

    $scope.data = {};
    if (!$scope.user.id) $scope.user.type = $scope.userRoles[1].id;

    $scope.save = function () {
        $scope.loading = true;
        var promise = $scope.user.id ? userService.update($scope.user) : userService.add($scope.user);
        promise.then(function (user) {
            $rootScope.$broadcast('toast', { message: 'Successfully saved!' });
            $scope.loading = false;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    function loadUserData() {
    	$scope.loading = true;
    	userService.me().then(function (response) {
    		$scope.loading = false;
    		$scope.user = response;
            // console.log($scope.user);
    	}, function (err) {
    		$rootScope.$broadcast('toast', {
    			message: err.data && err.data.message ? err.data.message : 'Server  error.'
    		});
    	});
    };
    
});







