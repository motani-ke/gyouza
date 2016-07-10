var bleno = require('bleno');

var name = 'raspberrypi';
var serviceUuids = ['180F'];

var exec = require('child_process').exec;

var primaryService = new bleno.PrimaryService({
    uuid: '180F',
    characteristics: [
        new bleno.Characteristic({
            uuid: '2A19',
            properties: ['read', 'write', 'notify'],
            value: new Buffer([100]),
            onWriteRequest: function(data, offset, withoutResponse, callback) { 
                var notifyFlg = data.toString('ascii');
                console.log('catId:' + notifyFlg);

                child = exec("python /home/pi/nfcpy/examples/read.py", function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                    if (null != notifyCallback) {
                        console.log("notify start");
                        notifyCallback(new Buffer("hogehoge"));
                    }
                });
 
                callback(bleno.Characteristic.RESULT_SUCCESS);
             }, 
             onSubscribe: function(maxValueSize, updateValueCallback) {
                 notifyCallback = updateValueCallback;
             },
        })
    ]
});

bleno.on('stateChange', function(state) {
    console.log('stateChange: '+state);
    if (state === 'poweredOn') {
        bleno.startAdvertising(name, serviceUuids, function(error){
            if (error) console.error(error);
        });
    } else {
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function(error){
    if (!error) {
        console.log('start advertising...');
        bleno.setServices([primaryService]);
    } else {
        console.error(error);
    }
});

bleno.on('accept', function(clientAddress) {
    console.log('clientAddr=' + clientAddress)
});
