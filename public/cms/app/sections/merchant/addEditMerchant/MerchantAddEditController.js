angular.module('app').config(function ($stateProvider) {
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
