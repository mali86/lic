angular.module('app').factory('pushNotificationService', function ($http, config, $q) {
    
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
