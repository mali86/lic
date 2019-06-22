angular.module('app', [
  'angular-jwt',
  'ngMaterial',
  'ui.router',
  'md.data.table',
  'LocalStorageModule',
  'ngTagsInput',
  'angularFileUpload',
  'mdPickers',
  'lic.templates',
  'zingchart-angularjs'
])
.config(function ($urlRouterProvider, jwtInterceptorProvider, $httpProvider, $locationProvider, jwtOptionsProvider, localStorageServiceProvider, $mdThemingProvider, $compileProvider) {
    $mdThemingProvider.definePalette('customBlue', {
        '50': '155487',
        '100': '155487',
        '200': '155487',
        '300': '155487',
        '400': '155487',
        '500': '155487', // sidebar menu list background active
        '600': '155487', // hover
        '700': '155487', // hue 
        '800': '155487', // hue 2
        '900': '155487',
        'A100': '11527c', // sidebar logo background
        'A200': '155487',
        'A400': '155487',
        'A700': '155487',
        'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                            // on this palette should be dark or light

        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
         '200', '300', '400', 'A100'],
        'contrastLightColors': 'dark'    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default')
    .primaryPalette('customBlue')
    .accentPalette('orange');

    $urlRouterProvider.otherwise('/home');

    $compileProvider.preAssignBindingsEnabled(true);

    localStorageServiceProvider.setPrefix('lic.admin');

    jwtInterceptorProvider.tokenGetter = ['localStorageService', function (localStorageService) {
        return localStorageService.get('token');
    }];

    jwtOptionsProvider.config({
        tokenGetter: ['localStorageService', function (localStorageService) {
            return localStorageService.get('token');
        }],
        authPrefix: '',
        unauthenticatedRedirector: ['$state', function($state) {
            $state.go('login');
        }],
        whiteListedDomains: [
        	'localhost',
            'lifeisacoupon.org',
            '18.221.164.53',
            '18.223.38.238',
            '172.16.40.61',
            'api.lifeisacoupon.info',
            'api.lifeisacoupon.com',
            'dev.lifeisacoupon.info'
        ],
    });

    $httpProvider.interceptors.push('jwtInterceptor');
    $httpProvider.interceptors.push(function ($injector, $q, localStorageService, $rootScope) {
        return {
            responseError: function (response) {
                var appConfig = $injector.get('config');
                var $http = $injector.get('$http');
                var $state = $injector.get('$state');
                if ((response.status == 401 || response.status == 403) && response.config.url.startsWith(appConfig.baseAddress)
                    && response.data.message.toLowerCase().indexOf('unauthenticated') != -1) {
                    localStorageService.remove('token');
                    delete $http.defaults.headers.common.Authorization;
                    $rootScope.session = {};
                    $state.go('login');
                }

                return $q.reject(response);
            }
        };
    });
    $locationProvider.html5Mode(false);
    // $locationProvider.html5Mode({
    //   enabled: true,
    //   requireBase: false
    // });
    firebase.initializeApp(configFireBase);
})
.run(function ($rootScope, $state, jwtHelper, $mdToast, localStorageService, authManager, userService) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        $rootScope.state = toState;
        $rootScope.previousState = fromState;
        $rootScope.session = localStorageService.get('token') ? jwtHelper.decodeToken(localStorageService.get('token')) : {};
        if (toState.requiresLogin) {
            if (!localStorageService.get('token') || jwtHelper.isTokenExpired(localStorageService.get('token'))) {
                event.preventDefault();
                if (toState.name == 'register') {
                    $state.go('register');
                } else if (toState.name == 'forgot-password') {
                    $state.go('forgot-password');
                } else if (toState.name == 'change-password') {
                    $state.go('change-password');
                } else {
                    $state.go('login');
                }
            }
        } else if (localStorageService.get('token') && !jwtHelper.isTokenExpired(localStorageService.get('token')) && toState.name == 'login') {
            event.preventDefault();
            $state.go('layout.home');
        }
        if(toState.name == 'layout.home') {
            $rootScope.isBackActive = false;
        } else if(toState.name == 'layout.merchant') {
            $rootScope.isBackActive = false;
        } else if(toState.name == 'layout.areas') {
            $rootScope.isBackActive = false;
        } else if(toState.name == 'layout.push-notification') {
            $rootScope.isBackActive = false;
        } else if(toState.name == 'layout.settings') {
            $rootScope.isBackActive = false;
        } else if(toState.name == 'layout.users') {
            $rootScope.isBackActive = false;
        } else {
            $rootScope.isBackActive = true;
        }
    });

    $rootScope.$on('toast', function (e, data) {
        if (data && data.message) {
            $mdToast.show(
              $mdToast.simple()
                .content(data.message)
                .hideDelay(data.duration ? data.duration : 2000)
            );
        }
    });
});

angular.module('app').constant('config', config);
angular.module('app').constant('configFireBase', configFireBase);;angular.module('app').directive('ngThumb', ['$window', function ($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function (item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function (file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            scope: {
                file: '=',
                width: '=',
                height: '='
            },
            link: function(scope, element, attributes) {
                if (!helper.support) return;
                scope.$watch('file', function (newValue, oldValue) {
                    reader.onload = onLoadFile;
                    reader.readAsDataURL(scope.file);
                });

                var canvas = element.find('canvas');
                var reader = new FileReader();

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = scope.width || this.width / this.height * scope.height;
                    var height = scope.height || this.height / this.width * scope.width;
                    canvas.attr({ width: width, height: height, class: 'img-rounded img-responsive' });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }]);;angular.module('app').filter("correctedDate", function () {
    return function (date) {
        if (date) {
            return moment.utc(date).local().format("MM/DD/YYYY HH:mm");
        }
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.areas-edit', {
        url: '/areas/areas-edit',
        controller: 'AreaAddEditController',
        templateUrl: '/app/sections/areas/addEditAreas/areaAddEdit.html',
        requiresLogin: true
    });
}).controller('AreaAddEditController', function ($scope, $mdDialog, areaService, stateService) {
    $scope.area = areaService.getAreaData();
    if ($scope.area && $scope.area.id) {
        $scope.selectedState = { id: $scope.area.state_id, name: $scope.area.state_name };
        $scope.searchStateText = $scope.area.state_name;
    }

    $scope.loadStates = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;

        return stateService.get(query).then(function (response) {
            return response.states;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.save = function () {
        $scope.loading = true;
        var area = angular.copy($scope.area);
        area.state_id = $scope.selectedState.id;
        var promise = area.id ? areaService.update(area) : areaService.add(area);
        promise.then(function (area) {
            $rootScope.$broadcast('toast', { message: 'Successfully saved!' });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function() {
            $scope.loading = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.areas', {
        url: '/areas',
        controller: 'AreaController',
        templateUrl: '/app/sections/areas/area.html',
        requiresLogin: true
    });
}).controller('AreaController', function ($rootScope, $scope, $state, $mdDialog, areaService, $timeout) {
    $scope.params = { page: 1, limit: 10 };

    loadData();

    $scope.areaModal = function (ev, area) {
        $mdDialog.show({
            controller: 'AreaModalController',
            templateUrl: '/app/sections/areas/modals/areaModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                area: angular.copy(area)
            }
        }).then(function (data) {
            $scope.params.page = 1;
            loadData();
        }, function (err) { });
    };

    $scope.openAreaAdd = function () {
        areaService.setAreaData(null);
        $state.go('layout.areas-edit');
    }

    $scope.openAreaEdit = function (area) {
        areaService.setAreaData(angular.copy(area));
        $state.go('layout.areas-edit');
    }

    $scope.removeModal = function (ev, area) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            area.loading = true;
            areaService.remove(area).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                area.loading = false;
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

    $scope.sortAreas = function() {
        loadData();
    };

    function loadData() {
        $scope.loading = true;
        areaService.get($scope.params).then(function (response) {
            $scope.areas = response.areas;
            $scope.total = response.total;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});;'use strict';
angular.module('app').controller('AreaModalController', function ($scope, $mdDialog, areaService, area, stateService) {
    $scope.area = area;
    if ($scope.area && $scope.area.id) {
        $scope.selectedState = { id: $scope.area.state_id, name: $scope.area.state_name };
        $scope.searchStateText = $scope.area.state_name;
    }

    $scope.loadStates = function (q) {
        var query = { limit: 10, page: 1 };
        if (q) query.search = q;

        return stateService.get(query).then(function (response) {
            return response.states;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    };

    $scope.save = function () {
        $scope.loading = true;
        var area = angular.copy($scope.area);
        area.state_id = $scope.selectedState.id;
        var promise = area.id ? areaService.update(area) : areaService.add(area);
        promise.then(function (area) {
            $mdDialog.hide(area);
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function() {
            $scope.loading = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.categories-edit', {
        url: '/areas/categories-edit',
        controller: 'CategoriesAddEditController',
        templateUrl: '/app/sections/categories/categoriesAddEdit/categoryAddEdit.html',
        requiresLogin: true
    });
}).controller('CategoriesAddEditController', function ($rootScope, $scope, $mdDialog, localStorageService, categoryService, FileUploader, config) {
    $scope.category = categoryService.getCategoryData() ? categoryService.getCategoryData() : {};

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
;angular.module('app').config(function ($stateProvider) {
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
;'use strict';
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
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('change-password', {
        controller: 'ChangePasswordController',
        url: '/change-password?token&data',
        templateUrl: '/app/sections/change-password/change-password.html',
        requiresLogin: false
    });
}).controller('ChangePasswordController', function ($rootScope, $scope, userService, $state, $stateParams) {
    $scope.data = {password: '', password_confirmation: ''};

    $scope.changePassword = function () {
        $scope.loading = true;
        userService.passwordReset({
            token: $stateParams.token,
            data: $stateParams.data,
            password: $scope.data.password,
            password_confirmation: $scope.data.password_confirmation
        }).then(function (data) {
            if (data && data.id) $scope.success = true;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data.message ? err.data.message : 'Server error.'
            });

            $state.go('login');
        }).finally(function () {
            $scope.loading = false;
        });
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('confirm-email', {
        controller: 'ConfirmEmailController',
        url: '/confirm-email?token&data',
        templateUrl: '/app/sections/confirmEmail/confirmEmail.html',
        requiresLogin: false
    });
}).controller('ConfirmEmailController', function ($rootScope, $scope, userService, $state, $stateParams) {
    $scope.loading = true;
    userService.confirmEmail({
        token: $stateParams.token,
        data: $stateParams.data
    }).then(function (data) {
        if (data && data.id) $scope.success = true;
    }, function (err) {
        $rootScope.$broadcast('toast', {
            message: err.data.message ? err.data.message : 'Server error.'
        });

        $state.go('login');
    }).finally(function () {
        $scope.loading = false;
    });
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('forgot-password', {
        url: '/forgot-password',
        controller: 'ForgotPasswordController',
        templateUrl: '/app/sections/forgot-password/forgot-password.html'
    });
}).controller('ForgotPasswordController', function ($scope, $state, userService, $rootScope) {
    $scope.data = {email: ''};

    $scope.forgotPassword = function () {
        $scope.loading = true;
        userService.forgotPassword({email: $scope.data.email}).then(function (response) {
            $scope.email = '';
            $rootScope.$broadcast('toast', {
                message: 'Email successfully sent, please check you email.'
            });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.home', {
        url: '/home',
        controller: 'HomeController',
        templateUrl: '/app/sections/home/home.html',
        requiresLogin: true
    });
}).controller('HomeController', function ($rootScope, $scope, $state, userService, merchantService) {
    $scope.stats = {};
    $scope.graphStats = {
      merchants: [],
      users: [],
      coupons: []
    };

    if($rootScope.session.role != 'admin') {
      me();
    }

    // if()
    homeStats();
    statistic();
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

    let date = new Date();
    let setMonths = new Array();

    for(let i = 0; i<4; i++) {
      // console.log(i);
      // setMonths.push(months[date.getMonth() - i]);
      // if(date.getMonth(3) < 4) {
      //   console.log(date.getMonth());
      // }
      if(date.getMonth() < 4) {
        setMonths.unshift(months[12 - i]);
      } else {
        setMonths.unshift(months[date.getMonth() - i]);
      }
    }

    function statistic() {
      userService.statistic().then(function (response) {
        $scope.graphStats = response;
        $scope.myJson = {
           gui: {
              contextMenu: {
                button: {
                  visible: 0
                }
              }
            },
            backgroundColor: "#fff",
            globals: {
                shadow: false,
                fontFamily: "Helvetica"
            },
            type: "area",

            legend: {
                layout: "x4",
                backgroundColor: "transparent",
                borderColor: "transparent",
                marker: {
                    borderRadius: "50px",
                    borderColor: "transparent"
                },
                item: {
                    fontColor: "#000"
                }

            },
            scaleX: {
                maxItems: 5,
                transform: {
                    type: 'date',
                    all: '%M'
                },
                zooming: true,
                values: [
                  setMonths[0], setMonths[1], 
                  setMonths[2], setMonths[3]
                ],
                lineColor: "#000",
                lineWidth: "1px",
                tick: {
                    lineColor: "white",
                    lineWidth: "1px"
                },
                item: {
                    fontColor: "#000"
                },
                step: 'month',
                guide: {
                    visible: true
                }
            },
            scaleY: {
                lineColor: "#000",
                lineWidth: "1px",
                tick: {
                    lineColor: "#000",
                    lineWidth: "1px"
                },
                guide: {
                    lineStyle: "solid",
                    lineColor: "#626262"
                },
                item: {
                    fontColor: "#000"
                },
            },
            tooltip: {
                visible: false
            },
            crosshairX: {
                scaleLabel: {
                    backgroundColor: "#fff",
                    fontColor: "black"
                },
                plotLabel: {
                    backgroundColor: "#434343",
                    fontColor: "#FFF",
                    _text: "Number of hits : %v"
                }
            },
            plot: {
                lineWidth: "2px",
                aspect: "spline",
                marker: {
                    visible: true
                }
            },
          series: [{
            text: "Users",
            values: [$scope.graphStats.users[0], $scope.graphStats.users[1], $scope.graphStats.users[2], $scope.graphStats.users[3]],
            backgroundColor1: "#377BB6",
            backgroundColor2: "#272822",
            lineColor: "#377BB6"
          },
          {
            text: "Merchants",
            values: [$scope.graphStats.merchants[0], $scope.graphStats.merchants[1], $scope.graphStats.merchants[2], $scope.graphStats.merchants[3]],
            backgroundColor1: "#60B85F",
            backgroundColor2: "#272822",
            lineColor: "#60B85F"
          },
          {
            text: "Coupons",
            values: [$scope.graphStats.coupons[0], $scope.graphStats.coupons[1], $scope.graphStats.coupons[2], $scope.graphStats.coupons[3]],
            backgroundColor1: "#EEAC54",
            backgroundColor2: "#272822",
            lineColor: "#EEAC54"
          }]
        }
      }, function(err) {
        $rootScope.$broadcast('toast', {
            message: err.data && err.data.message ? err.data.message : 'Server error.'
        });
      });
    }

    function homeStats() {
        $scope.loading = true;
        userService.getHomeInformation().then(function (response) {
        $scope.stats = response;
        $scope.loading = false;
    }, function (err) {
        $rootScope.$broadcast('toast', {
            message: err.data && err.data.message ? err.data.message : 'Server error.'
        });
    }).finally(function () {
        $scope.loading = false;
    });
    }

    function me() {
        userService.me().then(function (response) {

        if($rootScope.session.role != 'sc-user' && $rootScope.session.role != 'admin') {
            if(response.merchant_id) {
              initializeData(response.merchant_id);
            }
        }
            
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {

        });
    }

    function initializeData(merchantId) {
        $scope.loading = true;
        merchantService.getById(merchantId).then(function (response) {
            $scope.merchant =  response;
            $scope.loading = false;
        }, function(err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            $scope.loading = false;  
        }).finally(function () {
            $scope.loading = false;
        });
    }

    




    $scope.redirectToUsers = function () {
        $state.go('layout.users');
    }
    $scope.redirectToMerchants = function () {
        $state.go('layout.merchant');
    }
});
;angular.module('app').config(function ($stateProvider) {
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
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        controller: 'LoginController',
        templateUrl: '/app/sections/login/login.html'
    });
}).controller('LoginController', function ($scope, $state, userService, localStorageService, $rootScope) {
    $scope.user = {};

    $scope.login = function () {
        $scope.loading = true;
        // localStorageService.set('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
        //     $state.go('layout.home');
        userService.login($scope.user).then(function (response) {
            localStorageService.set('token', response.token);
            $state.go('layout.home');
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Invalid email/password.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.merchants-edit', {
        url: '/merchants/merchants-edit',
        controller: 'MerchantAddEditController',
        templateUrl: '/app/sections/merchant/addEditMerchant/merchantAddEdit.html',
        requiresLogin: true
    }).state('layout.merchants-edit.kml', {
        url: '/KML',
        controller: 'MerchantAddEditKMLController',
        templateUrl: '/app/sections/merchant/addEditMerchant/merchantAddEdit-KML.html'
    }).state('layout.merchants-edit.edit', {
        url: '/edit',
        templateUrl: '/app/sections/merchant/addEditMerchant/merchantAddEdit-Edit.html'
        
    });
}).controller('MerchantAddEditController', function ($rootScope, $state, $scope, $mdDialog, merchantService, localStorageService, areaService, shoppingCenterService, categoryService, FileUploader, $timeout) {
    $scope.merchant = merchantService.getMerchantData() ? merchantService.getMerchantData() : {};

    if ($scope.merchant && $scope.merchant.id) {
        if ($scope.merchant.area_id) $scope.searchAreaText = $scope.merchant.area_name;
        if ($scope.merchant.shopping_center_id) $scope.searchTextShoppingCenter = $scope.merchant.shopping_center_name;
    }
    // google map

    // end google map

    $scope.isEmpty = function (obj) {
        // console.log('obj',obj);
        for (var i in obj) if (obj.hasOwnProperty(i)) return false;
        return true;
    };

    $scope.nextStep = function () {
        $state.go('layout.merchants-edit.kml');
        merchantService.setMerchantData(angular.copy($scope.merchant));
    }

    $scope.save = function (kmlCoords) {

        if(kmlCoords) {
            // $scope.merchant.coordinates = kmlCoords.join();
            $scope.merchant.coordinates = kmlCoords;
        } else {
            $scope.merchant.coordinates = '';
        }

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
            }
            $state.go('layout.merchants-edit.edit');
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
            if (shoppingCenter.lat) $scope.merchant.lat = shoppingCenter.lat;
            if (shoppingCenter.lon) $scope.merchant.lon = shoppingCenter.lon;

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


}).controller('MerchantAddEditKMLController', function ($rootScope, $state, $scope, $mdDialog, merchantService, localStorageService, areaService, shoppingCenterService, categoryService, FileUploader, $timeout) {
    
    $scope.merchant = merchantService.getMerchantData() ? merchantService.getMerchantData() : {};

    var drawingManager;
    var selectedShape;
    var colors = ['#155487'];
    // var selectedColor;
    var colorButtons = {};
    // $scope.lat_longs = new Array();
    $scope.lat_longs_string = '';
    var lat, lng;

    initialize();

    function clearSelection () {
        if (selectedShape) {
            if (selectedShape.type !== 'marker') {
                selectedShape.setEditable(false);
            }

            selectedShape = null;
        }
    }

    function setSelection (shape) {
        // console.log(shape);
        if (shape.type !== 'marker') {
            clearSelection();
            shape.setEditable(true);
            // selectColor(shape.get('fillColor') || shape.get('strokeColor'));
        }
        
        selectedShape = shape;
    }

    function deleteSelectedShape () {
        if (selectedShape) {
            selectedShape.setMap(null);
        }
        $scope.lat_longs_string = '';
        lat, lng = null;
        // for (i=0; i < lat_longs.length; i++) {   // Clear out the polygons entry
        //     if (selectedShape.getPath == lat_longs[i].getPath) {
        //         lat_longs.splice(i, 1);
        //     }
        // }
    }

    function selectColor (color) {

        var polygonOptions = drawingManager.get('polygonOptions');
        polygonOptions.fillColor = color;
        drawingManager.set('polygonOptions', polygonOptions);

    }

    function setValue(shape) {
        var newShapePath = shape.getPath().getArray();
    }

    function initialize () {

        var polygon_plan_0 = new Array();
        var allCoords = angular.copy($scope.merchant.coordinates);
        var newLatLng = new Array();
        var coordsArray = new Array();
        var initialCoords = [
            // new google.maps.LatLng(38.957352, -77.402403)
            // ,
            // new google.maps.LatLng(38.956593, -77.399131)
            // ,
            // new google.maps.LatLng(38.95741, -77.401513)
        ];
        if(allCoords) {
            var coordsArray = allCoords.split(" ");

            for(i = 0; i < coordsArray.length; i++ ) {
                newLatLng = coordsArray[i].split(',');
                // console.log('test' , newLatLng);
                if(newLatLng.length > 2) {
                    polygon_plan_0.push(new google.maps.LatLng(newLatLng[1], newLatLng[0]));
                }
            } 
        } else {
            polygon_plan_0.push(initialCoords);
        }

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 17,
            center: new google.maps.LatLng(38.95726, -77.401062),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true
        });

        // var customCords = [
        //     new google.maps.LatLng(38.957352, -77.402403)
        //     ,
        //     new google.maps.LatLng(38.956593, -77.399131)
        //     ,
        //     new google.maps.LatLng(38.95741, -77.401513)
        // ];

        // var customCords = [
        //   [38.957352, -77.402403],
        //   [38.956593,-77.399131],
        //   [38.95741, -77.401513]
        // ];

        var polyOptions = {
            strokeWeight: 0,
            fillOpacity: 0.45,
            editable: true,
            draggable: true,
        };

        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_LEFT,
              drawingModes: ['polygon']
            },
            drawingControl: true,
            polygonOptions: polyOptions,
            map: map
        });
        
        if(polygon_plan_0 != []) {
            var polygon_0 = new google.maps.Polygon({
                paths: polygon_plan_0,
                strokeWeight: 0,
                fillOpacity: 0.45,
                editable: true,
                draggable: true
            });

            polygon_0.setMap(map);
        }

        google.maps.event.addListener(polygon_0.getPath(), 'set_at', function(e) {
            setSelection(polygon_0);
            var polygonPaths = polygon_0.getPath().getArray();
            if (e.vertex !== undefined) {
                var path = polygon_0.getPaths().getAt(e.path);
                path.removeAt(e.vertex);
                if (path.length < 3) {
                    polygon_0.setMap(null);
                }
            }
            $scope.lat_longs_string = ' ';
            for (var i = 0; i < polygonPaths.length; i++) {
              lat = polygonPaths[i].lat();
              lng = polygonPaths[i].lng();
              $scope.lat_longs_string += lng + ',' + lat + ',' + 0 + ' ';
            }            
        });

        google.maps.event.addListener(polygon_0.getPath(), 'insert_at', function(e) {
            setSelection(polygon_0);
            var polygonPaths = polygon_0.getPath().getArray();
            if (e.vertex !== undefined) {
                var path = polygon_0.getPaths().getAt(e.path);
                path.removeAt(e.vertex);
                if (path.length < 3) {
                    polygon_0.setMap(null);
                }
            }
            $scope.lat_longs_string = ' '
            for (var i = 0; i < polygonPaths.length; i++) {
              lat = polygonPaths[i].lat();
              lng = polygonPaths[i].lng();
              $scope.lat_longs_string += lng + ',' + lat + ',' + 0 + ' ';
            }            
        });

        google.maps.event.addListener(polygon_0, 'click', function (e) {

            setSelection(polygon_0);
            // console.log(polygon_0);
            var polygonPaths = polygon_0.getPath().getArray();
            if (e.vertex !== undefined) {
                var path = polygon_0.getPaths().getAt(e.path);
                path.removeAt(e.vertex);
                if (path.length < 3) {
                    polygon_0.setMap(null);
                }
            }
            $scope.lat_longs_string = ' ';
            for (var i = 0; i < polygonPaths.length; i++) {
                lat = polygonPaths[i].lat();
                lng = polygonPaths[i].lng();
                $scope.lat_longs_string += lng + ',' + lat + ',' + 0 + ' ';
            }            
        });


        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
            var newShape = e.overlay;
            
            newShape.type = e.type;

            if (e.type !== google.maps.drawing.OverlayType.MARKER) {
                // Switch back to non-drawing mode after drawing a shape.
                drawingManager.setDrawingMode(null);

                // Add an event listener that selects the newly-drawn shape when the user
                // mouses down on it.
                google.maps.event.addListener(newShape.getPath(), 'set_at', function(e) {
                    setSelection(newShape);
                    var polygonPaths = newShape.getPath().getArray();
                    if (e.vertex !== undefined) {
                        var path = newShape.getPaths().getAt(e.path);
                        path.removeAt(e.vertex);
                        if (path.length < 3) {
                            newShape.setMap(null);
                        }
                    }      
                    $scope.lat_longs_string = ' ';
                    for (var i = 0; i < polygonPaths.length; i++) {
                      lat = polygonPaths[i].lat();
                      lng = polygonPaths[i].lng();
                      $scope.lat_longs_string += lng + ',' + lat + ',' + 0 + ' ';
                    }      
                });

                google.maps.event.addListener(newShape.getPath(), 'insert_at', function(e) {
                    setSelection(newShape);
                    var polygonPaths = newShape.getPath().getArray();
                    if (e.vertex !== undefined) {
                        var path = newShape.getPaths().getAt(e.path);
                        path.removeAt(e.vertex);
                        if (path.length < 3) {
                            newShape.setMap(null);
                        }
                    }
                    $scope.lat_longs_string = ' '
                    for (var i = 0; i < polygonPaths.length; i++) {
                      lat = polygonPaths[i].lat();
                      lng = polygonPaths[i].lng();
                      $scope.lat_longs_string += lng + ',' + lat + ',' + 0 + ' ';
                    }            
                });

                google.maps.event.addListener(newShape, 'click', function (e) {
                    if (e.vertex !== undefined) {
                        if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
                            var path = newShape.getPaths().getAt(e.path);
                            path.removeAt(e.vertex);
                            if (path.length < 3) {
                                newShape.setMap(null);
                            }
                        }
                    }
                    setSelection(newShape);
                    setValue(newShape);
                });

                google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                    var newPoly = polygon.getPath();
                    // var polygonPaths = newPoly.getPath().getArray();
                    $scope.lat_longs_string = '';
                    for (var i = 0; i < newPoly.length; i++) {
                      lat = newPoly.getAt(i).lat(),
                      lng = newPoly.getAt(i).lng();
                      $scope.lat_longs_string += lng + ',' + lat + ',' + 0 + ' ';
                    }            
                });
                
                setSelection(newShape);
            }
            else {
                google.maps.event.addListener(newShape, 'click', function (e) {
                    setSelection(newShape);
                });
                setSelection(newShape);
            }

        });

        // Clear the current selection when the drawing mode is changed, or when th
        // map is clicked.
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
        google.maps.event.addListener(map, 'click', clearSelection);
        google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);

        // buildColorPalette();
    }

});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.coupon-edit', {
        url: '/merchants/coupon/addEditCoupon/coupon-edit',
        controller: 'CouponAddEditController',
        templateUrl: '/app/sections/merchant/coupon/addEditCoupon/couponAddEdit.html',
        requiresLogin: true
    });
}).controller('CouponAddEditController', function ($rootScope, $scope, $mdDialog, couponService, localStorageService, FileUploader, config, merchantService) {
    
    $scope.coupon = couponService.getCouponData();
    $scope.merchant = couponService.getMerchant();

    if ($scope.coupon && $scope.coupon.id) {
        $scope.coupon.start_date = moment($scope.coupon.start_date).toDate();
        $scope.coupon.end_date = moment($scope.coupon.end_date).toDate();
        if ($scope.coupon && $scope.coupon.files) {
            _.each($scope.coupon.files, function (file) {
                file.extension = file.url.substr(file.url.lastIndexOf('.') + 1);
            });
        }
    } else {
        $scope.coupon.start_date = moment().toDate();
        $scope.coupon.end_date = moment().add(1, 'days').toDate();
    }

    $scope.uploader = new FileUploader({
        url: config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file',
        headers: {
            'Authorization': localStorageService.get('token')
        }
    });

    $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|pdf|'.indexOf(type) !== -1;
        }
    });

    $scope.uploader.onBeforeUploadItem = function (item) {
        console.log(item);
        item.url = config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file';
        item.formData.push({ 'coupon_id': $scope.coupon.id });
        
    };

    $scope.uploader.onCompleteAll = function () {
        $scope.loading = false;
        $rootScope.$broadcast('toast', { message: 'Successfully saved' });
        $mdDialog.hide($scope.coupon);
    };

    $scope.save = function () {
        var coupon = angular.copy($scope.coupon);
        coupon.start_date = moment(coupon.start_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.end_date = moment(coupon.end_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.merchant_id = $scope.merchant.id;
        $scope.loading = true;

        var promise = coupon.id ? couponService.update(coupon) : couponService.add(coupon);
        promise.then(function (response) {
            if ($scope.uploader.queue && $scope.uploader.queue.length) {
                $scope.coupon.id = response.id;
                $scope.uploader.uploadAll();
            } else {
                $rootScope.$broadcast('toast', { message: 'Successfully saved' });
                $scope.loading = false;
                $mdDialog.hide($scope.coupon);
            }
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.removeFile = function (file) {
        file.loading = true;
        couponService.removeFile($scope.coupon, file).then(function () {
            $scope.coupon.files = _.reject($scope.coupon.files, function (fileFromList) {
                return file.id == fileFromList.id;
            });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            file.loading = false;
        });
    }

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.coupons', {
        url: '/merchants/:merchantId/coupons?fmm',
        controller: 'MerchantCouponController',
        templateUrl: '/app/sections/merchant/coupon/coupon.html',
        requiresLogin: true
    });
}).controller('MerchantCouponController', function ($rootScope, $scope, $state, $mdDialog, couponService, merchantService, userService, $stateParams) {
    var imageExtensions = ['jpg', 'jpeg', 'png', 'bpm'];
    $scope.params = { page: 1, limit: 10 };
    
    merchantService.getById($stateParams.merchantId).then(function (response) {
        $scope.merchant = response;
    }, function (err) {
        $rootScope.$broadcast('toast', {
            message: err.data && err.data.message ? err.data.message : 'Server error'
        });
    });

    userService.me().then(function (response) {
        if(response.type == 1) {
            $stateParams.merchantId = response.merchant_id;
        }
        loadData();
    }, function (err) {
        loadData();
        $rootScope.$broadcast('toast', {
            message: err.data && err.data.message ? err.data.message : 'Server error'
        });
    });

    $scope.goBack = function () {
      if ($stateParams.fmm) {
          $state.go('layout.shopping-centers');
      } else {
          $state.go('layout.merchant');
      }
    };

    $scope.openPixieEditor = function(ev, cupon) {
        couponService.setIsOpen(false);
        $state.go('layout.pixie', {merchantId: $stateParams.merchantId});
    };

    // $scope.openCouponModal = function (ev, cupon) {
    //     $mdDialog.show({
    //         controller: 'CouponModalController',
    //         templateUrl: '/app/sections/merchant/coupon/modals/couponModal.html',
    //         parent: angular.element(document.body),
    //         targetEvent: ev,
    //         size: 'lg',
    //         clickOutsideToClose: false,
    //         locals: {
    //             coupon: angular.copy(cupon),
    //             merchant: angular.copy($scope.merchant)
    //         }
    //     }).then(function (data) {
    //         loadData();
    //     }, function (err) { });
    // };

    $scope.openCouponEdit = function (coupon) {
        couponService.setCouponData(angular.copy(coupon));
        couponService.setMerchant(angular.copy($scope.merchant));
        $state.go('layout.coupon-edit');
    };

    $scope.openCouponAdd = function () {
        couponService.setCouponData({});
        couponService.setMerchant(angular.copy($scope.merchant));
        $state.go('layout.coupon-edit'); 
    }

    $scope.removeModal = function (ev, coupon) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            coupon.deleteLoading = true;
            couponService.remove(coupon).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                coupon.deleteLoading = false;
            });
        }, function (err) { });
    };

    $scope.onPaginate = function () {
        loadData();
    };

    $scope.sortBy = function () {
        loadData();
    };

    $scope.toggleActive = function (coupon) {
        var tmpCoupon = angular.copy(coupon);
        coupon.toggleLoading = true;
        tmpCoupon.active = !tmpCoupon.active;
        couponService.toggleActive($stateParams.merchantId, tmpCoupon).then(function () {
            coupon.active = tmpCoupon.active;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error'
            });
        }).finally(function () {
            coupon.toggleLoading = false;
        });
    };

    function loadData() {
        $scope.loading = true;
        merchantService.getCouponsForMerchant($stateParams.merchantId, $scope.params).then(function (response) {
            $scope.coupons = response.coupons;
            _.each($scope.coupons, function(coupon) {
                var image = _.find(coupon.files, function (file) {
                    var extension = file.url.substr(file.url.lastIndexOf('.') + 1);
                    return imageExtensions.indexOf(extension) != -1;
                });

                if (image) coupon.image = image;
            });
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
;'use strict';
angular.module('app').controller('CouponModalController', function ($rootScope, $scope, $mdDialog, couponService, coupon, localStorageService, FileUploader, config, merchantService, merchant) {
    
    $scope.coupon = coupon && coupon.id ? coupon : {};
    $scope.merchant = merchant;

    if ($scope.coupon && $scope.coupon.id) {
        $scope.coupon.start_date = moment($scope.coupon.start_date).toDate();
        $scope.coupon.end_date = moment($scope.coupon.end_date).toDate();
        if ($scope.coupon && $scope.coupon.files) {
            _.each($scope.coupon.files, function (file) {
                file.extension = file.url.substr(file.url.lastIndexOf('.') + 1);
            });
        }
    } else {
        $scope.coupon.start_date = moment().toDate();
        $scope.coupon.end_date = moment().add(1, 'days').toDate();
    }

    $scope.uploader = new FileUploader({
        url: config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file',
        headers: {
            'Authorization': localStorageService.get('token')
        }
    });

    $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|pdf|'.indexOf(type) !== -1;
        }
    });

    $scope.uploader.onBeforeUploadItem = function (item) {
        console.log(item);
        item.url = config.baseAddress + 'coupons/' + $scope.coupon.id + '/upload-file';
        item.formData.push({ 'coupon_id': $scope.coupon.id });
        
    };

    $scope.uploader.onCompleteAll = function () {
        $scope.loading = false;
        $rootScope.$broadcast('toast', { message: 'Successfully saved' });
        $mdDialog.hide($scope.coupon);
    };

    $scope.save = function () {
        var coupon = angular.copy($scope.coupon);
        coupon.start_date = moment(coupon.start_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.end_date = moment(coupon.end_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.merchant_id = $scope.merchant.id;
        $scope.loading = true;

        var promise = coupon.id ? couponService.update(coupon) : couponService.add(coupon);
        promise.then(function (response) {
            if ($scope.uploader.queue && $scope.uploader.queue.length) {
                $scope.coupon.id = response.id;
                $scope.uploader.uploadAll();
            } else {
                $rootScope.$broadcast('toast', { message: 'Successfully saved' });
                $scope.loading = false;
                $mdDialog.hide($scope.coupon);
            }
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    $scope.removeFile = function (file) {
        file.loading = true;
        couponService.removeFile($scope.coupon, file).then(function () {
            $scope.coupon.files = _.reject($scope.coupon.files, function (fileFromList) {
                return file.id == fileFromList.id;
            });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            file.loading = false;
        });
    }

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;// 'use strict';
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
;'use strict';
angular.module('app').controller('DetailsModalController', function ($rootScope, $scope, $mdDialog, couponService, localStorageService, FileUploader, config, merchantService, merchant) {
    
    $scope.coupon = {};
    $scope.merchant = merchant;

    $scope.coupon.start_date = moment().toDate();
    $scope.coupon.end_date = moment().add(1, 'days').toDate();

    $scope.save = function () {
        var coupon = angular.copy($scope.coupon);
        coupon.start_date = moment(coupon.start_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.end_date = moment(coupon.end_date).format('YYYY-MM-DDTHH:mm:ssZ');
        coupon.merchant_id = parseInt($scope.merchant);
        coupon.image = couponService.image;
        $scope.loading = true;

        var promise = couponService.add(coupon);
        promise.then(function (response) {
                $scope.coupon.id = response.id;
                $rootScope.$broadcast('toast', { message: 'Successfully saved' });
                $scope.loading = false;
                $mdDialog.hide($scope.coupon);
        }, function (err) {
            $scope.loading = false;
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };
    
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.merchant', {
        url: '/merchants',
        controller: 'MerchantController',
        templateUrl: '/app/sections/merchant/merchant.html',
        requiresLogin: true
    });
}).controller('MerchantController', function ($rootScope, $scope, $state, $mdDialog, merchantService, $timeout, categoryService) {
    $scope.params = { page: 1, limit: 10, sort_by: 'id'};

    $scope.orderValues = merchantService.orderValues;
    var shoppingCenterId = 424;

    loadData();
    loadCategories();

    $scope.sortMerchants = function () {
        loadData();
    };

    var filterTextTimeout;
    $scope.search = function () {
        $scope.params.page = 1;
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
        filterTextTimeout = $timeout(function () {
            loadData();
        }, 250);
    };

    $scope.selectFilter = function() {
        for(i=0; i < 4; i++) {
            $scope.params["filters["+ i +"]"] = null;
        }
        $scope.filters.forEach(function(data, index) {
            $scope.params["filters["+ index +"]"] = data;
        });
        $scope.params.page = 1;
        loadData();

    }

    function loadCategories() {
        $scope.categoryLoading = true;
        categoryService.get({ limit: 10, page: 1 }).then(function (response) {
            $scope.categoryLoading = false;
            $scope.categories = response.categories;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    };

    // $scope.openMerchantModal = function (ev, merchant) {
    //     $mdDialog.show({
    //         controller: 'MerchantModalController',
    //         templateUrl: '/app/sections/merchant/modals/merchantModal.html',
    //         parent: angular.element(document.body),
    //         targetEvent: ev,
    //         size: 'lg',
    //         clickOutsideToClose: false,
    //         locals: {
    //             merchant: angular.copy(merchant)
    //         }
    //     }).then(function (data) {
    //         loadData();
    //     }, function (err) { });
    // };

    $scope.openMerchantAdd = function() {
        merchantService.setMerchantData(null);
        $state.go('layout.merchants-edit.edit');
    }

    $scope.openMerchantEdit = function(merchant) {
        merchantService.setMerchantData(angular.copy(merchant));
        $state.go('layout.merchants-edit.edit');
    }

    $scope.removeModal = function (ev, merchant) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            merchantService.remove(merchant.id).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data.message ? err.data.message : 'Server error.'
                });
            });
        });
    };

    $scope.sendNotification = function (ev, merchant) {
        console.log('send notification.');
         $mdDialog.show({
            controller: 'MerchantNotificationModalController',
            templateUrl: '/app/sections/merchant/modals/notificationModal/merchantNotificationModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                merchant: angular.copy(merchant)
            }
        }).then(function (data) {
            loadData();
        }, function (err) { });
    }

    $scope.onPaginate = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true
;        merchantService.get($scope.params).then(function (response) {
            $scope.merchants = response.merchants;
            $scope.total = response.total;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});
;'use strict';
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
;'use strict';
angular.module('app').controller('MerchantNotificationModalController', function ($rootScope, $scope, $mdDialog, merchantService, merchant, pushNotificationService, localStorageService, areaService, shoppingCenterService, categoryService, FileUploader, $timeout) {
    $scope.merchant = merchant;
    
    $scope.send = function() {
        $scope.loading = true;

        pushNotificationService.send($scope.notification, 'merchant-' + $scope.merchant.id, $scope.merchant.id).then(function(response) {
            $rootScope.$broadcast('toast', { message: 'Successfully sent' });
            $scope.loading = false;

        }, function(err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        });
    }

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
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
;'use strict';
angular.module('app').controller('MerchantRequestModalController', function ($rootScope, $scope, $mdDialog, merchantService, merchantRequest, localStorageService) {
    $scope.merchant = merchantRequest;

    $scope.approve = function () {
        $scope.loadingApprove = true;
        merchantService.approve($scope.merchant.id).then(function (response) {
            $rootScope.$broadcast('toast', { message: 'Successfully approved!', type: 'success' });
            $mdDialog.hide();
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loadingApprove = false;
        });
    };

    $scope.reject = function () {
        $scope.loadingReject = true;
        merchantService.reject($scope.merchant.id).then(function (r) {
            $scope.$emit('toast', { message: 'Successfully rejected!', type: 'success' });
            $mdDialog.hide();
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function() {
            $scope.loadingReject = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
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



;angular.module('app').config(function ($stateProvider) {
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
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.settings', {
        url: '/settings',
        controller: 'SettingsController',
        templateUrl: '/app/sections/settings/settings.html',
        requiresLogin: true
    });
}).controller('SettingsController', function ($rootScope, $stateParams, $scope, $mdDialog, userService, merchantService, shoppingCenterService) {

    $scope.session = $rootScope.session;
    $scope.userRoles = userService.userRoles;
    // $scope.user = user ? user : {};
    $scope.user = {};
    // $scope.profileEdit = profileEdit;
    $scope.profileEdit = false;

    loadUserData();

    if($scope.session.role == 'user') {
        $scope.profileText = "Profile";
    } else {
        $scope.profileText =  "Edit";
    }

    $scope.data = {};
    if (!$scope.user.id) $scope.user.type = $scope.userRoles[1].id;

    $scope.save = function () {
        $scope.loading = true;
        var promise = $scope.user.id ? userService.update($scope.user) : userService.add($scope.user);
        promise.then(function (user) {
            $rootScope.$broadcast('toast', { message: 'Successfully saved!' });
            $scope.loading = false;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    function loadUserData() {
    	$scope.loading = true;
    	userService.me().then(function (response) {
    		$scope.loading = false;
    		$scope.user = response;
            // console.log($scope.user);
    	}, function (err) {
    		$rootScope.$broadcast('toast', {
    			message: err.data && err.data.message ? err.data.message : 'Server  error.'
    		});
    	});
    };
    
});







;'use strict';
angular.module('app').controller('MerchantListModalController', function ($rootScope, $scope, $mdDialog, shoppingCenterService, shoppingCenter, $state, merchantService) {
    $scope.shoppingCenter = shoppingCenter;
    $scope.params = {page: 1, limit: 10};

    loadData();

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.sortMerchants = function () {
        loadData();
    };

    $scope.goToCouponsPage = function (merchant) {
        console.log('click');
        $state.go('layout.coupons', {merchantId: merchant.id, fmm: true});
        $mdDialog.cancel();
    };

    $scope.openMerchantModal = function (ev, merchant) {
        $mdDialog.show({
            controller: 'MerchantModalController',
            templateUrl: '/app/sections/merchant/modals/merchantModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                merchant: angular.copy(merchant)
            }
        }).then(function (data) {
            $mdDialog.show({
                controller: 'MerchantListModalController',
                templateUrl: '/app/sections/shoppingCenters/modals/merchantListModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                size: 'lg',
                clickOutsideToClose: false,
                locals: {
                    shoppingCenter: angular.copy(shoppingCenter)
                }
            }).then(function (data) {
            }, function (err) {
            });
        }, function (err) {
            $mdDialog.show({
                controller: 'MerchantListModalController',
                templateUrl: '/app/sections/shoppingCenters/modals/merchantListModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                size: 'lg',
                clickOutsideToClose: false,
                locals: {
                    shoppingCenter: angular.copy(shoppingCenter)
                }
            }).then(function (data) {
            }, function (err) {
            });
        });
    };

    $scope.removeModal = function (ev, merchant) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            merchantService.remove(merchant.id).then(function (res) {
                $scope.params.page = 1;
                $mdDialog.show({
                    controller: 'MerchantListModalController',
                    templateUrl: '/app/sections/shoppingCenters/modals/merchantListModal.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    size: 'lg',
                    clickOutsideToClose: false,
                    locals: {
                        shoppingCenter: angular.copy(shoppingCenter)
                    }
                }).then(function (data) {
                }, function (err) {
                });
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data.message ? err.data.message : 'Server error.'
                });
            });
        }, function () {
            $mdDialog.show({
                controller: 'MerchantListModalController',
                templateUrl: '/app/sections/shoppingCenters/modals/merchantListModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                size: 'lg',
                clickOutsideToClose: false,
                locals: {
                    shoppingCenter: angular.copy(shoppingCenter)
                }
            }).then(function (data) {
            }, function (err) {
            });
        });
    };

    $scope.onPaginate = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true;

        shoppingCenterService.getMerchantsByShoppingCenter($scope.shoppingCenter.id, $scope.params).then(function (response) {
            $scope.merchants = response.merchants;
            $scope.total = response.total;
        }, function () {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    }
});
;'use strict';
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
;'use strict';
angular.module('app').controller('ShoppingCenterTimeModalController', function ($rootScope, $scope, $mdDialog, shoppingCenterService) {
    $scope.all = {
        from: '',
        to: ''
    };

    $scope.workingDays = angular.copy(shoppingCenterService.workingDays);

    $scope.setTime = function() {
        _.each($scope.workingDays, function(day) {
            day.from = $scope.all.from;
            day.to = $scope.all.to;
        });
    };

    $scope.save = function () {
        _.each($scope.workingDays, function(day) {
            day.from = moment(day.from).format('hh:mm A');
            day.to = moment(day.to).format('hh:mm A');
        });
        $mdDialog.hide($scope.workingDays);
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.shopping-centers', {
        url: '/shopping-centers',
        controller: 'ShoppingCenterController',
        templateUrl: '/app/sections/shoppingCenters/shopping-centers.html',
        requiresLogin: true
    });
}).controller('ShoppingCenterController', function ($rootScope, $scope, $state, $mdDialog, shoppingCenterService, $timeout, merchantService) {
    $scope.params = { page: 1, limit: 10 };

    loadData();

    $scope.merchantsModal = function (ev, shoppingCenter) {
        $mdDialog.show({
            controller: 'MerchantListModalController',
            templateUrl: '/app/sections/shoppingCenters/modals/merchantListModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                shoppingCenter: angular.copy(shoppingCenter)
            }
        }).then(function (data) {
        }, function (err) { });
    };

    $scope.shoppingCenterModal = function (ev, shoppingCenter) {
        $mdDialog.show({
            controller: 'ShoppingCenterModalController',
            templateUrl: '/app/sections/shoppingCenters/modals/shoppingCenterModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            size: 'lg',
            clickOutsideToClose: false,
            locals: {
                shoppingCenter: angular.copy(shoppingCenter)
            }
        }).then(function (data) {
            $scope.params.page = 1;
            loadData();
        }, function (err) { });
    };

    $scope.removeModal = function (ev, shoppingCenter) {
        var confirm = $mdDialog.confirm()
            .title('Delete')
            .textContent('Are you sure?')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
        $mdDialog.show(confirm).then(function () {
            shoppingCenter.loading = true;
            shoppingCenterService.remove(shoppingCenter).then(function (res) {
                $scope.params.page = 1;
                loadData();
            }, function (err) {
                $rootScope.$broadcast('toast', {
                    message: err.data && err.data.message ? err.data.message : 'Server error'
                });
            }).finally(function () {
                shoppingCenter.loading = false;
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

    $scope.sortShoppingCenters = function () {
        loadData();
    };

    function loadData() {
        $scope.loading = true;
        shoppingCenterService.get($scope.params).then(function (response) {
            $scope.shoppingCenters = response.shopping_centers;
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
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.shopping-settings', {
        url: '/sc-settings',
        controller: 'ShoppingSettingsController',
        templateUrl: '/app/sections/shoppingSettings/shoppingSettings.html',
        requiresLogin: true
    });
}).controller('ShoppingSettingsController', function ($rootScope, $scope, $mdDialog, shoppingCenterService, localStorageService, areaService, merchantService, FileUploader, $timeout) {

    $scope.shoppingCenter = shoppingCenterService.getShoppingCenter() ? shoppingCenterService.getShoppingCenter() : {};
    $scope.searchAreaText = "";
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
        }if ($scope.shoppingCenter.id) {
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

    // function loadUserData() {
    //     $scope.loading = true;
    //     shoppingCenterService.getById(424).then(function (response) {
    //         $scope.loading = false;
    //         $scope.shoppingCenter = response;
    //         console.log($scope.shoppingCenter);
    //     }, function (err) {
    //         $rootScope.$broadcast('toast', {
    //             message: err.data && err.data.message ? err.data.message : 'Server  error.'
    //         });
    //     });
    // };


    // function loadValues() {
      
    // };

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
});







;'use strict';
angular.module('app').controller('PasswordModalController', function ($rootScope, $scope, $mdDialog, userService, user) {
    $scope.user = user;
    $scope.session = $rootScope.session;

    $scope.save = function () {
        $scope.loading = true;
        $scope.model.id = $scope.user.id;
        userService.changePassword($scope.model).then(function (user) {
            $rootScope.$broadcast('toast', { message: 'Successfully changed!' });
            $mdDialog.hide(user);
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;'use strict';
angular.module('app').controller('UserModalController', function ($rootScope, $scope, $mdDialog, userService, user, profileEdit, merchantService, shoppingCenterService) {
    $scope.session = $rootScope.session;
    $scope.userRoles = userService.userRoles;
    $scope.user = user ? user : {};
    $scope.profileEdit = profileEdit;
    $scope.data = {};
    if (!$scope.user.id) $scope.user.type = $scope.userRoles[1].id;

    $scope.save = function () {
        $scope.loading = true;
        var promise = $scope.user.id ? userService.update($scope.user) : userService.add($scope.user);
        promise.then(function (user) {
            $rootScope.$emit('toast', {message: 'Successfully saved!', type: 'success'});
            $scope.loading = false;
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

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

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.password-change', {
        url: '/users/password-change',
        controller: 'PasswordModalController',
        templateUrl: '/app/sections/users/passwordChange/passwordModal.html',
        requiresLogin: true
    });
}).controller('PasswordModalController', function ($rootScope, $scope, $state, $mdDialog, userService, $stateParams) {
    // $scope.user = $stateParams.userId;
    $scope.user = userService.getUser();
    $scope.session = $rootScope.session;
    $scope.model = {};
    $scope.save = function () {

        $scope.loading = true;
        if($scope.user.user_id) {
            $scope.model.id = $scope.user.user_id;
        } else {
            $scope.model.id = $scope.user.id;
        }

        // console.log('pw', $scope.model);
        userService.changePassword($scope.model).then(function (user) {
            $rootScope.$broadcast('toast', { message: 'Successfully changed!' });
            $mdDialog.hide(user);
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
});
;angular.module('app').config(function ($stateProvider) {
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
;angular.module('app').config(function ($stateProvider) {
    $stateProvider.state('layout.user-edit', {
        url: '/users/user-edit',
        controller: 'UserModalController',
        templateUrl: '/app/sections/users/userEdit/userModal.html',
        requiresLogin: true
    });
}).controller('UserModalController', function ($rootScope, $scope, $mdDialog, userService, merchantService, shoppingCenterService) {
    $scope.session = $rootScope.session;
    $scope.userRoles = userService.userRoles;
    // $scope.user = user ? user : {};
    $scope.user = userService.getUser();
    // $scope.profileEdit = profileEdit;
    $scope.profileEdit = userService.isProfileEdit();

    $scope.data = {};
    if (!$scope.user.id) $scope.user.type = $scope.userRoles[1].id;


    $scope.save = function () {
        $scope.loading = true;
        var promise = $scope.user.id ? userService.update($scope.user) : userService.add($scope.user);
        promise.then(function (user) {
            $rootScope.$broadcast('toast', { message: 'Successfully saved!' });
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
        }).finally(function () {
            $scope.loading = false;
        });
    };

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

    $scope.loadTypeInfo = function(id) {
        return userService.getTypeInfo(id).then(function (response) {
            $scope.displayMerchant(response.name);
        }, function (err) {
            $rootScope.$broadcast('toast', {
                message: err.data && err.data.message ? err.data.message : 'Server error.'
            });
            return false;
        });
    }

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

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.enableEdit = function() {
        $scope.editType = false;
    };

    if($scope.user.id) {
        $scope.loadTypeInfo($scope.user.id);
        $scope.editType = true;
    } else {
        $scope.editType = false;
    }


    $scope.displayMerchant = function(q) {
        $scope.loadMerchants(q).then(function(data) {
            $scope.data.searchMerchantText = data[0].name;
        });
    }
});
;angular.module('app').factory('areaService', function ($http, config, $q) {
    var factory = {};
    var areaData = {};

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'areas',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'areas',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'areas/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (data) {
        return $http({
            url: config.baseAddress + 'areas/' + data.id,
            method: 'DELETE',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setAreaData = function (area) {
        areaData = area;
    }

    factory.getAreaData = function() {
        return areaData;
    }

    return factory;
});
;angular.module('app').factory('categoryService', function ($http, config, $q) {
    var factory = {};
    var categoryData = {};

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'categories',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'categories',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'categories/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (data) {
        return $http({
            url: config.baseAddress + 'categories/' + data.id,
            method: 'DELETE',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.removeFile = function (categoryId) {
        return $http({
            url: config.baseAddress + 'categories/' + categoryId + '/remove-file',
            method: 'DELETE',
            data: { id: categoryId }
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setCategoryData = function (category) {
        categoryData = category;
    }

    factory.getCategoryData = function () {
        return categoryData;
    }

    return factory;
});
;angular.module('app').factory('couponService', function ($http, config, $q) {
    var factory = {};
    var image;
    var isOpen = true;
    var couponData = {};
    var merchantData = {};

    factory.setIsOpen = function(value) {
        isOpen = value;
    }

    factory.isOpen = function() {
        return isOpen;
    }

    factory.toggleActive = function (merchantId, coupon) {
        var url;
        if (coupon.active) {
            url = config.baseAddress + 'coupons/' + coupon.id + '/activate';
        } else {
            url = config.baseAddress + 'coupons/' + coupon.id + '/deactivate';
        }
        return $http({
            url: url,
            method: 'PUT',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (coupon) {
        return $http({
            url: config.baseAddress + 'coupons/' + coupon.id,
            method: 'DELETE',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.removeFile = function (coupon, file, params) {
        return $http({
            url: config.baseAddress + 'coupons/' + coupon.id + '/remove-file/' + file.id,
            method: 'DELETE',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    // factory.get = function (params) {
    //     return $http({
    //         url: config.baseAddress + 'admin/coupons',
    //         method: 'GET',
    //         params: params
    //     }).then(function (response) {
    //         return response.data;
    //     }, function (err) {
    //         return $q.reject(err);
    //     });
    // };

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'coupons',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'coupons/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setCouponData = function (data) {
        couponData = data;
    };

    factory.getCouponData = function () {
        return couponData;
    }

    factory.setMerchant = function (data) {
        merchantData = data;
    }

    factory.getMerchant = function () {
        return merchantData;
    } 

    

    return factory;
});
;angular.module('app').factory('merchantService', function ($http, config, $q) {
    var factory = {};
    var merchantData = {};

    factory.orderValues = [
        { val: 'name', text: 'A-Z by name' },
        { val: '-name', text: 'Z-A by name' },
    ];

    factory.getCount = function (params) {
        return $http({
            url: config.baseAddress + 'merchants/count',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getUnapprovedCount = function (params) {
        return $http({
            url: config.baseAddress + 'merchants/unapproved-count',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getMerchantsByShoppingCenter = function (shoppingCenterId, params) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + shoppingCenterId + '/merchants',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'merchants',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (id, params) {
        return $http({
            url: config.baseAddress + 'merchants/' + id,
            method: 'DELETE',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'merchants',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.saveCoords = function (merchantId, data) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/kml',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    }

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'merchants/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getCouponsForMerchant = function (merchantId, params) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/coupons',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getById = function (id) {
        return $http({
            url: config.baseAddress + 'merchants/' + id,
            method: 'GET',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getUnapproved = function (params) {
        return $http({
            url: config.baseAddress + 'merchants/unapproved',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.approve = function (merchantId, data) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/approve',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.reject = function (merchantId, data) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/disapprove',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.removeFile = function (merchantId) {
        return $http({
            url: config.baseAddress + 'merchants/' + merchantId + '/remove-file',
            method: 'DELETE',
            data: { id: merchantId }
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.geoLocationByZip = function (query) {
        return $http({
            url: config.baseAddress + 'merchants/get-address/' + query,
            method: 'GET',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setMerchantData = function (merchant) {
        merchantData = {};
        merchantData = merchant;
    }

    factory.getMerchantData = function () {
        return merchantData;
    }

    return factory;
});
;angular.module('app').factory('pushNotificationService', function ($http, config, $q) {
    
    var factory = {};
    var topic;

    factory.send = function(data, target, merchantID) {
        if(target == '') {
            topic = 'admin';
        } else {
            topic = target;
        }
        return $http({
            url: config.baseAddress + 'notification',
            method: 'POST',
            data: {
                topic: topic,
                notification_title: data.title,
                notification_body: data.description,
                action_id: merchantID,
                action: 'merchant',
                merchant_id: merchantID
            },
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

     return factory;
});
;angular.module('app').factory('shoppingCenterService', function ($http, config, $q) {
    var factory = {};
    var shoppingCenterData = {};

    factory.workingDays = [
        { day: 'Monday', from: '', to: '' },
        { day: 'Tuesday', from: '', to: '' },
        { day: 'Wednesday', from: '', to: '' },
        { day: 'Thursday', from: '', to: '' },
        { day: 'Friday', from: '', to: '' },
        { day: 'Saturday', from: '', to: '' },
        { day: 'Sunday', from: '', to: '' },
    ];

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'shopping-centers',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getById = function (shoppingCenterId) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + shoppingCenterId,
            method: 'GET'
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    }

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'shopping-centers',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (data) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + data.id,
            method: 'DELETE',
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getMerchantsByShoppingCenter = function (shoppingCenterId, params) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + shoppingCenterId + '/merchants',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.removeFile = function (shoppingCenterId) {
        return $http({
            url: config.baseAddress + 'shopping-centers/' + shoppingCenterId + '/remove-file',
            method: 'DELETE',
            data: { id: shoppingCenterId }
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.setShoppingCenter = function (shoppingCenter) {
        shoppingCenterData = shoppingCenter;
    }

    factory.getShoppingCenter = function () {
        return shoppingCenterData;
    }




    return factory;
});
;angular.module('app').factory('stateService', function ($http, config, $q) {
    var factory = {};

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'states',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    return factory;
});
;angular.module('app').factory('userService', function ($http, config, $q) {
    var factory = {};
    var userInfo = {};
    var isProfileEdit;
    var previousState = {};

    factory.userRolesObject = {
        1: 'Merchant',
        2: 'Shopping Center',
        // 3: 'Admin'
    };

    factory.userTypes = [
        {name: "Merchant", id: 1},
        {name: "Shopping Center", id: 2}
    ];

    factory.userRoles = [
        {name: "All"},
        {name: "Merchant", id: 1},
        {name: "Shopping Center", id: 2},
        // {name: "Admin", id: 3}
    ];

    factory.setUser = function(data, isProfileEdit) {
        // console.log('service', data, isProfileEdit);
        userInfo = data;
        isProfileEdit = isProfileEdit;
    }

    factory.getUser = function() {
        return userInfo;
    }

    factory.isProfileEdit = function() {
        return isProfileEdit;
    }

    factory.login = function (data) {
        return $http({
            url: config.baseAddress + 'login',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.register = function (data) {
        return $http({
            url: config.baseAddress + 'register',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.get = function (params) {
        return $http({
            url: config.baseAddress + 'users',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.me = function (params) {
        return $http({
            url: config.baseAddress + 'users/me',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.statistic = function(data) {
        return $http({
            url: config.baseAddress + 'statistic',
            method: 'GET',
            data: data
        }).then( function(response) {
            return response.data;
        }, function(err) {
            return $q.reject(err);
        });
    }

    factory.getTypeInfo = function(data) {
        return $http({
            url: config.baseAddress + 'users/typeInfo/' + data,
            method: 'GET',
            data: data
        }).then( function(response) {
            return response.data;
        }, function(err) {
            return $q.reject(err);
        });
    }

    factory.add = function (data) {
        return $http({
            url: config.baseAddress + 'users',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.update = function (data) {
        return $http({
            url: config.baseAddress + 'users/' + data.id,
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.changePassword = function (data) {
        return $http({
            url: config.baseAddress + 'users/' + data.id + '/change-password',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.forgotPassword = function (data) {
        return $http({
            url: config.baseAddress + 'password/email',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.passwordReset = function (data) {
        return $http({
            url: config.baseAddress + 'password/reset',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.checkEmail = function (params) {
        return $http({
            url: config.baseAddress + 'check-email',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.activate = function (data) {
        return $http({
            url: config.baseAddress + 'users/' + data.id + '/activate',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.deactivate = function (data) {
        return $http({
            url: config.baseAddress + 'users/' + data.id + '/deactivate',
            method: 'PUT',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.getHomeInformation = function (params) {
        return $http({
            url: config.baseAddress + 'home',
            method: 'GET',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.remove = function (user, params) {
        return $http({
            url: config.baseAddress + 'users/' + user.id,
            method: 'DELETE',
            params: params
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    factory.confirmEmail = function (data) {
        return $http({
            url: config.baseAddress + 'users/confirm/email',
            method: 'POST',
            data: data
        }).then(function (response) {
            return response.data;
        }, function (err) {
            return $q.reject(err);
        });
    };

    return factory;
});
;angular.module('lic.templates', []).run(['$templateCache', function ($templateCache) {
  "use strict";
  $templateCache.put("/app/sections/areas/addEditAreas/areaAddEdit.html",
    "<!-- md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"table-title\">Area {{area.id ? 'Edit - ' + area.name : 'Add'}}</span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Area {{area.id ? 'Edit - ' + area.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content>\n" +
    "            <div flex layout=\"column\" layout-padding>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"area.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter area name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div flex>\n" +
    "                    <md-autocomplete md-input-name=\"state\" md-selected-item=\"selectedState\" md-search-text=\"searchStateText\" md-selected-item-change=\"selectState(state)\"\n" +
    "                        md-items=\"state in loadStates(searchStateText)\" md-item-text=\"state.name\" md-require-match required md-delay=\"300\"\n" +
    "                        md-min-length=\"0\" md-floating-label=\"State\">\n" +
    "                        <md-item-template>\n" +
    "                            <span md-highlight-text=\"searchStateText\">{{state.name}}</span>\n" +
    "                        </md-item-template>\n" +
    "                        <md-not-found>\n" +
    "                            No matching \"{{searchStateText}}\" states were found.\n" +
    "                        </md-not-found>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.state.$error.required\">Please select state</em>\n" +
    "                    </md-autocomplete>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && area.id\"><span class=\"icon-lic-update btn-icon\"></span> Update</span>\n" +
    "                <span ng-show=\"!loading && !area.id\"><span class=\"icon-lic-save btn-icon\"></span> Add</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/areas/area.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i> -->\n" +
    "             Areas</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\" ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "           <!--  <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openAreaAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New Area\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortAreas\">\n" +
    "                    <tr md-row>\n" +
    "												<th md-column md-order-by=\"name\">\n" +
    "														<span>Name</span>\n" +
    "														<i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "																<md-tooltip md-direction=\"bottom\">Sort by Area name</md-tooltip>\n" +
    "														</i>\n" +
    "												</th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"area in areas track by $index\">\n" +
    "                        <td md-cell ng-bind=\"area.name\"></td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-button class=\"md-accent md-hue-1 md-icon-button td-btn-edit\" ng-click=\"openAreaEdit(area)\">\n" +
    "                                <span class=\"icon-lic-edit\" aria-hidden=\"true\"></span>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                            <md-button class=\"md-icon-button md-warn td-btn-delete\" ng-disabled=\"area.loading\" ng-click=\"removeModal($event, area)\">\n" +
    "                                <span class=\"icon-lic-delete\" aria-hidden=\"true\"></span>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no areas in your database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\"\n" +
    "                             md-options=\"[10, 20, 30]\"\n" +
    "                             md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\"\n" +
    "                             md-on-paginate=\"onPaginate\"\n" +
    "                             md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/areas/modals/areaModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Area {{area.id ? 'Edit - ' + area.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"area.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter area name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div flex>\n" +
    "                    <md-autocomplete md-input-name=\"state\" md-selected-item=\"selectedState\" md-search-text=\"searchStateText\" md-selected-item-change=\"selectState(state)\"\n" +
    "                        md-items=\"state in loadStates(searchStateText)\" md-item-text=\"state.name\" md-require-match required md-delay=\"300\"\n" +
    "                        md-min-length=\"0\" md-floating-label=\"State\">\n" +
    "                        <md-item-template>\n" +
    "                            <span md-highlight-text=\"searchStateText\">{{state.name}}</span>\n" +
    "                        </md-item-template>\n" +
    "                        <md-not-found>\n" +
    "                            No matching \"{{searchStateText}}\" states were found.\n" +
    "                        </md-not-found>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.state.$error.required\">Please select state</em>\n" +
    "                    </md-autocomplete>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && area.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !area.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/categories/categories.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i>  -->\n" +
    "        Categories</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\"\n" +
    "                       ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "            <!-- <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openCategoryAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New Category\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortCategories\">\n" +
    "                <tr md-row>\n" +
    "                    <th md-column md-order-by=\"name\">\n" +
    "                        <span>Name</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Category name</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column >\n" +
    "                        <span>Image</span>\n" +
    "                    </th>\n" +
    "                    <th md-column >\n" +
    "                        <span>Color</span>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                <tr md-row ng-repeat=\"category in categories track by $index\">\n" +
    "                    <td md-cell ng-bind=\"category.name\"></td>\n" +
    "                    <td md-cell>\n" +
    "                        <div class=\"category-image\">\n" +
    "                            <img ng-if=\"category.logo\" width=\"125\" height=\"125\" ng-src=\"{{category.logo}}\">\n" +
    "                            <img ng-if=\"!category.logo\" width=\"125\" height=\"125\" src=\"../../../assets/images/no-image.png\">\n" +
    "                        </div>\n" +
    "                    </td>\n" +
    "                    <td md-cell>\n" +
    "                        <div class=\"category-color\">\n" +
    "                            <!-- <img ng-if=\"category.logo\" width=\"125\" height=\"125\" ng-src=\"{{category.logo}}\">\n" +
    "                            <img ng-if=\"!category.logo\" width=\"125\" height=\"125\" src=\"../../../assets/images/no-image.png\"> -->\n" +
    "                            <span class=\"color-present\" style=\"background-color: {{convertHex(category.color)}}; color: #ffffff;\" >{{category.color}}</span>\n" +
    "                        </div>\n" +
    "                    </td>\n" +
    "                    <td md-cell text-right>\n" +
    "                        <md-button class=\"md-accent md-hue-1 md-icon-button td-btn-edit\" ng-click=\"openCategoryEdit(category)\">\n" +
    "                            <span class=\"icon-lic-edit\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button class=\"md-icon-button md-warn td-btn-delete\" ng-disabled=\"category.loading\"\n" +
    "                                   ng-click=\"removeModal($event, category)\">\n" +
    "                            <span class=\"icon-lic-delete\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no categories in your\n" +
    "            database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\"\n" +
    "                             md-options=\"[10, 20, 30]\"\n" +
    "                             md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\"\n" +
    "                             md-on-paginate=\"onPaginate\"\n" +
    "                             md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/categories/categoriesAddEdit/categoryAddEdit.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"table-title\">\n" +
    "        Category {{category.id ? 'Edit - ' + category.name : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Category {{category.id ? 'Edit - ' + category.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content>\n" +
    "            <div flex layout=\"column\" layout-padding>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"category.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter category name</em>\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Color #123456</label>\n" +
    "                        <input ng-model=\"category.color\" name=\"color\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter category color in hexadecial, example: #FFFFFF</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Category Image</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"category.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{category.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && category.id\"><span class=\"icon-lic-update btn-icon\"></span> Update Category </span>\n" +
    "                <span ng-show=\"!loading && !category.id\"><span class=\"icon-lic-save btn-icon\"></span> Add Category </span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/categories/modals/categoryModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Category {{category.id ? 'Edit - ' + category.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input ng-model=\"category.name\" name=\"name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter category name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Category Image</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"category.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{category.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && category.id\">Update Category </span>\n" +
    "                <span ng-show=\"!loading && !category.id\">Add Category </span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/change-password/change-password.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\" layout-padding>\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp\">\n" +
    "						<div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "								<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "						</div>\n" +
    "						<form name=\"form\" layout=\"column\" ng-if=\"!success\">\n" +
    "								<md-input-container flex>\n" +
    "										<label>New password</label>\n" +
    "										<input type=\"password\"\n" +
    "													 ng-model=\"data.password\"\n" +
    "													 ng-minlength=\"6\"\n" +
    "													 required>\n" +
    "										<em>* minimum 6 characters long</em>\n" +
    "								</md-input-container>\n" +
    "								<md-input-container flex class=\"password-container\">\n" +
    "										<label>Confirm password</label>\n" +
    "										<input type=\"password\" ng-model=\"data.password_confirmation\" required>\n" +
    "								</md-input-container>\n" +
    "								<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"changePassword()\" pull-right ng-disabled=\"form.$invalid || loading || (data.password != data.password_confirmation)\">\n" +
    "										<span ng-show=\"!loading\">Change password</span>\n" +
    "										<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait..</span>\n" +
    "								</md-button>\n" +
    "						</form>\n" +
    "            <div ng-if=\"!loading && success\" class=\"text-center\">\n" +
    "                <h3>You have successfully changed your password!</h3>\n" +
    "                <h3>Thank you!</h3>\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ui-sref=\"login\">Login</md-button>\n" +
    "            </div>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/confirmEmail/confirmEmail.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\" layout-padding>\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp text-center\">\n" +
    "            <div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "                <img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "            </div>\n" +
    "            <div ng-if=\"!loading && success\">\n" +
    "                <h3>You have successfully confirmed your email address!</h3>\n" +
    "                <h3>Thank you!</h3>\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ui-sref=\"login\">Login</md-button>\n" +
    "            </div>\n" +
    "            <h3 ng-if=\"loading\">Please wait...</h3>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/forgot-password/forgot-password.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\">\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp\" >\n" +
    "						<md-content class=\"md-padding\">\n" +
    "								<md-button type=\"button\" aria-label=\"Back\" class=\"md-raised\" ui-sref=\"login\">\n" +
    "										<i class=\"fa fa-chevron-left\" aria-hidden=\"true\"></i>\n" +
    "								</md-button>\n" +
    "								<form name=\"form\" layout=\"column\">\n" +
    "										<div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "												<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "										</div>\n" +
    "										<p class=\"text-center\">If you’ve forgotten your password, you can request a new password via email.</p>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Email</label>\n" +
    "												<input type=\"text\"\n" +
    "															 ng-model=\"data.email\"\n" +
    "															 required\n" +
    "															 ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "										</md-input-container>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"forgotPassword()\" pull-right ng-disabled=\"form.$invalid || loading\">\n" +
    "												<span ng-show=\"!loading\">Reset password</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait..</span>\n" +
    "										</md-button>\n" +
    "								</form>\n" +
    "						</md-content>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/home/home.html",
    "<div ng-show=\"!loading\">\n" +
    "		<!-- <p>Welcome back {{session.first_name}} {{session.last_name}}!</p>\n" +
    "		<p ng-if=\"session.role == 'user'\">\n" +
    "				Currently there are {{totals.activeCoupons}} active {{totals.activeCoupons == 1 ? 'coupon' : 'coupons'}} for your stores.\n" +
    "		</p>\n" +
    "		<p ng-if=\"session.role == 'sc-user'\">\n" +
    "				You have {{totals.newMerchants}} new merchants registered in your shopping center this week. Currently there are {{totals.activeCoupons}} active coupons in your shopping center.\n" +
    "		</p>\n" +
    "		<p ng-if=\"session.role == 'admin'\">\n" +
    "				You have {{totals.newMerchants}} new merchant accounts and {{totals.newShoppingCenters}} new shopping centers registered this week. <br></br> <br>\n" +
    "				Currently there are {{totals.activeCoupons}} active coupons in system.\n" +
    "		</p> -->\n" +
    "		<div ng-if=\"session.role == 'admin' || session.role == 'sc-user'\" layout=\"row\" layout-align=\"center center\">\n" +
    "		  <div flex class=\"dashboard-cards card-users\" >\n" +
    "		    <div layout=\"row\" class=\"dashboard-users \">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-users\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.users}}</p>\n" +
    "			    	<p>Users</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	<a ng-click=\"redirectToUsers()\">View details</a>\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		  <div flex class=\"dashboard-cards card-merchants\">\n" +
    "		     <div layout=\"row\" class=\"dashboard-users\">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-merchants\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.merchants}}</p>\n" +
    "			    	<p>Merchants</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	<a ng-click=\"redirectToMerchants()\">View details</a>\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		  <div flex class=\"dashboard-cards card-coupons\">\n" +
    "		     <div  layout=\"row\" class=\"dashboard-users\">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-coupon\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.coupons}}</p>\n" +
    "			    	<p>Coupons</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	View details\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div ng-if=\"session.role == 'user'\" layout=\"row\" layout-align=\"start start\">\n" +
    "			<div flex=\"33\" layout=\"columm\" layout-align=\"start start\" >\n" +
    "		     <md-list flex>\n" +
    "\n" +
    "			  <md-subheader class=\"md-no-sticky\">Profile information</md-subheader>\n" +
    "			  <md-list-item>\n" +
    "			  	<img ng-src=\"{{merchant.logo}}\" alt=\"\">\n" +
    "			  </md-list-item>\n" +
    "			  <md-list-item>\n" +
    "			    <p>Name: {{ merchant.name }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Description: {{ merchant.description }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Shopping Center: {{ merchant.shopping_center_name }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Zip: {{ merchant.zip }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Address: {{ merchant.address }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Suite no: {{ merchant.suite_number }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>City: {{ merchant.city }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Latitude: {{ merchant.lat }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Longitude: {{ merchant.lon }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			   <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Phone: {{ merchant.phone }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			  <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Website: {{ merchant.website }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			   <md-divider></md-divider>\n" +
    "\n" +
    "			   <md-list-item>\n" +
    "			    <p>Category: {{ merchant.categories[0].name }} </p>\n" +
    "			  </md-list-item>\n" +
    "\n" +
    "			</md-list>\n" +
    "		  </div>\n" +
    "		  <div flex=\"33\" class=\"dashboard-cards card-coupons\">\n" +
    "		     <div  layout=\"row\" class=\"dashboard-users\">\n" +
    "		    	<div flex=\"66\" layout=\"column\" layout-align=\"start start\">\n" +
    "		    		<span class=\"icon-lic-coupon\"></span>\n" +
    "		    	</div>\n" +
    "		    	<div class=\"dashboard-numbers\" flex=\"33\" layout=\"column\" layout-align=\"end end\">\n" +
    "		    		<p class=\"number\">{{stats.coupons}}</p>\n" +
    "			    	<p>Coupons</p>\n" +
    "		    	</div>\n" +
    "		    </div>\n" +
    "		    <div layout=\"row\" class=\"dashboard-users-info\">\n" +
    "		    	View details\n" +
    "		    </div>\n" +
    "		  </div>\n" +
    "		</div>\n" +
    "\n" +
    "		<div flex=\"100\" layout=\"row\">\n" +
    "			<zingchart id=\"myChart\" zc-json=\"myJson\" zc-height=500 zc-width=900></zingchart>\n" +
    "		</div>\n" +
    "		\n" +
    "\n" +
    "		<!-- Chart morris -->\n" +
    "\n" +
    "		<div flex layout=\"row\">\n" +
    "            <!-- <div class=\"chart-container-wrapper\" layout=\"column\" flex=\"66\">  \n" +
    "            	<div class=\"chart-container\">\n" +
    "            		<md-toolbar class=\"md-primary\">\n" +
    "				    <div class=\"md-toolbar-tools\">\n" +
    "				    <p>Toolbar with grouped panels (Maximum open: 2)</p>\n" +
    "				    <span flex></span>\n" +
    "				    <md-select ng-model=\"weapon\" placeholder=\"Weapon\" class=\"md-no-underline\">\n" +
    "				        <md-option value=\"axe\">Axe</md-option>\n" +
    "				        <md-option value=\"sword\">Sword</md-option>\n" +
    "						<md-option value=\"wand\">Wand</md-option>\n" +
    "				        <md-option value=\"pen\">Pen?</md-option>\n" +
    "			        </md-select>\n" +
    "				    </div>\n" +
    "				</md-toolbar>\n" +
    "\n" +
    "			  	<md-content flex layout-padding>\n" +
    "			 		<div id=\"morris-area-chart\"></div>\n" +
    "			  	</md-content>\n" +
    "            	</div>\n" +
    "		  	</div> -->\n" +
    "		  	<span flex=\"33\"></span>\n" +
    "		</div>\n" +
    "              \n" +
    "</div>\n" +
    "            <!-- /.row -->\n" +
    "<div ng-show=\"loading\">Please wait...</div>\n" +
    "\n" +
    "");
  $templateCache.put("/app/sections/layout/layout.html",
    "<div layout=\"row\" flex>\n" +
    "    <md-sidenav class=\"md-sidenav-left md-whiteframe-z1\" md-component-id=\"left\" md-is-locked-open=\"isPixieOpen() && $mdMedia('gt-md')\" ng-cloak>\n" +
    "        <div layout=\"column\" layout-fill flex>\n" +
    "            <md-toolbar class=\"md-hue-3 md-whiteframe-z1\" layout=\"row\" layout-align=\"center center\">\n" +
    "                <!-- <h1 class=\"md-toolbar-tools\">LIC Admin</h1> -->\n" +
    "                <img src=\"assets/images/logo-new.png\" alt=\"\">\n" +
    "                <md-button href class=\"md-icon-button\" ng-click=\"close()\" hide-gt-md aria-label=\"Close\">\n" +
    "                    <i class=\"fa fa-angle-double-left md-title\"></i>\n" +
    "                </md-button>\n" +
    "            </md-toolbar>\n" +
    "            <md-content class=\"lic-sidebar\" flex layout=\"column\" layout-wrap>\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.home\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-dashboard\"></span>Home</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.merchant\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': ((state.name == 'layout.coupons' || state.name == 'layout.merchants-edit.edit') || state.name == 'layout.merchants-edit.kml')}\"><span class=\"icon-lic-merchants\"></span>Merchants</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.merchant\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': (state.name == 'layout.merchants-edit.edit' || state.name == 'layout.merchants-edit.kml')}\"><span class=\"icon-lic-merchants\"></span>Merchants</md-button>\n" +
    "                <!--<md-button type=\"button\"-->\n" +
    "                           <!--ng-if=\"session.role == 'admin'\"-->\n" +
    "                           <!--class=\"md-primary sidenav-btn\"-->\n" +
    "                           <!--ui-sref=\"layout.merchant-request\" ui-sref-active=\"md-raised\">Merchants Requests</md-button>-->\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           ui-sref=\"layout.areas\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': state.name == 'layout.areas-edit'}\"><span class=\"icon-lic-areas\"></span>Areas</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           ui-sref=\"layout.categories\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': state.name == 'layout.categories-edit'}\"><span class=\"icon-lic-categories\"></span>Categories</md-button>\n" +
    "               <!--  <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           ui-sref=\"layout.shopping-centers\" ui-sref-active=\"md-raised\">Shopping Centers</md-button> -->\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'admin' || session.role == 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.users\" ui-sref-active=\"md-raised\" ng-class=\"{'md-raised': (state.name == 'layout.user-edit' || state.name == 'layout.password-change')}\"><span class=\"icon-lic-users\"></span>Users</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-click=\"openMerchantCoupons()\"\n" +
    "                           ui-sref=\"layout.coupons\" \n" +
    "                           ui-sref-active=\"md-raised\"><span class=\"icon-lic-coupon\"></span>Coupons</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ui-sref=\"layout.push-notification\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-notifications\"></span>Push notification</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role != 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-click=\"openSettings()\"\n" +
    "                           ui-sref=\"layout.settings\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-settings\"></span>Settings</md-button>\n" +
    "                <md-button type=\"button\"\n" +
    "                           ng-if=\"session.role == 'sc-user'\"\n" +
    "                           class=\"md-primary sidenav-btn\"\n" +
    "                           ng-click=\"openShoppingCenter($event)\" ui-sref=\"layout.shopping-settings\" ui-sref-active=\"md-raised\"><span class=\"icon-lic-settings\"></span>Settings</md-button>\n" +
    "            </md-content>\n" +
    "            <!-- ui-sref=\"layout.shopping-settings\" ui-sref-active=\"md-raised\" -->\n" +
    "        </div>\n" +
    "    </md-sidenav>\n" +
    "    <div layout=\"column\" flex>\n" +
    "        <md-toolbar id=\"blue-lic-toolbar\" class=\"md-hue-2 site-content-toolbar md-whiteframe-z1\" layout=\"row\" layout-align=\"start center\" ng-cloak>\n" +
    "            <div class=\"md-toolbar-tools docs-toolbar-tools\" flex>\n" +
    "                <md-button href class=\"md-icon-button\" ng-click=\"toggle()\" hide-gt-md aria-label=\"Close\">\n" +
    "                    <i class=\"fa fa-bars\"></i>\n" +
    "                </md-button>\n" +
    "                <div layout=\"row\" flex>\n" +
    "                    <div flex layout=\"column\" layout-align=\"center start\">\n" +
    "                        <a class=\"back-button\" ng-if=\"isBackActive\" ng-click=\"onBack()\">\n" +
    "                          <span class=\"icon-lic-back\"></span>\n" +
    "                          Back\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                    <div flex=\"22\" layout=\"column\" layout-align=\"center end\">\n" +
    "                        <md-menu class=\"site-content-toolbar-button normal-case fill-height\" md-position-mode=\"target-right target\">\n" +
    "                            <md-button aria-label=\"Open phone interactions menu\" ng-click=\"openMenu($mdOpenMenu, $event)\">\n" +
    "                                {{user.first_name}} {{user.last_name}} <i class=\"fa fa-caret-down\" aria-hidden=\"true\"></i>\n" +
    "                            </md-button>\n" +
    "                            <md-menu-content width=\"1\">\n" +
    "                                <md-menu-item>\n" +
    "                                    <md-button ng-click=\"openSettings()\">\n" +
    "                                        <i class=\"fa fa-user\" aria-hidden=\"true\"></i> Profile\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                                <md-menu-item>\n" +
    "                                    <md-button ng-click=\"openChangePassword()\">\n" +
    "                                        <i class=\"fa fa-key\" aria-hidden=\"true\"></i> Change password\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                                <md-menu-item>\n" +
    "                                    <md-button ng-click=\"logout()\">\n" +
    "                                        <i class=\"fa fa-power-off\" aria-hidden=\"true\"></i> Logout\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                            </md-menu-content>\n" +
    "                        </md-menu>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-content layout-padding class=\"md-sidenav-left md-whiteframe-z1\" ui-view layout=\"column\" flex overflow-x=\"hidden\"></md-content>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("/app/sections/login/login.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "    <div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\">\n" +
    "        <md-whiteframe class=\"md-whiteframe-1dp\" >\n" +
    "						<md-content class=\"md-padding\">\n" +
    "								<form name=\"form\" layout=\"column\">\n" +
    "										<div flex layout=\"row\" layout-align=\"center center\" md-primary-color>\n" +
    "												<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\" />\n" +
    "										</div>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Email</label>\n" +
    "												<input type=\"text\"\n" +
    "															 ng-model=\"user.email\"\n" +
    "															 required\n" +
    "															 ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "										</md-input-container>\n" +
    "										<md-input-container flex class=\"password-container\">\n" +
    "												<label>Password</label>\n" +
    "												<input type=\"password\" ng-model=\"user.password\" required>\n" +
    "												<a href=\"#\" aria-label=\"Forgot password\" class=\"pull-right\" ui-sref=\"forgot-password\">Forgot password?</a>\n" +
    "										</md-input-container>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"login()\" pull-right ng-disabled=\"form.$invalid || loading\">\n" +
    "												<span ng-show=\"!loading\">Login</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait..</span>\n" +
    "										</md-button>\n" +
    "								</form>\n" +
    "						</md-content>\n" +
    "        </md-whiteframe>\n" +
    "    </div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/merchant/addEditMerchant/merchantAddEdit-Edit.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span ng-bind=\"merchant.id ? 'Edit Merchant' : 'Add Merchant'\" class=\"padding-bottom table-title\">\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"merchant.id ? 'Edit Merchant' : 'Add Merchant'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Merchant Logo</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"merchant.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{merchant.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input name=\"name\" ng-model=\"merchant.name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Enter merchant name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Description</label>\n" +
    "                        <textarea name=\"description\" minlength=\"3\" required ng-model=\"merchant.description\" rows=\"2\" md-select-on-focus></textarea>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter description</em>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description must be at least 3 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-input-name=\"area\" md-selected-item=\"selectedArea\" md-search-text=\"searchAreaText\" md-selected-item-change=\"selectArea(area)\" required md-items=\"area in loadArea(searchAreaText)\" md-item-text=\"area.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchAreaText}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                            <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select area</em>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-selected-item=\"selectedShoppingCenter\" md-no-cache=\"true\" md-search-text=\"searchTextShoppingCenter\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\" md-items=\"shoppingCenter in loadShoppingCenters(searchTextShoppingCenter)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchTextShoppingCenter\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchTextShoppingCenter}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex ng-if=\"!merchant.shopping_center_id\">\n" +
    "                        <label>Shopping Center Name</label>\n" +
    "                        <input name=\"shopping_center_name\" ng-model=\"merchant.shopping_center_name\" ng-required=\"!merchant.shopping_center_id || !shoppingCenter.lat || !shoppingCenter.lon\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.shopping_center_name.$error.required\">Required if shopping center is not selected</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Zip</label>\n" +
    "                        <input ng-model=\"merchant.zip\" name=\"zip\" ng-change=\"geoLocationByZip(merchant.zip)\" ng-required=\"!merchant.shopping_center_id\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP code</em>\n" +
    "                    </md-input-container>\n" +
    "                    <div layout=\"row\">\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Address</label>\n" +
    "                            <input name=\"address\" ng-model=\"merchant.address\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter address</em>\n" +
    "                        </md-input-container>\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Suite number</label>\n" +
    "                            <input name=\"suite_number\" ng-model=\"merchant.suite_number\" ng-required=\"!merchant.address\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.suite_number.$error.required\">Please enter suite number</em>\n" +
    "                        </md-input-container>\n" +
    "                    </div>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>City</label>\n" +
    "                        <input ng-model=\"merchant.city\" name=\"city\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Latitude</label>\n" +
    "                        <input name=\"lat\" ng-model=\"merchant.lat\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter latitude</em>\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Longitude</label>\n" +
    "                        <input name=\"lon\" ng-model=\"merchant.lon\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lon.$error.required\">Please enter Longitude</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Phone</label>\n" +
    "                        <input ng-model=\"merchant.phone\" type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Website</label>\n" +
    "                        <input ng-model=\"merchant.website\" type=\"text\">\n" +
    "                        <em>* http://www.example.com</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <md-input-container flex md-no-float>\n" +
    "                        <label></label>\n" +
    "                        <tags-input ng-model=\"merchant.categories\" replaces-spaces-with-dashes=\"false\" aria-label=\"Category\" placeholder=\"Add Category\" debounce-delay=\"100\" key-property=\"id\" display-property=\"name\" add-from-autocomplete-only=\"true\" max-results-to-show=\"10\">\n" +
    "                            <auto-complete source=\"loadCategories($query)\" aria-label=\"Category\" load-on-focus=\"true\" load-on-empty=\"true\" min-length=\"0\" debounce-delay=\"100\"></auto-complete>\n" +
    "                        </tags-input>\n" +
    "                        <em ng-if=\"categoryLoading\">Please wait...</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading && !merchant.id\"><span class=\"icon-lic-save btn-icon\"></span> Save</span>\n" +
    "                <span ng-show=\"!loading && merchant.id\"><span class=\"icon-lic-update btn-icon\"></span> Update</span>\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "            <md-button type=\"button\" ng-click=\"nextStep()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Next <span class=\"icon-lic-right-arrow btn-icon\"></span></span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "");
  $templateCache.put("/app/sections/merchant/addEditMerchant/merchantAddEdit-KML.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "	<style type=\"text/css\">\n" +
    "\n" +
    "            #panel {\n" +
    "                width: 200px;\n" +
    "                font-family: Arial, sans-serif;\n" +
    "                font-size: 13px;\n" +
    "                float: right;\n" +
    "                margin: 10px;\n" +
    "            }\n" +
    "\n" +
    "            #color-palette {\n" +
    "                clear: both;\n" +
    "            }\n" +
    "\n" +
    "            .color-button {\n" +
    "                width: 14px;\n" +
    "                height: 14px;\n" +
    "                font-size: 0;\n" +
    "                margin: 2px;\n" +
    "                float: left;\n" +
    "                cursor: pointer;\n" +
    "            }\n" +
    "\n" +
    "            #delete-button {\n" +
    "                margin-top: 5px;\n" +
    "            }\n" +
    "        </style>\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"padding-bottom table-title\">KML Map</span>\n" +
    "    <div id=\"panel\">\n" +
    "        <md-button class=\"md-warn md-raised\" id=\"delete-button\"><span class=\"icon-lic-delete btn\"></span> Delete Selected Shape</md-button>\n" +
    "        <md-button type=\"button\" ng-click=\"save(lat_longs_string)\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "            <span ng-show=\"!loading && !merchant.id\"><span class=\"icon-lic-save btn-icon\"></span> Save</span>\n" +
    "            <span ng-show=\"!loading && merchant.id\"><span class=\"icon-lic-update btn-icon\"></span> Update</span>\n" +
    "            <span ng-show=\"loading\">Please wait...</span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "    <div id=\"map\" style=\"height: 100vh;\">Error</div>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "<script>\n" +
    "	\n" +
    "</script>");
  $templateCache.put("/app/sections/merchant/addEditMerchant/merchantAddEdit.html",
    "<div layout=\"row\" layout-align=\"center\" id=\"status-buttons\" class=\"text-center\">\n" +
    "    <a class=\"nav-stepper\" layout=\"row\" layout-align=\"center center\" ui-sref-active=\"active\" ui-sref=\".edit\">\n" +
    "        <span class=\"icon-lic-f-one btn-icon\"><span class=\"path1\"></span><span class=\"path2\"></span></span><div>\n" +
    "            <!-- {{merchant.id ? ' - Edit Merchant' : ' - Add Merchant'}} -->\n" +
    "        </div>\n" +
    "    </a>\n" +
    "    <a class=\"nav-stepper step_two\" layout=\"row\" layout-align=\"center center\" ui-sref-active=\"active\" ui-sref=\".kml\">\n" +
    "         <span class=\"icon-lic-f-two btn-icon\"><span class=\"path1\"></span><span class=\"path2\"></span></span><div></div>\n" +
    "    </a>\n" +
    "</div>\n" +
    "<div layout=\"row\" id=\"merchant-stepper\" ui-view></div>");
  $templateCache.put("/app/sections/merchant/coupon/addEditCoupon/couponAddEdit.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\" >\n" +
    "    <span class=\"table-title\" ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></span>\n" +
    "    <form name=\"form\">\n" +
    "       <!--  <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <md-input-container flex>\n" +
    "                    <label>Title</label>\n" +
    "                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                </md-input-container>\n" +
    "                <md-input-container flex>\n" +
    "                    <label>Description</label>\n" +
    "                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                </md-input-container>\n" +
    "            </div>\n" +
    "            <div layout=\"row\">\n" +
    "                <md-input-container flex>\n" +
    "                    <label>Start Date</label>\n" +
    "                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                   md-placeholder=\"Start Date\"\n" +
    "                                   md-open-on-focus></md-datepicker>\n" +
    "                </md-input-container>\n" +
    "                <md-input-container flex>\n" +
    "                    <label>End Date</label>\n" +
    "                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                   md-placeholder=\"End Date\"\n" +
    "                                   md-open-on-focus></md-datepicker>\n" +
    "                </md-input-container>\n" +
    "            </div>\n" +
    "            <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <br />\n" +
    "                                <div ng-show=\"uploader.isHTML5\" style=\"padding: 20px;\" nv-file-drop class=\"my-drop-zone\" nv-file-over=\"\" uploader=\"uploader\">\n" +
    "                                    <span class=\"drag-img\"></span>\n" +
    "                                    <span class=\"drag-text\"> Drag & drop files here</span>\n" +
    "                                </div>\n" +
    "                                <input ng-show=\"!uploader.isHTML5\" type=\"file\" nv-file-select=\"\" uploader=\"uploader\" multiple /><br />\n" +
    "                                <em class=\"text-right\">* only PDF and images are allowed</em>\n" +
    "                                <br />\n" +
    "\n" +
    "                                <div layout=\"row\" flex ng-show=\"uploader.queue.length > 0\">\n" +
    "                                    <table md-table class=\"table\">\n" +
    "                                        <thead md-head>\n" +
    "                                            <tr md-row>\n" +
    "                                                <th md-column width=\"50%\">Name</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Size</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Progress</th>\n" +
    "                                                <th md-column>Status</th>\n" +
    "                                                <th md-column>Actions</th>\n" +
    "                                            </tr>\n" +
    "                                        </thead>\n" +
    "                                        <tbody md-body>\n" +
    "                                            <tr md-row ng-repeat=\"item in uploader.queue\">\n" +
    "                                                <td md-cell><strong>{{ item.file.name }}</strong></td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\">\n" +
    "                                                    <div class=\"progress\" style=\"margin-bottom: 0;\">\n" +
    "                                                        <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ 'width': item.progress + '%' }\"></div>\n" +
    "                                                    </div>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell class=\"text-center\">\n" +
    "                                                    <span ng-show=\"item.isSuccess\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isCancel\"><i class=\"fa fa-ban\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isError\"><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i></span>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell nowrap>\n" +
    "                                                    <md-button type=\"button\" aria-label=\"Delete\" class=\"md-raised\" ng-click=\"item.remove()\">\n" +
    "                                                        <i class=\"fa fa-trash\" aria-hidden=\"true\"></i>\n" +
    "                                                    </md-button>\n" +
    "                                                </td>\n" +
    "                                            </tr>\n" +
    "                                        </tbody>\n" +
    "                                    </table>\n" +
    "                                    <div>\n" +
    "                                        <div>\n" +
    "                                            <md-progress-linear md-mode=\"determinate\" value=\"{{uploader.progress}}\"></md-progress-linear>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                                <div ng-if=\"coupon.files.length\">\n" +
    "                                    <span>Files:</span>\n" +
    "                                    <div layout=\"row\">\n" +
    "                                        <md-card md-theme=\"default\" ng-repeat=\"file in coupon.files\" md-theme-watch>\n" +
    "                                            <a href=\"{{file.url}}\" target=\"_blank\">\n" +
    "                                                <img ng-if=\"file.extension != 'pdf' && file.extension != 'txt'\" layout-padding ng-src=\"{{file.url}}\" alt=\"Image\" style=\"height: 200px; width: 200px;\" />\n" +
    "                                                <div ng-if=\"file.extension == 'pdf' || file.extension == 'txt'\" layout-padding style=\"height: 200px; width: 200px;\" class=\"text-center\">\n" +
    "                                                    <i class=\"fa fa-file-text-o fa-5x\" aria-hidden=\"true\"></i>\n" +
    "                                                </div>\n" +
    "                                            </a>\n" +
    "                                            <md-card-actions layout=\"row\" layout-align=\"end center\">\n" +
    "                                                <md-button ng-click=\"removeFile(file)\">\n" +
    "                                                    <span ng-show=\"!file.loading\">Delete</span>\n" +
    "                                                    <span ng-show=\"file.loading\">Please wait...</span>\n" +
    "                                                </md-button>\n" +
    "                                            </md-card-actions>\n" +
    "                                        </md-card>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\"><span class=\"icon-lic-save btn-icon\"></span> Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "\n" +
    "");
  $templateCache.put("/app/sections/merchant/coupon/coupon.html",
    "<div>\n" +
    "    <h4 ng-if=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "    <div layout=\"column\" ng-if=\"!loading\">\n" +
    "        <span class=\"table-title\">Coupons for {{merchant.name}}</span>\n" +
    "        <div layout=\"row\">\n" +
    "						<!-- <md-input-container>\n" +
    "								<md-button class=\"md-raised\" aria-label=\"back\" ng-click=\"goBack()\">\n" +
    "										<i class=\"fa fa-arrow-left\" aria-hidden=\"true\"></i>\n" +
    "								</md-button>\n" +
    "						</md-input-container> -->\n" +
    "						<md-input-container class=\"sort-by-container-fix\">\n" +
    "								<label>Sort by</label>\n" +
    "								<md-select ng-change=\"sortBy()\" ng-model=\"params.sort_by\">\n" +
    "										<md-option value=\"-active\">Active State</md-option>\n" +
    "										<md-option value=\"active\">Inactive State</md-option>\n" +
    "										<md-option value=\"start_date\">Date Start</md-option>\n" +
    "										<md-option value=\"end_date\">Date End</md-option>\n" +
    "								</md-select>\n" +
    "						</md-input-container>\n" +
    "						<md-input-container class=\"padd\">\n" +
    "								<md-button class=\"md-raised md-primary\" ng-click=\"openCouponAdd()\" aria-label=\"Add Coupon\">\n" +
    "										<span class=\"icon-lic-add btn-icon\"></span> Add Coupon\n" +
    "								</md-button>\n" +
    "						</md-input-container>\n" +
    "                        <md-input-container class=\"padd\">\n" +
    "                                <md-button class=\"md-raised md-primary\" ng-click=\"openPixieEditor()\" aria-label=\"Create Coupon\">\n" +
    "                                       <span class=\"icon-lic-magic btn-icon\"></span> Create Coupon\n" +
    "                                </md-button>\n" +
    "                        </md-input-container>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"md-padding\" layout=\"row\" layout-wrap ng-if=\"!loading\">\n" +
    "        <md-card class=\"coupon-card-shadow\" md-theme=\"default\" md-theme-watch ng-repeat=\"coupon in coupons\">\n" +
    "            <md-card-title>\n" +
    "                <md-card-title-text>\n" +
    "                    <span class=\"md-headline\">Title: {{coupon.title}}</span>\n" +
    "										<span class=\"md-subhead\">\n" +
    "												Date: {{coupon.start_date}} - {{coupon.end_date}}\n" +
    "												<p class=\"fix-margin\">Status: {{coupon.active ? 'Active': 'Inactive'}}</p>\n" +
    "										</span>\n" +
    "                    <div layout=\"row\" style=\"width:300px\">{{coupon.description}}</div>\n" +
    "                </md-card-title-text>\n" +
    "                <md-card-title-media>\n" +
    "                    <div class=\"md-media-md card-media\">\n" +
    "                        <!-- <i ng-if=\"!coupon.image.url\" class=\"fa fa-picture-o\" aria-hidden=\"true\"></i> -->\n" +
    "                        <span ng-if=\"!coupon.image.url\" class=\"icon-lic-image\" aria-hidden=\"true\"></span>\n" +
    "                        <img ng-if=\"coupon.image.url\" ng-src=\"{{coupon.image.url}}\" />\n" +
    "                    </div>\n" +
    "                </md-card-title-media>\n" +
    "            </md-card-title>\n" +
    "            <md-card-actions layout=\"row\" layout-align=\"end center\">\n" +
    "                <md-button class=\"edit-color\"\n" +
    "                           ng-click=\"openCouponEdit(coupon)\"\n" +
    "                           ng-disabled=\"coupon.toggleLoading\">\n" +
    "                    <span class=\"icon-lic-edit btn-icon\"></span> Edit\n" +
    "                </md-button>\n" +
    "                <md-button ng-class=\"{'active-color': !coupon.active}\" ng-disabled=\"coupon.toggleLoading\" ng-click=\"toggleActive(coupon)\">\n" +
    "                    <span ng-show=\"coupon.toggleLoading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                    <span class=\"inactive-color\" ng-show=\"coupon.active && !coupon.toggleLoading\">\n" +
    "                        <span class=\"icon-lic-inactive btn-icon\"></span> Deactivate\n" +
    "                    </span>\n" +
    "                    <span ng-show=\"!coupon.active && !coupon.toggleLoading\">\n" +
    "                        <span class=\"icon-lic-active btn-icon\"></span> Activate\n" +
    "                    </span>\n" +
    "                </md-button>\n" +
    "                <md-button class=\"delete-color\"\n" +
    "                           ng-click=\"removeModal($event, coupon)\"\n" +
    "                           ng-disabled=\"coupon.toggleLoading || coupon.deleteLoading\">\n" +
    "                    <span ng-show=\"coupon.deleteLoading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                    <span ng-show=\"!coupon.deleteLoading\">\n" +
    "                        <span class=\"icon-lic-delete btn-icon\"></span> Delete\n" +
    "                    </span>\n" +
    "                </md-button>\n" +
    "            </md-card-actions>\n" +
    "        </md-card>\n" +
    "    </div>\n" +
    "    <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there no coupones in your database for {{merchant.name}}.</h4>\n" +
    "    <md-table-pagination ng-if=\"total > 0\"\n" +
    "                         md-options=\"[10, 20, 30]\"\n" +
    "                         md-limit=\"params.limit\"\n" +
    "                         md-page=\"params.page\"\n" +
    "                         md-total=\"{{total}}\"\n" +
    "                         md-on-paginate=\"onPaginate\"\n" +
    "                         md-page-select></md-table-pagination>\n" +
    "</div>\n" +
    "");
  $templateCache.put("/app/sections/merchant/coupon/modals/couponModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Title</label>\n" +
    "                                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Start Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                                   md-placeholder=\"Start Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>End Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                                   md-placeholder=\"End Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                    <md-tab label=\"Files\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <br />\n" +
    "                                <div ng-show=\"uploader.isHTML5\" style=\"padding: 20px;\" nv-file-drop class=\"my-drop-zone\" nv-file-over=\"\" uploader=\"uploader\">\n" +
    "                                    <span class=\"drag-img\"></span>\n" +
    "                                    <span class=\"drag-text\"> Drag & drop files here</span>\n" +
    "                                </div>\n" +
    "                                <input ng-show=\"!uploader.isHTML5\" type=\"file\" nv-file-select=\"\" uploader=\"uploader\" multiple /><br />\n" +
    "                                <em class=\"text-right\">* only PDF and images are allowed</em>\n" +
    "                                <br />\n" +
    "\n" +
    "                                <div layout=\"row\" flex ng-show=\"uploader.queue.length > 0\">\n" +
    "                                    <table md-table class=\"table\">\n" +
    "                                        <thead md-head>\n" +
    "                                            <tr md-row>\n" +
    "                                                <th md-column width=\"50%\">Name</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Size</th>\n" +
    "                                                <th md-column ng-show=\"uploader.isHTML5\">Progress</th>\n" +
    "                                                <th md-column>Status</th>\n" +
    "                                                <th md-column>Actions</th>\n" +
    "                                            </tr>\n" +
    "                                        </thead>\n" +
    "                                        <tbody md-body>\n" +
    "                                            <tr md-row ng-repeat=\"item in uploader.queue\">\n" +
    "                                                <td md-cell><strong>{{ item.file.name }}</strong></td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n" +
    "                                                <td md-cell ng-show=\"uploader.isHTML5\">\n" +
    "                                                    <div class=\"progress\" style=\"margin-bottom: 0;\">\n" +
    "                                                        <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ 'width': item.progress + '%' }\"></div>\n" +
    "                                                    </div>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell class=\"text-center\">\n" +
    "                                                    <span ng-show=\"item.isSuccess\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isCancel\"><i class=\"fa fa-ban\" aria-hidden=\"true\"></i></span>\n" +
    "                                                    <span ng-show=\"item.isError\"><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i></span>\n" +
    "                                                </td>\n" +
    "                                                <td md-cell nowrap>\n" +
    "                                                    <md-button type=\"button\" aria-label=\"Delete\" class=\"md-raised\" ng-click=\"item.remove()\">\n" +
    "                                                        <i class=\"fa fa-trash\" aria-hidden=\"true\"></i>\n" +
    "                                                    </md-button>\n" +
    "                                                </td>\n" +
    "                                            </tr>\n" +
    "                                        </tbody>\n" +
    "                                    </table>\n" +
    "                                    <div>\n" +
    "                                        <div>\n" +
    "                                            <md-progress-linear md-mode=\"determinate\" value=\"{{uploader.progress}}\"></md-progress-linear>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                                <div ng-if=\"coupon.files.length\">\n" +
    "                                    <span>Files:</span>\n" +
    "                                    <div layout=\"row\">\n" +
    "                                        <md-card md-theme=\"default\" ng-repeat=\"file in coupon.files\" md-theme-watch>\n" +
    "                                            <a href=\"{{file.url}}\" target=\"_blank\">\n" +
    "                                                <img ng-if=\"file.extension != 'pdf' && file.extension != 'txt'\" layout-padding ng-src=\"{{file.url}}\" alt=\"Image\" style=\"height: 200px; width: 200px;\" />\n" +
    "                                                <div ng-if=\"file.extension == 'pdf' || file.extension == 'txt'\" layout-padding style=\"height: 200px; width: 200px;\" class=\"text-center\">\n" +
    "                                                    <i class=\"fa fa-file-text-o fa-5x\" aria-hidden=\"true\"></i>\n" +
    "                                                </div>\n" +
    "                                            </a>\n" +
    "                                            <md-card-actions layout=\"row\" layout-align=\"end center\">\n" +
    "                                                <md-button ng-click=\"removeFile(file)\">\n" +
    "                                                    <span ng-show=\"!file.loading\">Delete</span>\n" +
    "                                                    <span ng-show=\"file.loading\">Please wait...</span>\n" +
    "                                                </md-button>\n" +
    "                                            </md-card-actions>\n" +
    "                                        </md-card>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("/app/sections/merchant/coupon/pixieModals/detailsModal.html",
    "<md-dialog id=\"details-modal\" aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Title</label>\n" +
    "                                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Start Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                                   md-placeholder=\"Start Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>End Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                                   md-placeholder=\"End Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchant/coupon/pixieModals/modals/detailsModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"coupon.id ? 'Edit Coupon' : 'Add Coupon'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Title</label>\n" +
    "                                    <input ng-model=\"coupon.title\" required type=\"text\">\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea maxlength=\"200\" ng-model=\"coupon.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                                    <em pull-right>{{coupon.description.length ? coupon.description.length : 0}}/200</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Start Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.start_date\"\n" +
    "                                                   md-placeholder=\"Start Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>End Date</label>\n" +
    "                                    <md-datepicker ng-model=\"coupon.end_date\"\n" +
    "                                                   md-placeholder=\"End Date\"\n" +
    "                                                   md-open-on-focus></md-datepicker>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchant/coupon/pixieModals/pixieModal.html",
    "<md-input-container>\n" +
    "    <md-button class=\"md-raised\" aria-label=\"back\" ng-click=\"goBack()\">\n" +
    "        <i class=\"fa fa-arrow-left\" aria-hidden=\"true\"></i>\n" +
    "    </md-button>\n" +
    "</md-input-container>\n" +
    "<!-- <md-dialog style=\"width: 100%; height: 100%; margin: auto\" aria-label=\"Modal\" flex> -->\n" +
    "<pixie-editor id=\"pixie-id\">\n" +
    "    <div class=\"global-spinner\">\n" +
    "        <style>\n" +
    "        .global-spinner {\n" +
    "            display: none;\n" +
    "            align-items: center;\n" +
    "            justify-content: center;\n" +
    "            z-index: 999;\n" +
    "            background: #fff;\n" +
    "            position: fixed;\n" +
    "            top: 0;\n" +
    "            left: 0;\n" +
    "            width: 100%;\n" +
    "            height: 100%;\n" +
    "        }\n" +
    "        </style>\n" +
    "        <style>\n" +
    "        .la-ball-spin-clockwise,\n" +
    "        .la-ball-spin-clockwise>div {\n" +
    "            position: relative;\n" +
    "            -webkit-box-sizing: border-box;\n" +
    "            -moz-box-sizing: border-box;\n" +
    "            box-sizing: border-box\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise {\n" +
    "            display: block;\n" +
    "            font-size: 0;\n" +
    "            color: #1976d2\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-dark {\n" +
    "            color: #333\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div {\n" +
    "            display: inline-block;\n" +
    "            float: none;\n" +
    "            background-color: currentColor;\n" +
    "            border: 0 solid currentColor\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise {\n" +
    "            width: 32px;\n" +
    "            height: 32px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div {\n" +
    "            position: absolute;\n" +
    "            top: 50%;\n" +
    "            left: 50%;\n" +
    "            width: 8px;\n" +
    "            height: 8px;\n" +
    "            margin-top: -4px;\n" +
    "            margin-left: -4px;\n" +
    "            border-radius: 100%;\n" +
    "            -webkit-animation: ball-spin-clockwise 1s infinite ease-in-out;\n" +
    "            -moz-animation: ball-spin-clockwise 1s infinite ease-in-out;\n" +
    "            -o-animation: ball-spin-clockwise 1s infinite ease-in-out;\n" +
    "            animation: ball-spin-clockwise 1s infinite ease-in-out\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(1) {\n" +
    "            top: 5%;\n" +
    "            left: 50%;\n" +
    "            -webkit-animation-delay: -.875s;\n" +
    "            -moz-animation-delay: -.875s;\n" +
    "            -o-animation-delay: -.875s;\n" +
    "            animation-delay: -.875s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(2) {\n" +
    "            top: 18.1801948466%;\n" +
    "            left: 81.8198051534%;\n" +
    "            -webkit-animation-delay: -.75s;\n" +
    "            -moz-animation-delay: -.75s;\n" +
    "            -o-animation-delay: -.75s;\n" +
    "            animation-delay: -.75s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(3) {\n" +
    "            top: 50%;\n" +
    "            left: 95%;\n" +
    "            -webkit-animation-delay: -.625s;\n" +
    "            -moz-animation-delay: -.625s;\n" +
    "            -o-animation-delay: -.625s;\n" +
    "            animation-delay: -.625s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(4) {\n" +
    "            top: 81.8198051534%;\n" +
    "            left: 81.8198051534%;\n" +
    "            -webkit-animation-delay: -.5s;\n" +
    "            -moz-animation-delay: -.5s;\n" +
    "            -o-animation-delay: -.5s;\n" +
    "            animation-delay: -.5s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(5) {\n" +
    "            top: 94.9999999966%;\n" +
    "            left: 50.0000000005%;\n" +
    "            -webkit-animation-delay: -.375s;\n" +
    "            -moz-animation-delay: -.375s;\n" +
    "            -o-animation-delay: -.375s;\n" +
    "            animation-delay: -.375s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(6) {\n" +
    "            top: 81.8198046966%;\n" +
    "            left: 18.1801949248%;\n" +
    "            -webkit-animation-delay: -.25s;\n" +
    "            -moz-animation-delay: -.25s;\n" +
    "            -o-animation-delay: -.25s;\n" +
    "            animation-delay: -.25s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(7) {\n" +
    "            top: 49.9999750815%;\n" +
    "            left: 5.0000051215%;\n" +
    "            -webkit-animation-delay: -.125s;\n" +
    "            -moz-animation-delay: -.125s;\n" +
    "            -o-animation-delay: -.125s;\n" +
    "            animation-delay: -.125s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise>div:nth-child(8) {\n" +
    "            top: 18.179464974%;\n" +
    "            left: 18.1803700518%;\n" +
    "            -webkit-animation-delay: 0s;\n" +
    "            -moz-animation-delay: 0s;\n" +
    "            -o-animation-delay: 0s;\n" +
    "            animation-delay: 0s\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-sm {\n" +
    "            width: 16px;\n" +
    "            height: 16px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-sm>div {\n" +
    "            width: 4px;\n" +
    "            height: 4px;\n" +
    "            margin-top: -2px;\n" +
    "            margin-left: -2px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-2x {\n" +
    "            width: 64px;\n" +
    "            height: 64px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-2x>div {\n" +
    "            width: 16px;\n" +
    "            height: 16px;\n" +
    "            margin-top: -8px;\n" +
    "            margin-left: -8px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-3x {\n" +
    "            width: 96px;\n" +
    "            height: 96px\n" +
    "        }\n" +
    "\n" +
    "        .la-ball-spin-clockwise.la-3x>div {\n" +
    "            width: 24px;\n" +
    "            height: 24px;\n" +
    "            margin-top: -12px;\n" +
    "            margin-left: -12px\n" +
    "        }\n" +
    "\n" +
    "        @-webkit-keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -webkit-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -webkit-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        @-moz-keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -moz-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -moz-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        @-o-keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -o-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -o-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        @keyframes ball-spin-clockwise {\n" +
    "            0%,\n" +
    "            100% {\n" +
    "                opacity: 1;\n" +
    "                -webkit-transform: scale(1);\n" +
    "                -moz-transform: scale(1);\n" +
    "                -o-transform: scale(1);\n" +
    "                transform: scale(1)\n" +
    "            }\n" +
    "            20% {\n" +
    "                opacity: 1\n" +
    "            }\n" +
    "            80% {\n" +
    "                opacity: 0;\n" +
    "                -webkit-transform: scale(0);\n" +
    "                -moz-transform: scale(0);\n" +
    "                -o-transform: scale(0);\n" +
    "                transform: scale(0)\n" +
    "            }\n" +
    "        }\n" +
    "        </style>\n" +
    "        <div class=\"la-ball-spin-clockwise la-2x\">\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "            <div></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <script>\n" +
    "    setTimeout(function() {\n" +
    "        var spinner = document.querySelector('.global-spinner');\n" +
    "        if (spinner) spinner.style.display = 'flex';\n" +
    "    }, 50);\n" +
    "    </script>\n" +
    "</pixie-editor>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/merchant/merchant.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i> -->\n" +
    "             Merchants in DB</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container class=\"filter-by-container-fix\">\n" +
    "                <label>Categories</label>\n" +
    "                <md-select ng-change=\"selectFilter()\" ng-model=\"filters\" multiple>\n" +
    "                    <md-option ng-repeat=\"category in categories\" value=\"{{category.id}}\">{{category.name}}</md-option>\n" +
    "                </md-select>\n" +
    "                <em ng-if=\"categoryLoading\">Please wait...</em>\n" +
    "            </md-input-container>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\" ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "           <!--  <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openMerchantAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New Merchant\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "        <table md-table>\n" +
    "            <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortMerchants\">\n" +
    "                <tr md-row>\n" +
    "                    <th md-column md-order-by=\"id\">\n" +
    "                        <span>No.</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Number</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column md-order-by=\"name\">\n" +
    "                        <span>Name</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Name</md-tooltip>\n" +
    "                         </i>\n" +
    "                    </th>\n" +
    "                    <th md-column>Stores</th>\n" +
    "                    <th md-column>Coupons</th>\n" +
    "                    <th md-column md-order-by=\"shopping_center_name\">\n" +
    "                        <span>Shopping Center</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Shopping center name</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column>Category</th>\n" +
    "                    <th md-column></th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody md-body>\n" +
    "                <tr md-row ng-repeat=\"merchant in merchants track by $index\">\n" +
    "                    <td md-cell ng-bind=\"merchant.id\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.name\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.stores\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.coupons\"></td>\n" +
    "                    <td md-cell ng-bind=\"merchant.shopping_center_name ? merchant.shopping_center_name : '-'\"></td>\n" +
    "                    <td md-cell><span ng-repeat=\"categories in merchant.categories\">{{categories.name}} </span></td>\n" +
    "                    <td md-cell text-right>\n" +
    "                        <md-button aria-label=\"Coupons\" class=\"md-primary md-icon-button td-btn-coupon\" ui-sref=\"layout.coupons({merchantId: merchant.id})\">\n" +
    "                            <span class=\"icon-lic-coupon\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Coupons</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button aria-label=\"Edit\" class=\"md-accent md-hue-1 md-icon-button td-btn-edit\" ng-click=\"openMerchantEdit(merchant)\">\n" +
    "                            <span class=\"icon-lic-edit\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button aria-label=\"Remove\" class=\"md-icon-button md-warn td-btn-delete\" ng-click=\"removeModal($event, merchant)\">\n" +
    "                            <span class=\"icon-lic-delete\" aria-hidden=\"true\"></span>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                       <!--  <md-button aria-label=\"Notification\" class=\"md-raised md-accent md-hue-1\" ng-click=\"sendNotification($event, merchant)\">\n" +
    "                            <i class=\"fa fa-bell-o\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Notification</md-tooltip>\n" +
    "                        </md-button> -->\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "    </md-table-container>\n" +
    "    <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no merchants in your database.</h4>\n" +
    "    <h4 ng-show=\"params.search && total == 0\" class=\"text-center\">Currently there are no results that match search criterium.</h4>\n" +
    "    <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "    <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\" md-page=\"params.page\"\n" +
    "        md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "</div>");
  $templateCache.put("/app/sections/merchant/modals/merchantModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2 ng-bind=\"merchant.id ? 'Edit Merchant' : 'Add Merchant'\"></h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Name</label>\n" +
    "                        <input name=\"name\" ng-model=\"merchant.name\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.name.$error.required\">Enter merchant name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Description</label>\n" +
    "                        <textarea name=\"description\" minlength=\"3\" required ng-model=\"merchant.description\" rows=\"5\" md-select-on-focus></textarea>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter description</em>\n" +
    "                        <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description must be at least 3 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-input-name=\"area\" md-selected-item=\"selectedArea\" md-search-text=\"searchAreaText\" md-selected-item-change=\"selectArea(area)\" required md-items=\"area in loadArea(searchAreaText)\" md-item-text=\"area.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchAreaText}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                            <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select area</em>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex>\n" +
    "                        <md-autocomplete md-selected-item=\"selectedShoppingCenter\" md-no-cache=\"true\" md-search-text=\"searchTextShoppingCenter\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\" md-items=\"shoppingCenter in loadShoppingCenters(searchTextShoppingCenter)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"searchTextShoppingCenter\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No states matching \"{{searchTextShoppingCenter}}\" were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex ng-if=\"!merchant.shopping_center_id\">\n" +
    "                        <label>Shopping Center Name</label>\n" +
    "                        <input name=\"shopping_center_name\" ng-model=\"merchant.shopping_center_name\" ng-required=\"!merchant.shopping_center_id || !shoppingCenter.lat || !shoppingCenter.lon\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.shopping_center_name.$error.required\">Required if shopping center is not selected</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Zip</label>\n" +
    "                        <input ng-model=\"merchant.zip\" name=\"zip\" ng-change=\"geoLocationByZip(merchant.zip)\" ng-required=\"!merchant.shopping_center_id\" type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP code</em>\n" +
    "                    </md-input-container>\n" +
    "                    <div layout=\"row\">\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Address</label>\n" +
    "                            <input name=\"address\" ng-model=\"merchant.address\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter address</em>\n" +
    "                        </md-input-container>\n" +
    "                        <md-input-container flex>\n" +
    "                            <label>Suite number</label>\n" +
    "                            <input name=\"suite_number\" ng-model=\"merchant.suite_number\" ng-required=\"!merchant.address\" ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                            <em class=\"error-message\" ng-show=\"form.suite_number.$error.required\">Please enter suite number</em>\n" +
    "                        </md-input-container>\n" +
    "                    </div>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>City</label>\n" +
    "                        <input ng-model=\"merchant.city\" name=\"city\" ng-required=\"!merchant.shopping_center_id\" ng-disabled=\"loadingByZip\" required type=\"text\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city name</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Latitude</label>\n" +
    "                        <input name=\"lat\" ng-model=\"merchant.lat\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter latitude</em>\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Longitude</label>\n" +
    "                        <input name=\"lon\" ng-model=\"merchant.lon\" required ng-disabled=\"loadingByZip\" type=\"number\" step=\"any\">\n" +
    "                        <em class=\"error-message\" ng-show=\"form.lon.$error.required\">Please enter Longitude</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Phone</label>\n" +
    "                        <input ng-model=\"merchant.phone\" type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Website</label>\n" +
    "                        <input ng-model=\"merchant.website\" type=\"text\">\n" +
    "                        <em>* http://www.example.com</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <md-input-container flex md-no-float>\n" +
    "                        <label></label>\n" +
    "                        <tags-input ng-model=\"merchant.categories\" replaces-spaces-with-dashes=\"false\" aria-label=\"Category\" placeholder=\"Add Category\" debounce-delay=\"100\" key-property=\"id\" display-property=\"name\" add-from-autocomplete-only=\"true\" max-results-to-show=\"10\">\n" +
    "                            <auto-complete source=\"loadCategories($query)\" aria-label=\"Category\" load-on-focus=\"true\" load-on-empty=\"true\" min-length=\"0\" debounce-delay=\"100\"></auto-complete>\n" +
    "                        </tags-input>\n" +
    "                        <em ng-if=\"categoryLoading\">Please wait...</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"column\">\n" +
    "                    <h4>Merchant Logo</h4>\n" +
    "                    <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                    <div class=\"merchant-logo-container\" ng-if=\"merchant.logo && !imagePreparedForUpload\">\n" +
    "                        <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                        <img width=\"140\" height=\"140\" ng-src=\"{{merchant.logo}}\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"!loading\">Save</span>\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchant/modals/notificationModal/merchantNotificationModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"md-toolbar-tools\">\n" +
    "            <span class=\"padding-bottom-0\"><i class=\"fa fa-bell\" aria-hidden=\"true\"></i> {{merchant.name}}</span>\n" +
    "            <span flex></span>\n" +
    "            <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <form novalidate flex layout=\"column\" ng-submit=\"send()\">\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Title</label>\n" +
    "                        <input ng-model=\"notification.title\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Description</label>\n" +
    "                        <textarea maxlength=\"200\" ng-model=\"notification.description\" required rows=\"3\" md-select-on-focus></textarea>\n" +
    "                        <em pull-right>{{notification.description.length ? notification.description.length : 0}}/200</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <md-dialog-actions layout=\"row\">\n" +
    "                    <md-button type=\"submit\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                        <span ng-show=\"!loading\">Send</span>\n" +
    "                        <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                    </md-button>\n" +
    "                </md-dialog-actions>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/merchantRequest/merchantRequest.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"padding-bottom-0\"><i class=\"fa fa-database\" aria-hidden=\"true\"></i> Requests for Merchants to approve</span>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head>\n" +
    "                    <tr md-row>\n" +
    "                        <th md-column>Name</th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"merchant in merchants track by $index\">\n" +
    "                        <td md-cell ng-bind=\"merchant.name\"></td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-button class=\"md-raised\" ng-click=\"previewMerchantModal($event, merchant)\">Preview</md-button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no merchants waiting for approval.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0\"\n" +
    "                             md-options=\"[10, 20, 30]\"\n" +
    "                             md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\"\n" +
    "                             md-on-paginate=\"onPaginate\"\n" +
    "                             md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/merchantRequest/modals/merchantRequestModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Merchant request review</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <table class=\"table\">\n" +
    "                    <tr>\n" +
    "                        <td>Name</td>\n" +
    "                        <td ng-bind=\"merchant.name\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Area</td>\n" +
    "                        <td ng-bind=\"merchant.areaName ? merchant.areaName : '-'\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Address</td>\n" +
    "                        <td ng-bind=\"merchant.address\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>City</td>\n" +
    "                        <td ng-bind=\"merchant.city\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Zip</td>\n" +
    "                        <td ng-bind=\"merchant.zip\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Phone</td>\n" +
    "                        <td ng-bind=\"merchant.phone\"></td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Website</td>\n" +
    "                        <td ng-bind=\"merchant.website\"></td>\n" +
    "                    </tr>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"approve()\" class=\"md-raised md-primary\" ng-disabled=\"loadingApprove || loadingReject\">\n" +
    "                <span ng-show=\"!loadingApprove\">Approve</span>\n" +
    "                <span ng-show=\"loadingApprove\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"reject()\" class=\"md-raised md-warn\" ng-disabled=\"loadingReject || loadingApprove\">\n" +
    "                <span ng-show=\"!loadingReject\">Reject</span>\n" +
    "                <span ng-show=\"loadingReject\">Please wait...</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("/app/sections/pushNotifications/pushNotification.html",
    "<div layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "    <!-- <i class=\"fa fa-bell\" aria-hidden=\"true\"></i> -->\n" +
    "    Push notifications</span>\n" +
    "    <form name=\"form\" novalidate flex layout=\"column\" ng-submit=\"send()\">\n" +
    "        <div layout=\"column\">\n" +
    "            <div layout=\"row\" ng-if=\"session.role == 'admin' || session.role == 'sc-user'\">\n" +
    "                        <md-input-container>\n" +
    "                            <label>User type</label>\n" +
    "                            <md-select ng-model=\"user.type\" ng-change=\"roleChanged()\">\n" +
    "                                <md-option ng-if=\"userRole.id\" ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                                    {{userRole.name}}\n" +
    "                                </md-option>\n" +
    "                            </md-select>\n" +
    "                        </md-input-container>\n" +
    "                    <div flex ng-if=\"user.type == 1 && !user.id\">\n" +
    "                        <md-autocomplete required md-input-name=\"merchant\" md-selected-item=\"selectedMerchant\" md-search-text=\"data.searchMerchantText\" md-selected-item-change=\"selectMerchant(merchant)\"\n" +
    "                                         md-items=\"merchant in loadMerchants(data.searchMerchantText)\" md-item-text=\"merchant.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Merchant\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchMerchantText\">{{merchant.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchMerchantText}}\" merchants were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex ng-if=\"user.type == 2 && !user.id\">\n" +
    "                        <md-autocomplete required md-input-name=\"shippingCenter\" md-selected-item=\"selectedShoppingCenter\" md-search-text=\"data.searchShoppingCenterText\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "                                         md-items=\"shoppingCenter in loadShoppingCenters(data.searchShoppingCenterText)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchShoppingCenterText\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchShoppingCenterText}}\" shopping centers were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "            </div>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Title</label>\n" +
    "                <input ng-model=\"notification.title\" required type=\"text\">\n" +
    "            </md-input-container>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Description</label>\n" +
    "                <textarea maxlength=\"200\" ng-model=\"notification.description\" required rows=\"2\" md-select-on-focus></textarea>\n" +
    "                <em pull-right>{{notification.description.length ? notification.description.length : 0}}/200</em>\n" +
    "            </md-input-container>\n" +
    "            <section layout=\"row\">\n" +
    "                <md-button type=\"submit\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                    <span ng-show=\"!loading\"><span class=\"icon-lic-send-notification btn-icon\"></span>Send</span>\n" +
    "                    <span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "                </md-button>\n" +
    "            </section>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>");
  $templateCache.put("/app/sections/register/register.html",
    "<md-content flex layout=\"row\" layout-align=\"center center\">\n" +
    "		<div flex-sm=\"80\" flex-gt-sm=\"60\" layout=\"column\" class=\"register-container\">\n" +
    "				<md-whiteframe class=\"md-whiteframe-1dp\">\n" +
    "						<md-content class=\"md-padding\">\n" +
    "								<div flex layout=\"column\" layout-align=\"center center\" md-accent-color>\n" +
    "										<img class=\"outterpage-logo\" src=\"assets/images/logo-new.png\"/>\n" +
    "										<div layout=\"row\">\n" +
    "												<md-input-container class=\"no-mrg\">\n" +
    "														<md-button class=\"md-fab md-primary\" ng-class=\"{'active-step': step == 1}\" aria-label=\"Use Android\">\n" +
    "																1\n" +
    "														</md-button>\n" +
    "												</md-input-container>\n" +
    "												<md-input-container layout=\"row\" class=\"no-mrg\" layout-align=\"center center\">\n" +
    "														-\n" +
    "												</md-input-container>\n" +
    "												<md-input-container class=\"no-mrg\">\n" +
    "														<md-button class=\"md-fab md-primary\" ng-click=\"selectStep(2)\" ng-class=\"{'active-step': step == 2}\" ng-disabled=\"step < 2\" aria-label=\"Use Android\">\n" +
    "																2\n" +
    "														</md-button>\n" +
    "												</md-input-container>\n" +
    "												<md-input-container layout=\"row\" class=\"no-mrg\" layout-align=\"center center\">\n" +
    "														-\n" +
    "												</md-input-container>\n" +
    "												<md-input-container class=\"no-mrg\">\n" +
    "														<md-button class=\"md-fab md-primary\" ng-click=\"selectStep(3)\" ng-class=\"{'active-step': step == 3}\" ng-disabled=\"step < 3\" aria-label=\"Use Android\">\n" +
    "																3\n" +
    "														</md-button>\n" +
    "												</md-input-container>\n" +
    "										</div>\n" +
    "								</div>\n" +
    "								<div ng-form=\"formStepOne\" ng-if=\"step == 1\" layout=\"column\">\n" +
    "										<div layout=\"row\">\n" +
    "												<md-input-container flex>\n" +
    "														<label>User Type</label>\n" +
    "														<md-select ng-model=\"data.selectedUserType\" required ng-change=\"changeUserType()\" placeholder=\"Select user type\">\n" +
    "																<md-option ng-value=\"type\" ng-repeat=\"type in userTypes\">{{ type.name }}</md-option>\n" +
    "														</md-select>\n" +
    "												</md-input-container>\n" +
    "										</div>\n" +
    "										<div layout=\"row\" flex>\n" +
    "												<md-input-container flex>\n" +
    "														<label>First name</label>\n" +
    "														<input type=\"text\" ng-model=\"user.first_name\" required>\n" +
    "												</md-input-container>\n" +
    "												<md-input-container flex>\n" +
    "														<label>Last name</label>\n" +
    "														<input type=\"text\" ng-model=\"user.last_name\" required>\n" +
    "												</md-input-container>\n" +
    "										</div>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Email</label>\n" +
    "												<input type=\"text\"\n" +
    "															 ng-model=\"user.email\"\n" +
    "															 required\n" +
    "															 ng-blur=\"checkEmail(user.email)\"\n" +
    "															 ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "										</md-input-container>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Password</label>\n" +
    "												<input type=\"password\" ng-minlength=\"6\" ng-model=\"user.password\" required>\n" +
    "												<em>* minimum 6 characters long</em>\n" +
    "										</md-input-container>\n" +
    "										<md-input-container flex>\n" +
    "												<label>Repeat Password</label>\n" +
    "												<input type=\"password\" ng-minlength=\"6\" ng-model=\"user.password_confirmation\" required>\n" +
    "										</md-input-container>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"submit\" pull-right ng-click=\"registerUser()\" ng-disabled=\"formStepOne.$invalid || user.password != user.password_confirmation || loading\">\n" +
    "												<span ng-show=\"!loading\">Next</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "										</md-button>\n" +
    "								</div>\n" +
    "								<div ng-form=\"formStepTwo\" ng-if=\"step == 2\" layout=\"column\" flex>\n" +
    "										<div layout=\"column\" ng-if=\"data.selectedUserType.id == 1\">\n" +
    "												<md-input-container flex>\n" +
    "														<label>Merchant's Name</label>\n" +
    "														<input type=\"text\" ng-model=\"userType.name\" required>\n" +
    "												</md-input-container>\n" +
    "												<div layout=\"row\">\n" +
    "														<div flex>\n" +
    "																<md-autocomplete md-selected-item=\"data.selectedArea\"\n" +
    "																								 md-search-text=\"data.searchAreaText\"\n" +
    "																								 md-selected-item-change=\"selectArea(area)\"\n" +
    "																								 md-items=\"area in loadArea(data.searchAreaText)\"\n" +
    "																								 md-item-text=\"area.name\"\n" +
    "																								 required\n" +
    "																								 md-delay=\"300\"\n" +
    "																								 md-min-length=\"0\"\n" +
    "																								 md-require-match\n" +
    "																								 md-floating-label=\"Area\">\n" +
    "																		<md-item-template>\n" +
    "																				<span md-highlight-text=\"data.searchAreaText\">{{area.name}}</span>\n" +
    "																		</md-item-template>\n" +
    "																		<md-not-found>\n" +
    "																				No matching \"{{data.searchAreaText}}\" areas were found.\n" +
    "																		</md-not-found>\n" +
    "																</md-autocomplete>\n" +
    "														</div>\n" +
    "														<div flex layout=\"row\">\n" +
    "																<md-autocomplete flex md-selected-item=\"data.selectedShoppingCenter\"\n" +
    "																								 md-no-cache=\"true\"\n" +
    "																								 md-search-text=\"data.searchTextShoppingCenter\"\n" +
    "																								 md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "																								 md-items=\"shoppingCenter in loadShoppingCenters(data.searchTextShoppingCenter)\"\n" +
    "																								 md-item-text=\"shoppingCenter.name\"\n" +
    "																								 md-require-match\n" +
    "																								 md-delay=\"300\"\n" +
    "																								 md-min-length=\"0\"\n" +
    "																								 md-floating-label=\"Shopping Center\">\n" +
    "																		<md-item-template>\n" +
    "																				<span md-highlight-text=\"data.searchTextShoppingCenter\">{{shoppingCenter.name}}</span>\n" +
    "																		</md-item-template>\n" +
    "																		<md-not-found>\n" +
    "																				No matching \"{{data.searchTextShoppingCenter}}\" shopping center were found.\n" +
    "																		</md-not-found>\n" +
    "																</md-autocomplete>\n" +
    "														</div>\n" +
    "														<md-input-container flex ng-if=\"!userType.shopping_center_id\">\n" +
    "																<label>Shopping Center Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.shopping_center_name\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "													</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>ZIP</label>\n" +
    "																<input type=\"text\" ng-change=\"geoLocationByZip(userType.zip)\" ng-model=\"userType.zip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>City Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.city\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>Address</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.address\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Phone</label>\n" +
    "																<input type=\"text\" ng-minlength=\"6\" ng-model=\"userType.phone\"/>\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>Website</label>\n" +
    "																<input type=\"text\" placeholder=\"http://www.example.com\" ng-model=\"userType.website\"/>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Categories</label>\n" +
    "																<tags-input ng-model=\"userType.categories\"\n" +
    "																						key-property=\"id\"\n" +
    "																						placeholder=\"Add Category\"\n" +
    "																						display-property=\"name\"\n" +
    "																						add-from-autocomplete-only=\"true\"\n" +
    "																						replace-spaces-with-dashes=\"false\"\n" +
    "																						max-results-to-show=\"10\">\n" +
    "																		<auto-complete debounce-delay=\"100\"\n" +
    "																									 source=\"loadCategories($query)\"\n" +
    "																									 load-on-empty=\"true\"\n" +
    "																									 min-length=\"0\"\n" +
    "																									 load-on-focus=\"true\">\n" +
    "																		</auto-complete>\n" +
    "																</tags-input>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "										</div>\n" +
    "										<div layout=\"column\" ng-if=\"data.selectedUserType.id == 2\">\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Shopping Center Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.name\" required>\n" +
    "														</md-input-container>\n" +
    "														<div flex>\n" +
    "																<md-autocomplete md-selected-item=\"data.selectedArea\"\n" +
    "																								 md-search-text=\"data.searchAreaText\"\n" +
    "																								 md-selected-item-change=\"selectArea(area)\"\n" +
    "																								 md-items=\"area in loadArea(data.searchAreaText)\"\n" +
    "																								 md-item-text=\"area.name\"\n" +
    "																								 required\n" +
    "																								 md-delay=\"300\"\n" +
    "																								 md-min-length=\"0\"\n" +
    "																								 md-require-match\n" +
    "																								 md-floating-label=\"Area\">\n" +
    "																		<md-item-template>\n" +
    "																				<span md-highlight-text=\"data.searchAreaText\">{{area.name}}</span>\n" +
    "																		</md-item-template>\n" +
    "																		<md-not-found>\n" +
    "																				No matching \"{{data.searchAreaText}}\" areas were found.\n" +
    "																		</md-not-found>\n" +
    "																</md-autocomplete>\n" +
    "														</div>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Description</label>\n" +
    "																<textarea rows=\"2\" type=\"text\" ng-model=\"userType.description\" required></textarea>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>ZIP</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.zip\" ng-change=\"geoLocationByZip(userType.zip)\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>City Name</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.city\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "														<md-input-container flex>\n" +
    "																<label>Address</label>\n" +
    "																<input type=\"text\" ng-model=\"userType.address\" ng-disabled=\"loadingByZip\" ng-required=\"!userType.shopping_center_id\">\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<div layout=\"row\">\n" +
    "														<md-input-container flex>\n" +
    "																<label>Website</label>\n" +
    "																<input type=\"text\" placeholder=\"http://www.example.com\" ng-model=\"userType.website\"/>\n" +
    "														</md-input-container>\n" +
    "												</div>\n" +
    "												<md-button class=\"md-raised md-primary\" ng-click=\"openTimeModal($event)\">Set Shopping Center working hours</md-button>\n" +
    "										</div>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"register()\" pull-right ng-disabled=\"formStepTwo.$invalid || loading || !data.selectedUserType\">\n" +
    "												<span ng-show=\"!loading\">Register</span>\n" +
    "												<span ng-show=\"loading\"><i class=\"fa fa-cog fa-spin\"></i> Please wait...</span>\n" +
    "										</md-button>\n" +
    "								</div>\n" +
    "								<div ng-form=\"formStepThree\" ng-if=\"step == 3\" layout=\"column\" class=\"text-center\">\n" +
    "										<p>Thank you!</p>\n" +
    "										<p>Your registration has been submitted and your {{data.selectedUserType.id == 1 ? 'Merchant' : 'Shopping center'}} account is waiting for activation. </p>\n" +
    "										<p>After you received activation link on e-mail you can start adding coupons.</p>\n" +
    "										<md-button class=\"md-raised md-primary\" type=\"button\" ui-sref=\"login\" class=\"pull-right\">OK</md-button>\n" +
    "								</div>\n" +
    "						</md-content>\n" +
    "				</md-whiteframe>\n" +
    "		</div>\n" +
    "</md-content>\n" +
    "");
  $templateCache.put("/app/sections/settings/settings.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "        User {{user.id ? profileText : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>User {{user.id ? 'Edit' : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>First Name</label>\n" +
    "                        <input ng-model=\"user.first_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Last Name</label>\n" +
    "                        <input ng-model=\"user.last_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Email</label>\n" +
    "                        <input required ng-model=\"user.email\" type=\"text\" ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <!-- <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-minlength=\"6\" ng-model=\"user.password\" type=\"password\">\n" +
    "                        <em>* minimum 6 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password Confirmation</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-model=\"user.password_confirmation\" type=\"password\" ng-minlength=\"6\">\n" +
    "                    </md-input-container>\n" +
    "                </div> -->\n" +
    "                <div layout=\"row\" ng-if=\"user.type == 3 && user.id == session.user_id\">\n" +
    "                    <md-switch ng-model=\"user.notifications\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Email notification\">\n" +
    "                        Email notification: {{ user.notifications ? 'Yes' : 'No'}}\n" +
    "                    </md-switch>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || user.password != user.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && user.id\"><span class=\"icon-lic-update btn-icon\"></span>Update</span>\n" +
    "                <span ng-show=\"!loading && !user.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- </md-dialog> -->\n" +
    "");
  $templateCache.put("/app/sections/shoppingCenters/modals/merchantListModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Merchants</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "                <table md-table>\n" +
    "                    <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortMerchants\">\n" +
    "                    <tr md-row>\n" +
    "                        <th md-column md-order-by=\"id\">\n" +
    "                            <span>No.</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by Id</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column md-order-by=\"name\">\n" +
    "                            <span>Name</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by Name</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column>\n" +
    "                            <span>Shopping Center</span>\n" +
    "                        </th>\n" +
    "                        <th></th>\n" +
    "                    </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"merchant in merchants track by $index\">\n" +
    "                        <td md-cell ng-bind=\"merchant.id\"></td>\n" +
    "                        <td md-cell ng-bind=\"merchant.name\"></td>\n" +
    "                        <td md-cell ng-bind=\"merchant.shopping_center_name ? merchant.shopping_center_name : '-'\"></td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-button aria-label=\"Coupons\" class=\"md-raised\" ng-click=\"goToCouponsPage(merchant)\">\n" +
    "                                <i class=\"fa fa-id-card-o\" aria-hidden=\"true\"></i>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Coupons</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                            <md-button aria-label=\"Edit\" class=\"md-raised\"\n" +
    "                                       ng-click=\"openMerchantModal($event, merchant)\">\n" +
    "                                <i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                            <md-button aria-label=\"Remove\" class=\"md-raised md-warn\"\n" +
    "                                       ng-click=\"removeModal($event, merchant)\">\n" +
    "                                <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n" +
    "                                <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                            </md-button>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                    </tbody>\n" +
    "                </table>\n" +
    "            </md-table-container>\n" +
    "            <h4 ng-show=\"!loading && !total\" class=\"text-center margin-top-10\">Currently there are no merchants for\n" +
    "                selected shopping centar.</h4>\n" +
    "            <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "            <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\"\n" +
    "                                 md-page=\"params.page\"\n" +
    "                                 md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/shoppingCenters/modals/shoppingCenterModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Shopping Center {{shoppingCenter.id ? 'Edit - ' + shoppingCenter.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Name</label>\n" +
    "                                    <input name=\"name\" ng-model=\"shoppingCenter.name\" minlength=\"3\" required\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter shopping\n" +
    "                                        center name</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.minlength\">Name must be at least\n" +
    "                                        3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea name=\"description\" minlength=\"3\" required\n" +
    "                                              ng-model=\"shoppingCenter.description\" rows=\"5\"\n" +
    "                                              md-select-on-focus></textarea>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter\n" +
    "                                        description</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description\n" +
    "                                        must be at least 3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <div flex>\n" +
    "                                    <md-autocomplete md-input-name=\"area\" md-selected-item=\"selectedArea\"\n" +
    "                                                     md-search-text=\"searchAreaText\"\n" +
    "                                                     md-selected-item-change=\"selectArea(area)\"\n" +
    "                                                     required md-items=\"area in loadArea(searchAreaText)\"\n" +
    "                                                     md-item-text=\"area.name\" md-require-match\n" +
    "                                                     md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                                        <md-item-template>\n" +
    "                                            <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                                        </md-item-template>\n" +
    "                                        <md-not-found>\n" +
    "                                            No states matching \"{{searchAreaText}}\" were found.\n" +
    "                                        </md-not-found>\n" +
    "                                        <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select\n" +
    "                                            area</em>\n" +
    "                                    </md-autocomplete>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Zip</label>\n" +
    "                                    <input name=\"zip\"\n" +
    "                                           ng-model=\"shoppingCenter.zip\"\n" +
    "                                           ng-change=\"geoLocationByZip(shoppingCenter.zip)\"\n" +
    "                                           ng-required=\"!shoppingCenter.lat || !shoppingCenter.lon\"\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP\n" +
    "                                        code</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Address</label>\n" +
    "                                    <input name=\"address\" ng-model=\"shoppingCenter.address\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter\n" +
    "                                        address</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>City</label>\n" +
    "                                    <input name=\"city\" ng-model=\"shoppingCenter.city\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city\n" +
    "                                        name</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Latitude</label>\n" +
    "                                    <input name=\"lat\" ng-model=\"shoppingCenter.lat\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter\n" +
    "                                        latitude</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Longitude</label>\n" +
    "                                    <input name=\"lng\" ng-model=\"shoppingCenter.lon\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lng.$error.required\">Please enter\n" +
    "                                        Longitude</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Website</label>\n" +
    "                                    <input ng-model=\"shoppingCenter.website\" placeholder=\"http://www.example.com\"\n" +
    "                                           type=\"text\" name=\"website\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.website.$error.required\">Please enter\n" +
    "                                        website (http://www.example.com)</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"column\">\n" +
    "                                <h4>Shopping center logo</h4>\n" +
    "                                <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                                <div class=\"merchant-logo-container\" ng-if=\"shoppingCenter.logo && !imagePreparedForUpload\">\n" +
    "                                    <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                                    <img width=\"140\" height=\"140\" ng-src=\"{{shoppingCenter.logo}}\">\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                    <md-tab label=\"Working hours\">\n" +
    "                        <md-content class=\"md-padding\" ng-form=\"timeForm\">\n" +
    "                            <div layout=\"row\" class=\"working-hours-all\">\n" +
    "                                <span>Set all from</span>\n" +
    "                                <mdp-time-picker name=\"allFrom\" ng-model=\"all.from\"></mdp-time-picker>\n" +
    "                                <span>to</span>\n" +
    "                                <mdp-time-picker name=\"allTo\" ng-model=\"all.to\"></mdp-time-picker>\n" +
    "                                <md-input-container>\n" +
    "                                    <md-button class=\"md-raised working-hours-margin-fix\" ng-click=\"setTime()\">Set\n" +
    "                                    </md-button>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <md-table-container>\n" +
    "                                <table md-table>\n" +
    "                                    <thead md-head>\n" +
    "                                    <tr md-row>\n" +
    "                                        <th md-column>Week Day</th>\n" +
    "                                        <th md-column>From</th>\n" +
    "                                        <th md-column>To</th>\n" +
    "                                    </tr>\n" +
    "                                    </thead>\n" +
    "                                    <tbody md-body>\n" +
    "                                    <tr md-row ng-repeat=\"day in shoppingCenter.working_hours\">\n" +
    "                                        <td md-cell>\n" +
    "                                            <span>{{day.day}}</span>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayFrom{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.to && !day.from}\"\n" +
    "                                                             ng-model=\"day.from\">\n" +
    "                                                <div ng-if=\"day.to && !day.from\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayTo{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.from && !day.to }\"\n" +
    "                                                             ng-model=\"day.to\">\n" +
    "                                                <div ng-if=\"day.from && !day.to\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                    </tr>\n" +
    "                                    </tbody>\n" +
    "                                </table>\n" +
    "                            </md-table-container>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\"\n" +
    "                       ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && shoppingCenter.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !shoppingCenter.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/shoppingCenters/modals/shoppingCenterTimeModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Working Days</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\" class=\"working-hours-all\">\n" +
    "                    <span>Set all from</span>\n" +
    "                    <mdp-time-picker name=\"allFrom\" ng-model=\"all.from\"></mdp-time-picker>\n" +
    "                    <span>to</span>\n" +
    "                    <mdp-time-picker name=\"allTo\" ng-model=\"all.to\"></mdp-time-picker>\n" +
    "                    <md-input-container>\n" +
    "                        <md-button class=\"md-raised working-hours-margin-fix\" ng-click=\"setTime()\">Set</md-button>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <md-table-container>\n" +
    "                    <table md-table>\n" +
    "                        <thead md-head>\n" +
    "                            <tr md-row>\n" +
    "                                <th md-column>Week Day</th>\n" +
    "                                <th md-column>From</th>\n" +
    "                                <th md-column>To</th>\n" +
    "                            </tr>\n" +
    "                        </thead>\n" +
    "                        <tbody md-body>\n" +
    "                            <tr md-row ng-repeat=\"day in workingDays\">\n" +
    "                                <td md-cell>\n" +
    "                                    <span>{{day.day}}</span>\n" +
    "                                </td>\n" +
    "                                <td md-cell>\n" +
    "                                    <mdp-time-picker ng-model=\"day.from\"></mdp-time-picker>\n" +
    "                                </td>\n" +
    "                                <td md-cell>\n" +
    "                                    <mdp-time-picker ng-model=\"day.to\"></mdp-time-picker>\n" +
    "                                </td>\n" +
    "                            </tr>\n" +
    "                        </tbody>\n" +
    "                    </table>\n" +
    "                </md-table-container>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && shoppingCenter.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !shoppingCenter.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/shoppingCenters/shopping-centers.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"padding-bottom-0\"><i class=\"fa fa-database\" aria-hidden=\"true\"></i> Shopping Centers</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\"\n" +
    "                       ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "            <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button>\n" +
    "            <md-input-container class=\"no\" ng-if=\"session.role =='admin'\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"shoppingCenterModal($event)\"\n" +
    "                           aria-label=\"Add\">\n" +
    "                    Add\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortShoppingCenters\">\n" +
    "                <tr md-row>\n" +
    "                    <th md-column md-order-by=\"name\">\n" +
    "                        <span>Name</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Name</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                    <th md-column md-order-by=\"area_name\">\n" +
    "                        <span>Area</span>\n" +
    "                        <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                            <md-tooltip md-direction=\"bottom\">Sort by Area</md-tooltip>\n" +
    "                        </i>\n" +
    "                    </th>\n" +
    "                </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                <tr md-row ng-repeat=\"shoppingCenter in shoppingCenters track by $index\">\n" +
    "                    <td md-cell ng-bind=\"shoppingCenter.name\"></td>\n" +
    "                    <td md-cell ng-bind=\"shoppingCenter.area_name\"></td>\n" +
    "                    <td md-cell text-right>\n" +
    "                        <md-button class=\"md-raised\" ng-click=\"merchantsModal($event, shoppingCenter)\">\n" +
    "                            <i class=\"fa fa-list-alt\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Merchants</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button class=\"md-raised\" ng-click=\"shoppingCenterModal($event, shoppingCenter)\">\n" +
    "                            <i class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Edit</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                        <md-button class=\"md-raised md-warn\" ng-if=\"session.role != 'sc-user'\" ng-disabled=\"shoppingCenter.loading\"\n" +
    "                                   ng-click=\"removeModal($event, shoppingCenter)\">\n" +
    "                            <i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>\n" +
    "                            <md-tooltip md-direction=\"bottom\">Delete</md-tooltip>\n" +
    "                        </md-button>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no shopping centers\n" +
    "            in your database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\"\n" +
    "                             md-page=\"params.page\"\n" +
    "                             md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
  $templateCache.put("/app/sections/shoppingSettings/shoppingSettings.html",
    "<div ng-if=\"session.role == 'sc-user'\" flex layout=\"column\">\n" +
    "     <span class=\"padding-bottom table-title\">\n" +
    "        {{shoppingCenter.id ? 'Edit - ' + shoppingCenter.name : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Shopping Center {{shoppingCenter.id ? 'Edit - ' + shoppingCenter.name : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <md-tabs md-dynamic-height md-border-bottom md-stretch-tabs=\"always\">\n" +
    "                    <md-tab label=\"Details\">\n" +
    "                        <md-content class=\"md-padding\">\n" +
    "                            <div layout=\"column\">\n" +
    "                                <h4>Shopping center logo</h4>\n" +
    "                                <div ng-if=\"imagePreparedForUpload\" file=\"imagePreparedForUpload._file\" width=\"140\" height=\"140\" ng-thumb></div>\n" +
    "                                <div class=\"merchant-logo-container\" ng-if=\"shoppingCenter.logo && !imagePreparedForUpload\">\n" +
    "                                    <a href=\"#\" ng-click=\"removeLogo()\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\"></i></a>\n" +
    "                                    <img width=\"140\" height=\"140\" ng-src=\"{{shoppingCenter.logo}}\">\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <input type=\"file\" nv-file-select=\"\" uploader=\"uploader\" />\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Name</label>\n" +
    "                                    <input name=\"name\" ng-model=\"shoppingCenter.name\" minlength=\"3\" required\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.required\">Please enter shopping\n" +
    "                                        center name</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.name.$error.minlength\">Name must be at least\n" +
    "                                        3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Description</label>\n" +
    "                                    <textarea name=\"description\" minlength=\"3\" required\n" +
    "                                              ng-model=\"shoppingCenter.description\" rows=\"5\"\n" +
    "                                              md-select-on-focus></textarea>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.required\">Please enter\n" +
    "                                        description</em>\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.description.$error.minlength\">Description\n" +
    "                                        must be at least 3 characters long</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <div flex>\n" +
    "                                    <md-autocomplete md-input-name=\"area\" \n" +
    "                                                     md-search-text=\"searchAreaText\"\n" +
    "                                                     md-selected-item-change=\"selectArea(area)\"\n" +
    "                                                     required md-items=\"area in loadArea(searchAreaText)\"\n" +
    "                                                     md-item-text=\"area.name\" md-require-match\n" +
    "                                                     md-delay=\"300\" md-min-length=\"0\" md-floating-label=\"Area\">\n" +
    "                                        <md-item-template>\n" +
    "                                            <span md-highlight-text=\"searchAreaText\">{{area.name}}</span>\n" +
    "                                        </md-item-template>\n" +
    "                                        <md-not-found>\n" +
    "                                            No states matching \"{{searchAreaText}}\" were found.\n" +
    "                                        </md-not-found>\n" +
    "                                        <em class=\"error-message\" ng-show=\"form.area.$error.required\">Please select\n" +
    "                                            area</em>\n" +
    "                                    </md-autocomplete>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Zip</label>\n" +
    "                                    <input name=\"zip\"\n" +
    "                                           ng-model=\"shoppingCenter.zip\"\n" +
    "                                           ng-change=\"geoLocationByZip(shoppingCenter.zip)\"\n" +
    "                                           ng-required=\"!shoppingCenter.lat || !shoppingCenter.lon\"\n" +
    "                                           type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.zip.$error.required\">Please enter ZIP\n" +
    "                                        code</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Address</label>\n" +
    "                                    <input name=\"address\" ng-model=\"shoppingCenter.address\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.address.$error.required\">Please enter\n" +
    "                                        address</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>City</label>\n" +
    "                                    <input name=\"city\" ng-model=\"shoppingCenter.city\" required\n" +
    "                                           ng-disabled=\"loadingByZip\" type=\"text\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.city.$error.required\">Please enter city\n" +
    "                                        name</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Latitude</label>\n" +
    "                                    <input name=\"lat\" ng-model=\"shoppingCenter.lat\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lat.$error.required\">Please enter\n" +
    "                                        latitude</em>\n" +
    "                                </md-input-container>\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Longitude</label>\n" +
    "                                    <input name=\"lng\" ng-model=\"shoppingCenter.lon\" required ng-disabled=\"loadingByZip\"\n" +
    "                                           type=\"number\" step=\"any\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.lng.$error.required\">Please enter\n" +
    "                                        Longitude</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <div layout=\"row\">\n" +
    "                                <md-input-container flex>\n" +
    "                                    <label>Website</label>\n" +
    "                                    <input ng-model=\"shoppingCenter.website\" placeholder=\"http://www.example.com\"\n" +
    "                                           type=\"text\" name=\"website\">\n" +
    "                                    <em class=\"error-message\" ng-show=\"form.website.$error.required\">Please enter\n" +
    "                                        website (http://www.example.com)</em>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                    <md-tab label=\"Working hours\">\n" +
    "                        <md-content class=\"md-padding\" ng-form=\"timeForm\">\n" +
    "                            <div layout=\"row\" class=\"working-hours-all\">\n" +
    "                                <span>Set all from</span>\n" +
    "                                <mdp-time-picker name=\"allFrom\" ng-model=\"all.from\"></mdp-time-picker>\n" +
    "                                <span>to</span>\n" +
    "                                <mdp-time-picker name=\"allTo\" ng-model=\"all.to\"></mdp-time-picker>\n" +
    "                                <md-input-container>\n" +
    "                                    <md-button class=\"md-raised working-hours-margin-fix\" ng-click=\"setTime()\">Set\n" +
    "                                    </md-button>\n" +
    "                                </md-input-container>\n" +
    "                            </div>\n" +
    "                            <md-table-container>\n" +
    "                                <table md-table>\n" +
    "                                    <thead md-head>\n" +
    "                                    <tr md-row>\n" +
    "                                        <th md-column>Week Day</th>\n" +
    "                                        <th md-column>From</th>\n" +
    "                                        <th md-column>To</th>\n" +
    "                                    </tr>\n" +
    "                                    </thead>\n" +
    "                                    <tbody md-body>\n" +
    "                                    <tr md-row ng-repeat=\"day in shoppingCenter.working_hours\">\n" +
    "                                        <td md-cell>\n" +
    "                                            <span>{{day.day}}</span>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayFrom{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.to && !day.from}\"\n" +
    "                                                             ng-model=\"day.from\">\n" +
    "                                                <div ng-if=\"day.to && !day.from\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                        <td md-cell>\n" +
    "                                            <mdp-time-picker name=\"dayTo{{day.day}}\"\n" +
    "                                                             ng-class=\"{'work-day-invalid': day.from && !day.to }\"\n" +
    "                                                             ng-model=\"day.to\">\n" +
    "                                                <div ng-if=\"day.from && !day.to\" class=\"red\">This is required</div>\n" +
    "                                            </mdp-time-picker>\n" +
    "                                        </td>\n" +
    "                                    </tr>\n" +
    "                                    </tbody>\n" +
    "                                </table>\n" +
    "                            </md-table-container>\n" +
    "                        </md-content>\n" +
    "                    </md-tab>\n" +
    "                </md-tabs>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\"\n" +
    "                       ng-disabled=\"form.$invalid || loading\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && shoppingCenter.id\">Update</span>\n" +
    "                <!-- <span ng-show=\"!loading && !shoppingCenter.id\">Add</span> -->\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>");
  $templateCache.put("/app/sections/users/modals/passwordModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Change password for {{user.first_name}} {{user.last_name}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\" layout=\"column\">\n" +
    "                <div layout=\"row\" ng-if=\"session.role != 'admin'\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Old password</label>\n" +
    "                        <input required ng-model=\"model.old_password\" type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>New Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <em>* minimum 6 characters long</em>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Confirm Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password_confirmation\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || model.password != model.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading\">Update</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("/app/sections/users/modals/userModal.html",
    "<md-dialog aria-label=\"Modal\" flex>\n" +
    "    <form name=\"form\">\n" +
    "        <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>User {{user.id ? 'Edit' : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div layout=\"row\" ng-if=\"!profileEdit\">\n" +
    "                    <md-input-container>\n" +
    "                        <label>User type</label>\n" +
    "                        <md-select ng-model=\"user.type\" ng-change=\"roleChanged()\">\n" +
    "                            <md-option ng-if=\"userRole.id\" ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                                {{userRole.name}}\n" +
    "                            </md-option>\n" +
    "                        </md-select>\n" +
    "                    </md-input-container>\n" +
    "                    <div flex ng-if=\"user.type == 1 && !user.id\">\n" +
    "                        <md-autocomplete md-input-name=\"merchant\" md-selected-item=\"selectedMerchant\" md-search-text=\"data.searchMerchantText\" md-selected-item-change=\"selectMerchant(merchant)\"\n" +
    "                                         md-items=\"merchant in loadMerchants(data.searchMerchantText)\" md-item-text=\"merchant.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Merchant\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchMerchantText\">{{merchant.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchMerchantText}}\" merchants were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div flex ng-if=\"user.type == 2 && !user.id\">\n" +
    "                        <md-autocomplete md-input-name=\"shippingCenter\" md-selected-item=\"selectedShoppingCenter\" md-search-text=\"data.searchShoppingCenterText\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "                                         md-items=\"shoppingCenter in loadShoppingCenters(data.searchShoppingCenterText)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchShoppingCenterText\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchShoppingCenterText}}\" shopping centers were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>First Name</label>\n" +
    "                        <input ng-model=\"user.first_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Last Name</label>\n" +
    "                        <input ng-model=\"user.last_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Email</label>\n" +
    "                        <input required ng-model=\"user.email\" type=\"text\" ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-minlength=\"6\" ng-model=\"user.password\" type=\"password\">\n" +
    "                        <em>* minimum 6 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password Confirmation</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-model=\"user.password_confirmation\" type=\"password\" ng-minlength=\"6\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"user.type == 3 && user.id == session.user_id\">\n" +
    "                    <md-switch ng-model=\"user.notifications\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Email notification\">\n" +
    "                        Email notification: {{ user.notifications ? 'Yes' : 'No'}}\n" +
    "                    </md-switch>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions layout=\"row\">\n" +
    "            <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button>\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || user.password != user.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && user.id\">Update</span>\n" +
    "                <span ng-show=\"!loading && !user.id\">Add</span>\n" +
    "            </md-button>\n" +
    "        </md-dialog-actions>\n" +
    "    </form>\n" +
    "</md-dialog>");
  $templateCache.put("/app/sections/users/passwordChange/passwordModal.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "        Change password for {{user.first_name}} {{user.last_name}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>Change password for {{user.first_name}} {{user.last_name}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"row\" ng-if=\"session.role != 'admin'\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Old password</label>\n" +
    "                        <input ng-model=\"model.old_password\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>New Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <em>* minimum 6 characters long</em>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Confirm Password</label>\n" +
    "                        <input ng-minlength=\"6\" ng-model=\"model.password_confirmation\" required type=\"password\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || model.password != model.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading\"><span class=\"icon-lic-update btn-icon\"></span>Update</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->\n" +
    "");
  $templateCache.put("/app/sections/users/userEdit/userModal.html",
    "<!-- <md-dialog aria-label=\"Modal\" flex> -->\n" +
    "<div flex layout=\"column\">\n" +
    "    <span class=\"padding-bottom table-title\">\n" +
    "        User {{user.id ? 'Edit' : 'Add'}}\n" +
    "    </span>\n" +
    "    <form name=\"form\">\n" +
    "        <!-- <md-toolbar>\n" +
    "            <div class=\"md-toolbar-tools\">\n" +
    "                <h2>User {{user.id ? 'Edit' : 'Add'}}</h2>\n" +
    "                <span flex></span>\n" +
    "                <md-button type=\"button\" class=\"md-icon-button\" ng-click=\"cancel()\">\n" +
    "                    <md-icon class=\"fa\" md-font-icon=\"fa-times\" aria-label=\"Close dialog\"></md-icon>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </md-toolbar> -->\n" +
    "        <md-content flex layout=\"column\" layout-padding>\n" +
    "            <div layout=\"column\">\n" +
    "                <div layout=\"row\" ng-if=\"!profileEdit\">\n" +
    "                    <md-input-container>\n" +
    "                        <label>User type</label>\n" +
    "                        <md-select ng-model=\"user.type\" ng-change=\"roleChanged()\">\n" +
    "                            <md-option ng-if=\"userRole.id\" ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                                {{userRole.name}}\n" +
    "                            </md-option>\n" +
    "                        </md-select>\n" +
    "                    </md-input-container>\n" +
    "                    <div flex ng-if=\"user.type == 1\">\n" +
    "                        <md-autocomplete md-input-name=\"merchant\" ng-disabled=\"editType\" md-selected-item=\"selectedMerchant\" required md-search-text=\"data.searchMerchantText\" md-selected-item-change=\"selectMerchant(merchant)\"\n" +
    "                                         md-items=\"merchant in loadMerchants(data.searchMerchantText)\" md-item-text=\"merchant.name\" md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Merchant\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchMerchantText\">{{merchant.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchMerchantText}}\" merchants were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                    <div class=\"edit_merchant_icon\" flex ng-if=\"editType\">\n" +
    "                        <i ng-click=\"enableEdit()\" class=\"fa fa-edit\" aria-hidden=\"true\" title=\"Edit merchant\"></i>\n" +
    "                    </div> \n" +
    "\n" +
    "                    <div flex ng-if=\"user.type == 2 && !user.id\">\n" +
    "                        <md-autocomplete md-input-name=\"shippingCenter\" md-selected-item=\"selectedShoppingCenter\" md-search-text=\"data.searchShoppingCenterText\" md-selected-item-change=\"selectShoppingCenter(shoppingCenter)\"\n" +
    "                                         md-items=\"shoppingCenter in loadShoppingCenters(data.searchShoppingCenterText)\" md-item-text=\"shoppingCenter.name\" md-require-match md-delay=\"300\"\n" +
    "                                         md-min-length=\"0\" md-floating-label=\"Shopping Center\">\n" +
    "                            <md-item-template>\n" +
    "                                <span md-highlight-text=\"data.searchShoppingCenterText\">{{shoppingCenter.name}}</span>\n" +
    "                            </md-item-template>\n" +
    "                            <md-not-found>\n" +
    "                                No matching \"{{data.searchShoppingCenterText}}\" shopping centers were found.\n" +
    "                            </md-not-found>\n" +
    "                        </md-autocomplete>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>First Name</label>\n" +
    "                        <input ng-model=\"user.first_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Last Name</label>\n" +
    "                        <input ng-model=\"user.last_name\" required type=\"text\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Email</label>\n" +
    "                        <input required ng-model=\"user.email\" type=\"text\" ng-pattern=\"/^[_a-z0-9]+(\\.[_a-z0-9]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$/\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"!user.id\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-minlength=\"6\" ng-model=\"user.password\" type=\"password\">\n" +
    "                        <em>* minimum 6 characters long</em>\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"!user.id\">\n" +
    "                    <md-input-container flex>\n" +
    "                        <label>Password Confirmation</label>\n" +
    "                        <input ng-required=\"!user.id\" ng-model=\"user.password_confirmation\" type=\"password\" ng-minlength=\"6\">\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "                <div layout=\"row\" ng-if=\"user.type == 3 && user.id == session.user_id\">\n" +
    "                    <md-switch ng-model=\"user.notifications\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Email notification\">\n" +
    "                        Email notification: {{ user.notifications ? 'Yes' : 'No'}}\n" +
    "                    </md-switch>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-content>\n" +
    "        <section layout=\"row\">\n" +
    "            <!-- <md-button type=\"button\" class=\"md-raised\" ng-click=\"cancel()\">Back</md-button> -->\n" +
    "            <md-button type=\"submit\" ng-click=\"save()\" class=\"md-raised md-primary\" ng-disabled=\"form.$invalid || loading || user.password != user.password_confirmation\">\n" +
    "                <span ng-show=\"loading\">Please wait...</span>\n" +
    "                <span ng-show=\"!loading && user.id\"><span class=\"icon-lic-update btn-icon\"></span>Update</span>\n" +
    "                <span ng-show=\"!loading && !user.id\"><span class=\"icon-lic-save btn-icon\"></span> Add</span>\n" +
    "            </md-button>\n" +
    "        </section>\n" +
    "    </form>\n" +
    "</div>\n" +
    "<!-- </md-dialog> -->");
  $templateCache.put("/app/sections/users/users.html",
    "<div>\n" +
    "    <div layout=\"column\">\n" +
    "        <span class=\"table-title padding-bottom\">\n" +
    "            <!-- <i class=\"fa fa-database\" aria-hidden=\"true\"></i> -->\n" +
    "             Users</span>\n" +
    "        <form novalidate flex layout=\"row\" ng-submit=\"search()\">\n" +
    "            <md-input-container>\n" +
    "                <label>User type</label>\n" +
    "                <md-select ng-model=\"params.type\" ng-change=\"filterRoleChanges()\">\n" +
    "                    <md-option ng-repeat=\"userRole in userRoles\" ng-value=\"userRole.id\">\n" +
    "                        {{userRole.name}}\n" +
    "                    </md-option>\n" +
    "                </md-select>\n" +
    "            </md-input-container>\n" +
    "            <md-input-container flex>\n" +
    "                <label>Search</label>\n" +
    "                <input type=\"text\" autocomplete=\"off\" ng-disabled=\"!total && !params.search\" ng-model=\"params.search\" ng-change=\"search()\">\n" +
    "            </md-input-container>\n" +
    "            <!-- <md-button class=\"md-fab md-mini\" type=\"submit\" ng-disabled=\"!total && !params.search\" aria-label=\"Search\">\n" +
    "                <i class=\"fa fa-search\"></i>\n" +
    "            </md-button> -->\n" +
    "            <md-input-container class=\"no\">\n" +
    "                <md-button class=\"md-raised md-primary\" type=\"button\" ng-click=\"openUserAdd()\" aria-label=\"Add\">\n" +
    "                    <span class=\"icon-lic-add btn-icon\"></span>Add New User\n" +
    "                </md-button>\n" +
    "            </md-input-container>\n" +
    "        </form>\n" +
    "        <h4 ng-show=\"loading\" class=\"text-center\">Please wait...</h4>\n" +
    "        <md-table-container ng-if=\"total > 0 && !loading\" class=\"user-table\">\n" +
    "            <table md-table md-progress=\"promise\">\n" +
    "                <thead md-head md-order=\"params.sort_by\" md-on-reorder=\"sortUsers\">\n" +
    "                    <tr md-row>\n" +
    "                        <th md-column md-order-by=\"id\">\n" +
    "                            <span>No.</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by No.</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column md-order-by=\"first_name\">\n" +
    "                            <span>First name</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by First name</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column md-order-by=\"last_name\">\n" +
    "                            <span>Last name</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by Last name</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "												<th md-column md-order-by=\"email\">\n" +
    "														<span>Email</span>\n" +
    "														<i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "																<md-tooltip md-direction=\"bottom\">Sort by Email</md-tooltip>\n" +
    "														</i>\n" +
    "												</th>\n" +
    "                        <th md-column md-order-by=\"type\">\n" +
    "                            <span>User type</span>\n" +
    "                            <i class=\"fa fa-sort\" aria-hidden=\"true\">\n" +
    "                                <md-tooltip md-direction=\"bottom\">Sort by User type</md-tooltip>\n" +
    "                            </i>\n" +
    "                        </th>\n" +
    "                        <th md-column>Active</th>\n" +
    "                    </tr>\n" +
    "                </thead>\n" +
    "                <tbody md-body>\n" +
    "                    <tr md-row ng-repeat=\"user in users track by $index\">\n" +
    "                        <td md-cell ng-bind=\"user.id\"></td>\n" +
    "                        <td md-cell ng-bind=\"user.first_name ? user.first_name : '-'\"></td>\n" +
    "                        <td md-cell ng-bind=\"user.last_name ? user.last_name : '-'\"></td>\n" +
    "                        <td md-cell ng-bind=\"user.email\"></td>\n" +
    "                        <td md-cell ng-bind=\"userRolesObject[user.type]\"></td>\n" +
    "                        <td md-cell width=\"10%\">\n" +
    "                            <md-switch nomrg nopadd ng-change=\"toggleActive(user)\" ng-model=\"user.active\" ng-true-value=\"1\" ng-false-value=\"0\" aria-label=\"Active\"></md-switch>\n" +
    "                        </td>\n" +
    "                        <td md-cell text-right>\n" +
    "                            <md-menu md-position-mode=\"target-right target\">\n" +
    "                                <md-button aria-label=\"Open demo menu\" ng-click=\"$mdOpenMenu($event)\">\n" +
    "                                    Options <i class=\"fa fa-caret-down\" aria-hidden=\"true\"></i>\n" +
    "                                </md-button>\n" +
    "                                <md-menu-content width=\"4\">\n" +
    "                                    <md-menu-item>\n" +
    "                                        <md-button ng-click=\"openUserEdit(user)\">\n" +
    "                                            <div layout=\"row\" flex>\n" +
    "                                                <span>Edit</span>\n" +
    "                                            </div>\n" +
    "                                        </md-button>\n" +
    "                                    </md-menu-item>\n" +
    "                                    <md-menu-item>\n" +
    "                                        <md-button ng-click=\"openPasswordChange(user)\">\n" +
    "                                            <div layout=\"row\" flex>\n" +
    "                                                <span>Change password</span>\n" +
    "                                            </div>\n" +
    "                                        </md-button>\n" +
    "                                    </md-menu-item>\n" +
    "                                    <md-menu-item>\n" +
    "                                        <md-button ng-click=\"deleteUser($event, user)\">\n" +
    "                                            <div layout=\"row\" flex>\n" +
    "                                                <span flex>Delete</span>\n" +
    "                                            </div>\n" +
    "                                        </md-button>\n" +
    "                                    </md-menu-item>\n" +
    "                                </md-menu-content>\n" +
    "                            </md-menu>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </tbody>\n" +
    "            </table>\n" +
    "        </md-table-container>\n" +
    "        <h4 ng-show=\"!loading && !total && !params.search\" class=\"text-center\">Currently there are no users in your database.</h4>\n" +
    "        <md-table-pagination ng-if=\"total > 0 && !loading\" md-options=\"[10, 20, 30]\" md-limit=\"params.limit\" md-page=\"params.page\"\n" +
    "            md-total=\"{{total}}\" md-on-paginate=\"onPaginate\" md-page-select></md-table-pagination>\n" +
    "    </div>\n" +
    "</div>");
}]);
