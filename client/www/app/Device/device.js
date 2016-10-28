(function(){

    angular
        .module('Electra.device', [])
        .controller('deviceCtrl', deviceCtrl);


    //all function take part in device
    function deviceCtrl(DeviceFactory, ARDN, $ionicPopup, $scope, $rootScope) {
        var vm = this;
        vm.changeStatus = changeStatus;

        //all the equipments will switch off if user logout
        $rootScope.$on('user:logout', function() {
            vm.items.forEach(function(v, k) {
                if (v.status == 1) {
                    _turnOff(v.name.substr(1) + '000', k)
                }
            })
            //close the device one by one after logout
            function _turnOff(pin, selang) {
                setTimeout(function() {
                    ARDN.get({ pin:pin });
                }, 2500 * parseInt(selang));
            }
        })

        DeviceFactory.query(function(response) {
            response.forEach(function(v) {
                v.status = (v.status === "0") ? false : true;
                v.in_repair = (v.in_repair === "0") ? false : true;
            });

            vm.items = response;
        });

        //change status when user switch on and switc off the button
        //related with ARDUINO controller code
        function changeStatus(data) {
            var copy = {};
            //compare with Arduino C language
            var ardnID = data.name.substr(1);
            var ardnStatus = (data.status) ? '255' : '000';

            angular.copy(data, copy)

            if (copy.in_repair) {
                ardnStatus = '000';
                data.status = false;
                copy.status = false;
            } else {
                copy.status = (copy.status) ? 1 : 0;
            }

            ARDN.get({ pin: ardnID + ardnStatus }, __updateDB, __updateDB)


            //success update status equipment in DB
            function __updateDB(res) {
                DeviceFactory.changeStatus(copy, function(r) {
                    $ionicPopup.show({
                        title: 'Notification',
                        subTitle: (r) ? 'Device status changed' : 'Status change failed',
                        buttons: [ { text: 'OK', type: 'button-dark' }]
                    })
                })
            }
        }
    }


})()