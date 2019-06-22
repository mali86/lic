'use strict';
angular.module('app').controller('CategoryModalController', function ($rootScope, $scope, $mdDialog, localStorageService, categoryService, category, FileUploader, config) {
    $scope.category = category ? category : {};

    $scope.uploader = new FileUploader({
        url: config.baseAddress + 'categories/' + $scope.category.id + '/upload-file',
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
        item.url = config.baseAddress + 'categories/' + $scope.category.id + '/upload-file';
        item.formData.push({ 'id': $scope.category.id });
    };

    $scope.uploader.onCompleteAll = function () {
        $scope.loading = false;
        $rootScope.$emit('toast', { message: 'Successfully saved!', type: 'success' });

        $mdDialog.hide($scope.category);
    };

    $scope.uploader.onAfterAddingFile = function (item) {
        $scope.imagePreparedForUpload = item;
    };

    $scope.save = function () {
        $scope.loading = true;
        var promise = $scope.category.id ? categoryService.update($scope.category) : categoryService.add($scope.category);
        promise.then(function (category) {
            $scope.category.id = category.id;
            if ($scope.imagePreparedForUpload) {
                $scope.uploader.uploadItem($scope.imagePreparedForUpload);
            } else {
                $rootScope.$emit('toast', { message: 'Successfully saved!', type: 'success' });
                $mdDialog.hide(category);
            }
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    $scope.removeLogo = function () {
        categoryService.removeFile($scope.category.id).then(function () {
            $scope.imagePreparedForUpload = undefined;
            $scope.category.logo = undefined;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
