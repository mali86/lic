angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout', {
        controller: 'LayoutController',
        templateUrl: '/app/sections/layout/layout.html',
        requiresLogin: true
    });
}).controller('LayoutController', function ($rootScope, $scope, $http, $state, $window, $location, $mdSidenav, couponService, shoppingCenterService, userService, localStorageService, $mdDialog) {
    $scope.user = $rootScope.session;
    $scope.merchantId = null;

    userService.me().then(function (response) {
        $scope.merchantId = response.merchant_id;
    }, function (err) {
        $rootScope.$broadcast('toast', {
            message: err.data && err.data.message ? err.data.message : 'Server  error.'
        });
    });

    $scope.isPixieOpen = function() {
        return couponService.isOpen();
    }
    $scope.close = function () {
        $mdSidenav('left').close();
    };
    $scope.toggle = function () {
        $mdSidenav('left').toggle();
    };
    $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };

    $scope.openSettings = function () {
        $state.go('layout.settings', {text: 'profile'});
    }

    $scope.openChangePassword = function () {
        userService.setUser(angular.copy($scope.user), false);
        $state.go('layout.password-change');
    }

    $scope.openMerchantCoupons = function () {
        $state.go('layout.coupons', {merchantId: $scope.merchantId});
        // console.log( $scope.merchantId);
    }

    $scope.openShoppingCenter = function (event) {
        event.preventDefault();
        shoppingCenterService.getById(424).then(function (response) {
            shoppingCenterService.setShoppingCenter(response);
            $state.go('layout.shopping-settings');
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server  error.'
            });
        });
        
    }

    $scope.onBack = function () {
        // if($rootScope.name == 'layout.coupons') {
        //     $state.go('layout.merchant');
        // } else {
        //     $state.go($rootScope.previousState.name);
        // }
        // console.log($rootScope.name);
        // if($rootScope.name == 'layout.coupon-edit') {
        //     console.log('test');
        //     $window.history.back();
        // }
        // $window.history.back();
        // console.log($rootScope.previousState.name);
        if($rootScope.previousState.name == '') {
            $location.path('/');
        } else if($rootScope.previousState.name == 'layout.coupons') {
            $window.history.back();
        } else {
            $state.go($rootScope.previousState.name);
        }
    }

    $scope.profileModal = function (ev) {
        $mdDialog.show({
            controller: 'UserModalController',
            templateUrl: '/app/sections/users/modals/userModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            resolve: {
                user: function(userService) {
                    return userService.me();
                }
            },
            locals: {
                profileEdit: true
            }
        }).then(function (user) {
            $scope.user.first_name = user.first_name;
            $scope.user.last_name = user.last_name;
        }, function (err) { });
    };

    $scope.logout = function () {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('refresh_token');
        delete $http.defaults.headers.common.Authorization;
        $rootScope.session = {};
        $state.go('login');
    };
});
