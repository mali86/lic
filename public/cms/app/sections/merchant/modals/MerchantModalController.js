'use strict';
angular.module('app').controller('MerchantModalController', function ($rootScope, $scope, $mdDialog, merchantService, merchant, localStorageService, areaService, shoppingCenterService, categoryService, FileUploader, $timeout) {
    $scope.merchant = merchant ? merchant : {};
    if ($scope.merchant && $scope.merchant.id) {
        if ($scope.merchant.area_id) $scope.searchAreaText = $scope.merchant.area_name;
        if ($scope.merchant.shopping_center_id) $scope.searchTextShoppingCenter = $scope.merchant.shopping_center_name;
    }

    $scope.save = function () {
        $scope.loading = true;

        var merchant = angular.copy($scope.merchant);
        merchant.user_id = $rootScope.session.user_id;
        merchant.categories = _.map(merchant.categories, function (category) {
            return category.id;
        });
        var promise = $scope.merchant.id ? merchantService.update(merchant) : merchantService.add(merchant);
        promise.then(function (response) {
            $scope.merchant = response;
            if ($scope.imagePreparedForUpload) {
                $scope.uploader.uploadItem($scope.imagePreparedForUpload);
            } else {
                $rootScope.$emit('toast', { message: 'Successfully saved!', type: 'success' });
                $mdDialog.hide($scope.merchant);
            }
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            if (!$scope.imagePreparedForUpload) {
                $scope.loading = false;
            }
        });
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
            $scope.merchant.area_id = area.id;
        } else {
            $scope.merchant.area_id = undefined;
            $scope.searchAreaText = '';
            $scope.merchant.shopping_center_id = undefined;
            $scope.searchTextShoppingCenter = '';
            $scope.selectedShoppingCenter = undefined;
        }
    };

    $scope.loadShoppingCenters = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;
        if ($scope.merchant.area_id) query.area = $scope.merchant.area_id;

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
            $scope.merchant.shopping_center_id = shoppingCenter.id;
            if (shoppingCenter.address) $scope.merchant.address = shoppingCenter.address;
            if (shoppingCenter.city) $scope.merchant.city = shoppingCenter.city;
            if (shoppingCenter.zip) $scope.merchant.zip = shoppingCenter.zip;

            if (!$scope.merchant.area_id) {
                $scope.merchant.area_id = shoppingCenter.area_id;
                $scope.searchAreaText = shoppingCenter.area_name;
                $scope.selectedArea = {
                    id: shoppingCenter.area_id,
                    name: shoppingCenter.area_name
                };
            }
        } else {
            $scope.merchant.shopping_center_id = undefined;
            $scope.searchTextShoppingCenter = '';
        }
    };

    $scope.loadCategories = function (query) {
        $scope.categoryLoading = true;
        return categoryService.get({ search: query, limit: 10, page: 1 }).then(function (response) {
            $scope.categoryLoading = false;
            return response.categories;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.uploader = new FileUploader({
        url: config.baseAddress + 'merchants/' + $scope.merchant.id + '/upload-file',
        headers: {
            'Authorization': localStorageService.get('token')
        },
        alias: 'logo'
    });

    $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|'.indexOf(type) !== -1;
        }
    });

    $scope.uploader.onBeforeUploadItem = function (item) {
        item.url = config.baseAddress + 'merchants/' + $scope.merchant.id + '/upload-file';
        item.formData.push({ 'id': $scope.merchant.id });
    };

    $scope.uploader.onCompleteAll = function () {
        $scope.loading = false;
        $rootScope.$emit('toast', { message: 'Successfully saved!', type: 'success' });

        $mdDialog.hide($scope.merchant);
    };

    $scope.uploader.onAfterAddingFile = function (item) {
        $scope.imagePreparedForUpload = item;
    };

    $scope.removeLogo = function () {
        merchantService.removeFile($scope.merchant.id).then(function () {
            $scope.imagePreparedForUpload = undefined;
            $scope.merchant.logo = undefined;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    var filterZipTextTimeout;
    $scope.geoLocationByZip = function (zip) {
        if (filterZipTextTimeout) $timeout.cancel(filterZipTextTimeout);
        filterZipTextTimeout = $timeout(function () {
            $scope.loadingByZip = true;
            merchantService.geoLocationByZip(zip).then(function (response) {
                $scope.merchant.address = response.address;
                $scope.merchant.city = response.city;
                $scope.merchant.lat = response.lat;
                $scope.merchant.lon = response.lon;
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error.'
                });
            }).finally(function () {
                $scope.loadingByZip = false;
            });
        }, 250);
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
