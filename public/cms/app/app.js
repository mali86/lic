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
angular.module('app').constant('configFireBase', configFireBase);