// 'use strict';
angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.pixie', {
        url: '/merchants/:merchantId/coupons?fmm',
        controller: 'CreateCouponModalController',
        templateUrl: '/app/sections/merchant/coupon/pixieModals/pixieModal.html',
        requiresLogin: true
    });
}).controller('CreateCouponModalController', function ($rootScope, $state, $scope, $mdDialog, $mdSidenav, couponService, merchantService, $window, localStorageService, FileUploader, config, merchantService, $stateParams) {
   
// angular.module('app').controller('CreateCouponModalController', function ($rootScope, $state, $scope, $mdDialog, couponService, $window, coupon, localStorageService, FileUploader, config, merchantService, merchant, $stateParams) {
    
    $scope.coupon = {};
    // $scope.coupon = coupon && coupon.id ? coupon : {};
    // $scope.merchant.id = $stateParams.merchantId;

    $scope.cancel = function () {
        $mdDialog.hide();
    };
    $scope.openPixieEditor = function(ev, cupon) {
        $mdDialog.show({
            controller: 'DetailsModalController',
            // multiple: true,
            templateUrl: '/app/sections/merchant/coupon/pixieModals/modals/detailsModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                merchant: angular.copy($stateParams.merchantId)
            }
        });
        // .then(function (data) {
        //     loadData();
        // }, function (err) { });
    };

    setTimeout(function() {
        var element =  document.getElementById('pixie-id');

        if(element)
            var pixie = new Pixie({
                // watermarkText: '',
                // saveUrl: 'assets/',
                onLoad: function() {
                    console.log('pixie is loaded!');
                    couponService.setIsOpen(true);
                },
                onOpen: function(container, rootScope, window) {
                    console.log(rootScope);
                },

                onSave: function(data, name) {
                    couponService.image = data;
                    $scope.openPixieEditor();
                },
                onClose: function() {
                    $mdDialog.cancel();
                },
                blankCanvasSize: {width: 500, height: 500},
                
                ui: {
                    theme: 'light',
                    mode: 'inline',
                    replaceDefault: false,
                    colorPresets: [
                       'rgb(193, 236, 0)',
                    ],
                    nav: {
                        replaceDefault: true,
                        position: 'bottom',
                        items: [
                            {type: 'separator'},
                            {name: 'resize', icon: 'resize-custom', action: 'resize'},
                            {name: 'crop', icon: 'crop-custom', action: 'crop'},
                            {name: 'transform', icon: 'transform-custom', action: 'rotate'},
                            {type: 'separator'},
                            {name: 'draw', icon: 'pencil-custom', action: 'draw'},
                            {name: 'text', icon: 'text-box-custom', action: 'text'},
                            {name: 'shapes', icon: 'polygon-custom', action: 'shapes'},
                            {name: 'stickers', icon: 'sticker-custom', action: 'stickers'},
                            {name: 'frame', icon: 'frame-custom', action: 'frame'},
                            {type: 'separator'},
                            {name: 'corners', icon: 'rounded-corner-custom', action: 'round'},
                            {name: 'background', icon: 'background-custom', action: 'background'},
                            {name: 'merge', icon: 'merge-custom', action: 'merge'},
                    ]
                    },
                    openImageDialog: {
                        show: true,
                        // sampleImages?: {url: string, thumbnail?: string}[],
                    },
                    toolbar: {
                        // hide: true,
                        // hideOpenButton?: boolean,
                        hideCloseButton: true,
                        // hideSaveButton?: boolean,
                        // openButtonAction: function() {

                        // },
                    },
                },
               
                tools: {
                    shapes: {
                        replaceDefault: false,
                        // items: defaultShapes.slice(),
                        items: [{
                            name: 'Духић',
                            type: 'Path',
                            options: {
                                path: 'M500.907,376.747c-64.853-11.093-93.867-75.947-97.28-83.627v-0.853c-3.413-6.827-4.267-11.947-2.56-16.213 c3.413-7.68,17.92-12.8,27.307-15.36c2.56-0.853,5.12-1.707,6.827-2.56c17.92-7.68,27.307-17.067,27.307-28.16 c0-8.533-6.827-17.067-17.067-20.48c-3.413-1.707-7.68-2.56-11.947-2.56c-2.56,0-6.827,0.853-11.093,2.56 c-8.533,3.413-15.36,5.973-20.48,5.973c-1.707,0-3.413,0-5.12-0.853c0.853-2.56,0.853-5.12,0.853-8.533v-1.707 c1.707-34.987,5.12-78.507-6.827-104.107c-34.987-76.8-107.52-82.773-128.853-82.773h-10.24c-21.333,0-93.867,5.973-128,82.773           c-11.947,25.6-9.387,69.12-6.827,104.107c0.853,3.413,0.853,6.827,0.853,10.24c-1.707,0-4.267,0.853-6.827,0.853            c-6.827,0-13.653-1.707-22.187-5.973c-11.947-5.12-34.987,2.56-37.547,17.92c-1.707,8.533,1.707,20.48,27.307,30.72             c1.707,0.853,4.267,1.707,7.68,2.56c8.533,2.56,23.04,7.68,26.453,15.36c1.707,3.413,0.853,9.387-2.56,16.213           c-1.707,2.56-31.573,71.68-98.987,82.773C4.267,376.747,0,382.72,0,389.547c0,2.56,0.853,4.267,1.707,5.973         c5.12,13.653,27.307,22.187,67.413,29.013c0.853,2.56,1.707,7.68,2.56,10.24c0.853,3.413,1.707,7.68,2.56,11.947            c0.853,4.267,5.12,11.093,15.36,11.093c3.413,0,7.68-0.853,11.947-1.707c6.827-1.707,15.36-3.413,26.453-3.413          c6.827,0,12.8,0.853,19.627,2.56c11.947,1.707,23.04,9.387,34.987,17.92c17.92,12.8,34.133,22.187,67.413,22.187            c0.853,0,1.707,0,2.56,0s2.56,0,3.413,0c29.013,0,54.613-7.68,76.8-22.187c11.947-7.68,23.04-16.213,34.987-17.92           c5.973-0.853,12.8-1.707,18.773-1.707c10.24,0,18.773,0.853,26.453,2.56c5.12,0.853,9.387,1.707,12.8,1.707         c6.827,0,12.8-4.267,14.507-11.093c0.853-4.267,1.707-7.68,2.56-11.947c0.853-1.707,1.707-6.827,2.56-9.387         c40.107-5.973,59.733-15.36,65.707-28.16c0.853-1.707,1.707-4.267,1.707-5.973C512.853,384.427,507.733,377.6,500.907,376.747z           M440.32,408.32c-10.24,0.853-11.947,11.093-14.507,22.187c-0.853,2.56-1.707,5.973-2.56,9.387c-1.707,0-4.267,0-8.533-0.853            c-8.533-1.707-17.92-3.413-29.867-3.413c-6.827,0-13.653,0.853-21.333,1.707c-15.36,2.56-29.013,11.947-41.813,21.333           C302.933,472.32,281.6,478.293,256,478.293c-0.853,0-1.707,0-3.413,0c-0.231,0-0.445,0-0.64,0c-0.073,0-0.146,0-0.213,0         c-28.16,0-41.813-8.533-58.027-19.627c-12.8-9.387-25.6-18.773-41.813-21.333c-6.827-0.853-14.507-1.707-21.333-1.707           c-12.8,0-23.04,1.707-29.867,3.413c-3.413,0.853-5.973,1.707-8.533,1.707c-0.853-3.413-1.707-6.827-2.56-10.24          c-2.56-11.093-4.267-21.333-14.507-23.04c-37.547-5.12-50.347-12.8-54.613-16.213c69.973-14.507,102.4-82.773,106.667-92.16         c5.12-11.093,5.973-21.333,2.56-29.867c-6.827-15.36-25.6-21.333-37.547-24.747c-2.56,0-4.267-0.853-5.973-1.707            C71.68,236.8,69.12,231.68,69.12,230.827c0-2.56,5.973-5.973,11.093-5.973c1.707,0,2.56,0,2.56,0           c10.24,5.12,20.48,7.68,29.013,7.68c12.8,0,19.627-5.973,21.333-7.68s2.56-3.413,2.56-5.973c0-5.12-0.853-10.24-0.853-15.36         c-2.56-33.28-5.12-74.24,5.12-96.427c29.867-67.413,93.867-72.533,112.64-72.533h8.533h0.853c18.773,0,82.773,5.12,113.493,70.827           c9.387,22.187,6.827,63.147,5.12,96.427v1.707c0,5.12-0.853,9.387-0.853,13.653c0,2.56,0.853,5.12,2.56,6.827           c1.707,1.707,7.68,6.827,20.48,7.68c8.533-0.853,17.067-3.413,27.307-7.68c1.707-0.853,5.973-0.853,9.387,0.853         c4.267,1.707,5.973,4.267,5.973,5.12c0,1.707-3.413,6.827-17.067,11.947c-1.707,0.853-4.267,1.707-6.827,2.56           c-11.093,3.413-29.867,9.387-36.693,24.747c-4.267,8.533-2.56,18.773,2.56,29.867c3.413,8.533,34.987,78.507,105.813,93.013         C488.96,395.52,477.013,402.347,440.32,408.32z'
                            } 
                        }]
                    },
                    frame: {
                    replaceDefault: false,
                    items: [
                        {
                            name: 'test',
                            mode: 'streach',
                            size: {
                                min: 1,
                                max: 35,
                                default: 10,
                            }
                        }
                    ]
                },
                text: {
                    replaceDefault: false,
                    items: [{
                        family: 'verdanaaa',
                        category: 'display',
                        filePath: 'assets/fonts/naturePro.ttf',
                        type: 'custom'
                    },]
                }
                }
            });
        }, 500);
   

    $scope.goBack = function () {
        $state.go('layout.coupons', {merchantId: $stateParams.merchantId});
    };
    
    // if ($scope.coupon && $scope.coupon.id) {
    //     $scope.coupon.start_date = moment($scope.coupon.start_date).toDate();
    //     $scope.coupon.end_date = moment($scope.coupon.end_date).toDate();
    //     if ($scope.coupon && $scope.coupon.files) {
    //         _.each($scope.coupon.files, function (file) {
    //             file.extension = file.url.substr(file.url.lastIndexOf('.') + 1);
    //         });
    //     }
    // } else {
    //     $scope.coupon.start_date = moment().toDate();
    //     $scope.coupon.end_date = moment().add(1, 'days').toDate();
    // }

    // $scope.uploader = new FileUploader({
    //     url: config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file',
    //     headers: {
    //         'Authorization': localStorageService.get('token')
    //     }
    // });

    // $scope.uploader.filters.push({
    //     name: 'imageFilter',
    //     fn: function (item /*{File|FileLikeObject}*/, options) {
    //         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
    //         return '|jpg|png|jpeg|pdf|'.indexOf(type) !== -1;
    //     }
    // });

    // $scope.uploader.onBeforeUploadItem = function (item) {
    //     item.url = config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file';
    //     item.formData.push({ 'coupon_id': $scope.coupon.id });
    // };

    // $scope.uploader.onCompleteAll = function () {
    //     $scope.loading = false;
    //     $rootScope.$broadcast('toast', { message: 'Successfully saved' });
    //     $mdDialog.hide($scope.coupon);
    // };

    // $scope.save = function () {
    //     var coupon = angular.copy($scope.coupon);
    //     coupon.start_date = moment(coupon.start_date).format('YYYY-MM-DDTHH:mm:ssZ');
    //     coupon.end_date = moment(coupon.end_date).format('YYYY-MM-DDTHH:mm:ssZ');
    //     coupon.merchant_id = $stateParams.merchantId;
    //     $scope.loading = true;
    //     console.log(coupon);

    //     // var promise = coupon.id ? couponService.update(coupon) : couponService.add(coupon);
    //     // promise.then(function (response) {
    //     //     if ($scope.uploader.queue && $scope.uploader.queue.length) {
    //     //         $scope.coupon.id = response.id;
    //     //         $scope.uploader.uploadAll();
    //     //     } else {
    //     //         $rootScope.$broadcast('toast', { message: 'Successfully saved' });
    //     //         $scope.loading = false;
    //     //         $mdDialog.hide($scope.coupon);
    //     //     }
    //     // }, function (err) {
    //     //     $rootScope.$broadcast('toast', {
    //     //         message: err.data && err.data.message ? err.data.message : 'Server error.'
    //     //     });
    //     // });
    // };

    // $scope.removeFile = function (file) {
    //     file.loading = true;
    //     couponService.removeFile($scope.coupon, file).then(function () {
    //         $scope.coupon.files = _.reject($scope.coupon.files, function (fileFromList) {
    //             return file.id == fileFromList.id;
    //         });
    //     }, function (err) {
    //         $rootScope.$broadcast('toast', {
    //             message: err.data && err.data.message ? err.data.message : 'Server error.'
    //         });
    //     }).finally(function () {
    //         file.loading = false;
    //     });
    // }

    
});
