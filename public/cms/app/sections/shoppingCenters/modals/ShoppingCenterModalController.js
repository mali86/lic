'use strict';
angular.module('app').controller('ShoppingCenterModalController', function ($rootScope, $scope, $mdDialog, shoppingCenterService, localStorageService, shoppingCenter, areaService, merchantService, FileUploader, $timeout) {
    $scope.shoppingCenter = shoppingCenter && shoppingCenter.id ? shoppingCenter : {};
    $scope.all = {
        from: '',
        to: ''
    };

    if ($scope.shoppingCenter.id) {
        $scope.searchAreaText = $scope.shoppingCenter.area_name;
        if (!$scope.shoppingCenter.working_hours) {
            $scope.shoppingCenter.working_hours = angular.copy(shoppingCenterService.workingDays);
        }
        _.each($scope.shoppingCenter.working_hours, function (day) {
            if (day.from) day.from = moment(day.from, ["hh:mm A"]).toDate();
            if (day.to) day.to = moment(day.to, ["hh:mm A"]).toDate()
        });
    } else {
        $scope.shoppingCenter.working_hours = angular.copy(shoppingCenterService.workingDays);
    }

    $scope.uploader = new FileUploader({
        url: config.baseAddress + 'shopping-centers/' + $scope.shoppingCenter.id + '/upload-file',
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
        item.url = config.baseAddress + 'shopping-centers/' + $scope.shoppingCenter.id + '/upload-file';
        item.formData.push({'id': $scope.shoppingCenter.id});
    };

    $scope.uploader.onCompleteAll = function () {
        $scope.loading = false;
        $rootScope.$emit('toast', {message: 'Successfully saved!', type: 'success'});

        $mdDialog.hide($scope.shoppingCenter);
    };

    $scope.uploader.onAfterAddingFile = function (item) {
        $scope.imagePreparedForUpload = item;
    };

    $scope.removeLogo = function () {
        shoppingCenterService.removeFile($scope.shoppingCenter.id).then(function () {
            $scope.imagePreparedForUpload = undefined;
            $scope.shoppingCenter.logo = undefined;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.setTime = function () {
        _.each($scope.shoppingCenter.working_hours, function (day) {
            day.from = $scope.all.from;
            day.to = $scope.all.to;
        });
    };

    var filterZipTextTimeout;
    $scope.geoLocationByZip = function (zip) {
        if (filterZipTextTimeout) $timeout.cancel(filterZipTextTimeout);
        if (!zip) return false;
        filterZipTextTimeout = $timeout(function () {
            $scope.loadingByZip = true;
            merchantService.geoLocationByZip(zip).then(function (response) {
                if (response.address) $scope.shoppingCenter.address = response.address;
                if (response.city) $scope.shoppingCenter.city = response.city;
                if (response.lat) $scope.shoppingCenter.lat = response.lat;
                if (response.lon) $scope.shoppingCenter.lon = response.lon;
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error.'
                });
            }).finally(function () {
                $scope.loadingByZip = false;
            });
        }, 250);
    };

    $scope.save = function () {
        $scope.loading = true;
        var shoppingCenter = angular.copy($scope.shoppingCenter);
        var workingHoursValid = true;
        var invalidDates = 0;
        _.each(shoppingCenter.working_hours, function (day) {
            if (!day.from && !day.to || (!_.isDate(day.from)) && !_.isDate(day.to)) invalidDates++;

            if (day.from && day.to) {
                day.from = moment(day.from).format('hh:mm A');
                day.to = moment(day.to).format('hh:mm A');
            }
            if (day.from && !day.to) workingHoursValid = false;
            if (!day.from && day.to) workingHoursValid = false;
        });
        if (!workingHoursValid) {
            $rootScope.$broadcast('toast', {
                message: 'Please fill all required fields in working hours section.'
            });
            $scope.loading = false;
            return false;
        }

        if (invalidDates == shoppingCenter.working_hours.length) delete shoppingCenter.working_hours;
        if (_.isNull(shoppingCenter.website)) delete shoppingCenter.website;
        shoppingCenter.user_id = $rootScope.session.user_id;

        var promise = shoppingCenter.id ? shoppingCenterService.update(shoppingCenter) : shoppingCenterService.add(shoppingCenter);
        promise.then(function (shoppingCenter) {
            if ($scope.imagePreparedForUpload) {
                $scope.uploader.uploadItem($scope.imagePreparedForUpload);
            } else {
                $rootScope.$emit('toast', {message: 'Successfully saved!', type: 'success'});
                $scope.loading = false;
                $mdDialog.hide(shoppingCenter);
            }
        }, function (err) {
            $scope.loading = false;

            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.loadArea = function (q) {
        var query = {limit: 10, page: 1};
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
            $scope.shoppingCenter.area_id = area.id;
        } else {
            $scope.shoppingCenter.area_id = undefined;
            $scope.searchAreaText = '';
        }
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
