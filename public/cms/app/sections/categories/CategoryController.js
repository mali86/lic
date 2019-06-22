angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.categories', {
        url: '/categories',
        controller: 'CategoryController',
        templateUrl: '/app/sections/categories/categories.html',
        requiresLogin: true
    });
}).controller('CategoryController', function ($rootScope, $scope, $state, $mdDialog, categoryService, $timeout) {
    $scope.params = { page: 1, limit: 10 };

    loadData();

    // $scope.categoryModal = function (ev, category) {
    //     $mdDialog.show({
    //         controller: 'CategoryModalController',
    //         templateUrl: '/app/sections/categories/modals/categoryModal.html',
    //         parent: angular.element(document.body),
    //         targetEvent: ev,
    //         size: 'lg',
    //         clickOutsideToClose: false,
    //         locals: {
    //             category: angular.copy(category)
    //         }
    //     }).then(function (data) {
    //         $scope.params.page = 1;
    //         loadData();
    //     }, function () { });
    // };

    $scope.convertHex = function (hex, opacity = 100) {
        hex = hex.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);

        return result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity/100 +')';
    }

    $scope.openCategoryAdd = function() {
        categoryService.setCategoryData(null);
        $state.go('layout.categories-edit');
    }

    $scope.openCategoryEdit = function (category) {
        categoryService.setCategoryData(angular.copy(category));
        $state.go('layout.categories-edit');
    }

    $scope.removeModal = function (ev, category) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            category.loading = true;
            categoryService.remove(category).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                category.loading = false;
            });
        }, function (err) { });
    };

    var filterTextTimeout;
    $scope.search = function () {
        $scope.params.page = 1;
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
        filterTextTimeout = $timeout(function () {
            loadData();
        }, 250);
    };

    $scope.onPaginate = function () {
        loadData();
    };

    $scope.sortCategories = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true;
        categoryService.get($scope.params).then(function (response) {
            $scope.categories = response.categories;
            $scope.total = response.total;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});
