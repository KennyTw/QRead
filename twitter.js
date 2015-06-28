var Twitter = require('twitter');
var	redis = require('redis');
var db = redis.createClient();
var newcount = 0;
var gcmstring = "";
var gcm = require('node-gcm');


var client = new Twitter({
  consumer_key: "3hKuyMKHNNM5q4HRCtM9XoWQc",
  consumer_secret: "HnOGlXXIfc71RfiD64xVoxfcaBGZjGwlZFsNBatG2aWDmkJZKY",
  access_token_key: "594648730-r4BCU2zNyeBnutQciAkSEAKmUHvXJnPoyYQDmef3",
  access_token_secret: "TKTLPwbF6muzCeVuaRU5ULppiVArVAd61YenpAskt8vrs",
});

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
 
 /*

client.stream('statuses/filter', {track: 'twitter'},  function(stream){
  stream.on('data', function(tweet) {
    console.log(tweet.text);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});*/

		
 		

function getdata() {
	db.hget("savetwitter" ,"lastid",function(err,dbdata) {
			//console.log(dbdata);
			//if (dbdata == undefined )
			//	dbdata = 0;			
			
			//var options = {count:1};
			var options = {};
			client.get('statuses/home_timeline' , options,function(error, tweets, response){
				if(error) throw error;
				//for (var i = 0 ; i < tweets.length  ; i++) {
					for (var i = tweets.length -1  ; i >= 0  ; i-- ) {
					//console.log(tweets[i].id + ":" + tweets[i].text); 
					//console.log(tweets[i]); 
					
					var tweet = tweets[i].text;
					//tweet = tweet.replace(/\&amp;/g,"&");
					//tweet2 = tweet.replace(/(https?:\/\/[\w-\.]+(:\d+)?(\/[\w\/\.]*)?(\?\S*)?(#\S*)?)/g,  '<a href="$1" target="new" >$1</a>');
					tweet = tweet.replace(/(https?:\/\/[\w-\.]+(:\d+)?(\/[\w\/\.]*)?(\?\S*)?(#\S*)?)/g,  '');
					var orgtweet = tweet;
					//tweet = tweet.replace(/\#(\w+)/g,"");
					//tweet = tweet.replace(/\@(\w+)/g,"");
					var mediaimg="";
					if (tweets[i].entities.media && tweets[i].entities.media[0])
						mediaimg =  "<img src='" + tweets[i].entities.media[0].media_url + "'>";
					
					var tweetlink="";
					if (tweets[i].entities.urls[0]){ //ignore none url
						tweetlink = '<a href="' + tweets[i].entities.urls[0].expanded_url + '" target="new" >Link</a>' ;
						//console.log(tweetlink);					
					
						tweet =  tweets[i].user.name + " : " + tweet +   mediaimg + tweetlink ;
						//console.log(JSON.stringify(tweets[i])); 
						
						
					
						if (dbdata == undefined ){					
							db.hset("savetwitter"  ,"page",0);
							db.hset("savetwitter"  ,"pos",0);
							db.hset("savetwitter"  ,"lastid",tweets[i].id);
							
							db.hset("savetwitter"  ,"lastid",tweets[i].id);					
							db.rpush("datatwitter"  ,tweet ,function(err,dbdata){});
							db.rpush("datakenny"  ,tweet ,function(err,dbdata){});
						}  else					
						if (parseInt(tweets[i].id) > parseInt(dbdata)) {
							db.hset("savetwitter"  ,"lastid",tweets[i].id);					
							db.rpush("datatwitter"  ,tweet,function(err,dbdata){});	
							db.rpush("datakenny"  ,tweet ,function(err,dbdata){});
							newcount++;
							//gcmstring += tweets[i].user.name	+ " : " + orgtweet  + "\r\n\r\n";
							var message = new gcm.Message();
							message.addData('content', tweets[i].user.name	+ " : " + orgtweet);
							message.addData('url',tweets[i].entities.urls[0].expanded_url);
							message.addData('img',mediaimg);
							
							var regIds = ['APA91bEdiFgl9ySFKpIN87T7eySjeFa1dGcZ9yiqlA5sD3Q71rTjV921ASoVnKHo35gRofuBj9_IuhbyIt_85crCYKpdmR78yy5cGVcH8YsUi8tSAufX4VNxn-n2BVP6upyycfflcvvl2nS2UwPeUwTqh-ycFpeqWQ'];
							var sender = new gcm.Sender('AIzaSyD4Iba2-V5a_KRdx5tHbDmRhGhvVnZsO7g');
							sender.send(message, regIds, function (err, result) {
								if(err) console.log(err);
								else    console.log(result);								
							});
						}
					}
				}
				//console.log(dbdata);
				console.log('done : ' + newcount);
				if (newcount > 0) {
							var rtn = {command:'newdata',book:'twitter'};
							db.publish("events",JSON.stringify(rtn));					
				}
				
				
				setTimeout(function(){ 
					//auto exit
					process.exit(0);
				}, 1 * 30 * 1000);
				
			});				
		});
}		
		

getdata();

/*
setInterval(function () {	
	getdata();
} , 5000);*/