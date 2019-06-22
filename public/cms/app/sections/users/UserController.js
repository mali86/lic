angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.users', {
        url: '/users',
        controller: 'UserController',
        templateUrl: '/app/sections/users/users.html',
        requiresLogin: true
    });
}).controller('UserController', function ($rootScope, $scope, $state, $mdDialog, userService, $timeout) {
    $scope.params = { page: 1, limit: 10, sort_by: 'id' };
    $scope.userTypes = userService.userTypes;
    $scope.userRoles = userService.userRoles;
    $scope.userRolesObject = userService.userRolesObject;

    loadData();

    $scope.sortUsers = function() {
        loadData();
    };

    $scope.deleteUser = function (ev, user) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            $scope.loading = true;
            userService.remove(user).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                $scope.loading = false;
            });
        }, function (err) { });
    };

    $scope.toggleActive = function (user) {
        user.loading = true;
        var promise = user.active ? userService.activate(user) : userService.deactivate(user);
        promise.then(function (user) {
            $rootScope.$broadcast('toast', { message: "Successfully updated!" });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            user.loading = false;
        });
    };

    $scope.openPasswordChange = function (user) {
        userService.setUser(angular.copy(user));
        $state.go('layout.password-change');
    }

    $scope.openUserEdit = function (user) {
        userService.setUser(angular.copy(user), false);
        $state.go('layout.user-edit');
    }

    $scope.openUserAdd = function () {
        userService.setUser({});
        $state.go('layout.user-edit');
    }

    // $scope.passwordModal = function (ev, user) {
    //     $mdDialog.show({
    //         controller: 'PasswordModalController',
    //         // templateUrl: '/app/sections/users/modals/passwordModal.html',
    //         templateUrl: '/app/sections/users/passwordChange/passwordModal.html',
    //         parent: angular.element(document.body),
    //         targetEvent: ev,
    //         clickOutsideToClose: false,
    //         locals: {
    //             user: angular.copy(user)
    //         }
    //     }).then(function (data) {
    //     }, function (err) { });
    // };

    // $scope.userModal = function (ev, user) {
    //     $mdDialog.show({
    //         controller: 'UserModalController',
    //         // templateUrl: '/app/sections/users/modals/userModal.html',
    //         templateUrl: '/app/sections/users/passwordChange/userModal.html',
    //         parent: angular.element(document.body),
    //         targetEvent: ev,
    //         size: 'lg',
    //         clickOutsideToClose: false,
    //         locals: {
    //             user: angular.copy(user),
    //             profileEdit: false
    //         }
    //     }).then(function (data) {
    //         $scope.params.page = 1;
    //         loadData();
    //     }, function (err) { });
    // };

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

    $scope.filterRoleChanges = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true;
        userService.get($scope.params).then(function (response) {
            $scope.users = response.users;
            $scope.total = response.total;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});
