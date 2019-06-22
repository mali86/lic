angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.push-notification', {
        url: '/push-notification',
        controller: 'PushNotificationController',
        templateUrl: '/app/sections/pushNotifications/pushNotification.html',
        requiresLogin: true
    });
}).controller('PushNotificationController', function ($rootScope, $scope, $state, configFireBase, pushNotificationService, userService, shoppingCenterService, merchantService) {
    $scope.session = $rootScope.session;
    // $scope.userRoles = userService.userRoles;
	$scope.userRoles = userService.userRoles;
    var shoppingCenterId = 424;

    $scope.user = {};
    // console.log('user', $scope.user, 'user roles', $scope.userRoles, 'session', $scope.session);
	$scope.data = {};
    if (!$scope.user.id) $scope.user.type = $scope.userRoles[1].id;
    
    if ($scope.session.role == 'user') {
        infoMe();
    }

    function infoMe() {
        return userService.me().then(function (response) {
            // console.log(response);
            $scope.user = response;
        }, function (err) {
            console.log(err);
        });
    }

	$scope.send = function() {
		$scope.loading = true;
		var user, id;
		if($scope.user.type == 1) {
			user = 'merchant-' + $scope.user.merchant_id;
            id = $scope.user.merchant_id;
    	} else {
    		user = 'admin';
    	}

		pushNotificationService.send($scope.notification, user, id).then(function(response) {
			$rootScope.$broadcast('toast', { message: 'Successfully sent' });
			$scope.loading = false;
            $scope.notification = {};
		}, function(err) {
            $scope.loading = false;
			$rootScope.$broadcast('toast', {
				message: err.data && err.data.message ? err.data.message : 'Server error.'
			});
		});
	}

	$scope.loadMerchants = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;
        return merchantService.get(query).then(function (response) {
            return response.merchants;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.selectMerchant = function (merchant) {
        if (merchant) {
            $scope.user.merchant_id = merchant.id;
        } else {
            $scope.user.merchant_id = undefined;
            $scope.data.searchMerchantText = '';
        }
    };

    $scope.loadShoppingCenters = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;

        return shoppingCenterService.get(query).then(function (response) {
            return response.shopping_centers;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.selectShoppingCenter = function (shoppingCenter) {
        if (shoppingCenter) {
            $scope.user.shopping_center_id = shoppingCenter.id;
        } else {
            $scope.user.shopping_center_id = undefined;
            $scope.data.searchTextShoppingCenter = '';
        }
    };

     $scope.roleChanged = function () {
        $scope.user.shopping_center_id = undefined;
        $scope.user.merchant_id = undefined;
        $scope.data = {};
    };

    // function loadUserData() {
    // 	$scope.loading = true;
    // 	userService.me().then(function (response) {
    // 		$scope.loading = false;
    // 		$scope.user = response;
    // 	}, function (err) {
    // 		$rootScope.$broadcast('toast', {
    // 			message: err.data && err.data.message ? err.data.message : 'Server  error.'
    // 		});
    // 	});
    // };
});



