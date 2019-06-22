angular.module('app').filter("correctedDate", function () {
    return function (date) {
        if (date) {
            return moment.utc(date).local().format("MM/DD/YYYY HH:mm");
        }
    };
});
