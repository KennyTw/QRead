var FeedParser = require('feedparser')
  , request = require('request');
  
var	redis = require('redis');
var db = redis.createClient();
var newcount = 0;

function fetch(feed,callback) {
  // Define our streams
  var req = request(feed, {timeout: 10000, pool: false});
  req.setMaxListeners(50);
  // Some feeds do not respond without user-agent and accept headers.
  req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
  req.setHeader('accept', 'text/html,application/xhtml+xml');

  var feedparser = new FeedParser();

  // Define our handlers
  req.on('error', done);
  req.on('response', function(res) {
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));   
    res.pipe(feedparser);
  });

  feedparser.on('error', done);
  feedparser.on('end', function() {
	    //console.log(  '-------------------------- end');
	    callback();
  }); 
  feedparser.on('readable', function() { 
    //console.log(  '-------------------------- readable');
	 dbprocess(this,function() {});	
  });
}  

function dbprocess(streamdata , callback)  {
	(function addOne() {
		var record = streamdata.read(); // get the first record of coll and reduce coll by one
		try {
		 // console.log(record.id);
		  if (record == null) {
			  callback();
			  return;
		  }
		  var pos1 = record.link.indexOf('&t=');
		  if (pos1 >= 0) {
			  var id = record.link.substring(pos1+3,record.link.length);
			  db.sadd('savemobile01key',id, function(err,dbresult) {
				if (err) { callback(err); return }
				
					if (dbresult > 0) {	
						
						var text = record.title;
						var desc = record.description;
						desc = desc + " <a target='new' href='" + record.link + "'>Link</a>";									
						text = text + ":" + desc;				
						
						console.log(record.title);
						db.rpush("datamobile01"  ,text ,function(err,dbdata){});	
						newcount ++;
						
					} else {
						console.log('exist:' +  id + ' ' + record.title);
					}
					addOne();
				
			  });
		  }
		} catch (exception) {
		  callback(exception);
		}
	})();
}
  
function done(err) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }  
  process.exit();
}

db.exists("savemobile01" ,function(err,dbdata) {					
					if (dbdata == 0) {
						db.hset("savemobile01"  ,"page",0);
						db.hset("savemobile01"  ,"pos",0);
					}	
					fetch('http://www.mobile01.com/rss/hottopics.xml',function() {				
						console.log('done : ' + newcount);
						if (newcount > 0) {
							var rtn = {command:'newdata',book:'mobile01'};
							db.publish("events",JSON.stringify(rtn));					
						}
						
						process.exit();
					});
			
});



  
  
