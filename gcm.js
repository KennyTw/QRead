var gcm = require('node-gcm');

var message = new gcm.Message();
message.addData('key1', 'msg1');

var regIds = ['APA91bGUtIKbnzPCo3Lth4JDy_uMS4_VH5UrCwpIR8ds4XBgI4NwETE74RhMTGKw2Dh5pm3OQbMK2SJQrTw7oiI0afqabfvKxSVyLOpbC7CXA4lORXadQu14LwUqzSaMls5-CZa8Q76MTBjsm8hRpm2cDQMO4YkLrUev4P9BIWvJMO6TxoWjElI'];
//var regIds = ['285027108615'];



var sender = new gcm.Sender('AIzaSyD4Iba2-V5a_KRdx5tHbDmRhGhvVnZsO7g');

sender.send(message, regIds, function (err, result) {
	if(err) console.log(err);
	else    console.log(result);
});