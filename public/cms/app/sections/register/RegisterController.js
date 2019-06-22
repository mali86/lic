angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('register', {
        url: '/register',
        controller: 'RegisterController',
        templateUrl: '/app/sections/register/register.html'
    });
}).controller('RegisterController', function ($scope, $state, $mdDialog, userService, localStorageService, $rootScope, areaService, shoppingCenterService, merchantService, categoryService, $timeout) {
    $scope.user = { email: '' };
    $scope.merchant = {};
    $scope.selectedTabIndex = 0;
    $scope.userTypes = userService.userTypes;
    $scope.data = {};
    $scope.step = 1;

    $scope.selectStep = function (step) {
      $scope.step = step;
    };

    $scope.loadArea = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;

        return areaService.get(query).then(function (response) {
            return response.areas;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.selectArea = function (area) {
        if (area) {
            $scope.userType.area_id = area.id;
        } else {
            $scope.userType.area_id = undefined;
            $scope.userType.shopping_center_id = undefined;
            $scope.data.searchAreaText = '';
            $scope.data.searchTextShoppingCenter = '';
            $scope.data.selectedShoppingCenter = undefined;
        }
    };

    $scope.loadShoppingCenters = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;
        if ($scope.userType.area_id) query.area = $scope.userType.area_id;

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
            $scope.userType.shopping_center_id = shoppingCenter.id;
            $scope.userType.address = shoppingCenter.address;
            $scope.userType.city = shoppingCenter.city;
            $scope.userType.zip = shoppingCenter.zip;
        } else {
            $scope.userType.shopping_center_id = undefined;
            $scope.searchTextShoppingCenter = '';
        }
    };

    $scope.loadCategories = function (query) {
        return categoryService.get({ search: query, limit: 10, page: 1 }).then(function (response) {
            return response.categories;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.registerUser = function () {
        $scope.loading = true;
        if ($scope.data.selectedUserType) {
            $scope.user.type = $scope.data.selectedUserType.id;
        }
        userService.register($scope.user).then(function (user) {
            $scope.step = 2;
            $scope.user = user;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    $scope.changeUserType = function () {
        $scope.userType = {};
    };

    $scope.register = function () {
        if ($scope.data.selectedUserType && $scope.user && $scope.user.id) {
            $scope.loading = true;
            var userType = angular.copy($scope.userType);
            userType.user_id = $scope.user.id;

            if ($scope.data.selectedUserType.id == 1) {
                userType.categories = _.map(userType.categories, function (category) {
                    return category.id;
                });
            }

            var promise = $scope.data.selectedUserType.id == 1 ? merchantService.add(userType) : shoppingCenterService.add(userType);
            promise.then(function () {
                $scope.step = 3;
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error.'
                });
            }).finally(function () {
                $scope.loading = false;
            });
        }
    };

    $scope.checkEmail = function (email) {
        userService.checkEmail({ email: email }).then(function (validEmail) {
        }, function (err) {
            $scope.user.email = '';
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.openTimeModal = function (ev) {
        $mdDialog.show({
            controller: 'ShoppingCenterTimeModalController',
            templateUrl: '/app/sections/shoppingCenters/modals/shoppingCenterTimeModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        }).then(function (data) {
            var invalidDates = 0;
            _.each(data, function (d) {
                if (d.to == 'Invalid date' && d.from == 'Invalid date') invalidDates++;
            });
            if (invalidDates != data.length) {
                $scope.userType.working_hours = data;
            }
        }, function (err) { });
    };

    var filterZipTextTimeout;
    $scope.geoLocationByZip = function (zip) {
        if (filterZipTextTimeout) $timeout.cancel(filterZipTextTimeout);
        filterZipTextTimeout = $timeout(function () {
            $scope.loadingByZip = true;
            merchantService.geoLocationByZip(zip).then(function (response) {
                $scope.userType.address = response.address;
                $scope.userType.city = response.city;
                $scope.userType.lat = response.lat;
                $scope.userType.lon = response.lon;
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error.'
                });
            }).finally(function () {
                $scope.loadingByZip = false;
            });
        }, 250);
    };
});
