var gcm = require('node-gcm');


var message = new gcm.Message();
//message.addData('key1', 'msg1');

//var regIds = ['APA91bGUtIKbnzPCo3Lth4JDy_uMS4_VH5UrCwpIR8ds4XBgI4NwETE74RhMTGKw2Dh5pm3OQbMK2SJQrTw7oiI0afqabfvKxSVyLOpbC7CXA4lORXadQu14LwUqzSaMls5-CZa8Q76MTBjsm8hRpm2cDQMO4YkLrUev4P9BIWvJMO6TxoWjElI'];
//var regIds = ['285027108615'];

var regIds = ['APA91bEdiFgl9ySFKpIN87T7eySjeFa1dGcZ9yiqlA5sD3Q71rTjV921ASoVnKHo35gRofuBj9_IuhbyIt_85crCYKpdmR78yy5cGVcH8YsUi8tSAufX4VNxn-n2BVP6upyycfflcvvl2nS2UwPeUwTqh-ycFpeqWQ'];

var sender = new gcm.Sender('AIzaSyD4Iba2-V5a_KRdx5tHbDmRhGhvVnZsO7g');


message.addData('content', "test2");								

sender.send(message, regIds, function (err, result) {
	if(err) console.log(err);
	else    console.log(result);
});

