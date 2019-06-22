angular.module('app').config(function ($stateProvider) {
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
