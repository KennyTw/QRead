var gcm = require('node-gcm');


var message = new gcm.Message();
//message.addData('key1', 'msg1');

//var regIds = ['APA91bGUtIKbnzPCo3Lth4JDy_uMS4_VH5UrCwpIR8ds4XBgI4NwETE74RhMTGKw2Dh5pm3OQbMK2SJQrTw7oiI0afqabfvKxSVyLOpbC7CXA4lORXadQu14LwUqzSaMls5-CZa8Q76MTBjsm8hRpm2cDQMO4YkLrUev4P9BIWvJMO6TxoWjElI'];
//var regIds = ['285027108615'];

var regIds = ['APA91bHbVm-Yctz14WhsQV2d_-R7LXO07Y4zxzvAwzZJ5Bgr4JezA9aSseWjgIIBfnGo_K-rhQw2RZM83Kt9g-KYfgjIyB7lejGmyLy2VlkiwU0qZINLlQA'];

var sender = new gcm.Sender('AIzaSyACVPrP30CXr3ZvIuDWn9FGeeYp3tHHZJw');
message.addData('content', "test2");								
message.addNotification({
  title: 'cicisasa 有新訊息哦!!!',
  body: '新的作者有新作品了',
  icon: 'ic_launcher'
});

sender.send(message, regIds, function (err, result) {
	if(err) console.log(err);
	else    console.log(result);
});

