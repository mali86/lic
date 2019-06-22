angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.merchant-request', {
        url: '/merchant-requests',
        controller: 'MerchantRequestController',
        templateUrl: '/app/sections/merchantRequest/merchantRequest.html',
        requiresLogin: true
    });
}).controller('MerchantRequestController', function ($scope, $state, $mdDialog, merchantService) {
    $scope.params = { page: 1, limit: 10 };

    loadData();

    $scope.previewMerchantModal = function (ev, merchantRequest) {
        $mdDialog.show({
            controller: 'MerchantRequestModalController',
            templateUrl: '/app/sections/merchantRequest/modals/merchantRequestModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                merchantRequest: angular.copy(merchantRequest)
            }
        }).then(function (data) {
            $scope.params.page = 1;
            loadData();
        }, function (err) { });
    };

    $scope.onPaginate = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true;
        merchantService.getUnapproved($scope.params).then(function (response) {
            $scope.merchants = response.merchants;
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
