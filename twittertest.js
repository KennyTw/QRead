var Twitter = require('twitter');

var newcount = 0;


var client = new Twitter({
  consumer_key: "3hKuyMKHNNM5q4HRCtM9XoWQc",
  consumer_secret: "HnOGlXXIfc71RfiD64xVoxfcaBGZjGwlZFsNBatG2aWDmkJZKY",
  access_token_key: "594648730-r4BCU2zNyeBnutQciAkSEAKmUHvXJnPoyYQDmef3",
  access_token_secret: "TKTLPwbF6muzCeVuaRU5ULppiVArVAd61YenpAskt8vrs",
});


var options = {};
client.get('statuses/home_timeline' , options,function(error, tweets, response){
	for (var i = tweets.length -1  ; i >= 0  ; i-- ) {
		console.log(i + "::::" + tweets[i].text);
		if (tweets[i].entities.urls[0]) {
			console.log(i + "::::" + tweets[i].entities.urls[0].url);
			console.log(i + "::::" + tweets[i].entities.urls[0].expanded_url);
		}
	}
	
	
});


/*
setInterval(function () {	
	getdata();
} , 5000);*/