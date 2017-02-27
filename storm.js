var FeedParser = require('feedparser')
  , request = require('request');
  
var	redis = require('redis');
var db = redis.createClient();
var newcount = 0;
var block = 0;
var record ;

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
	    //callback();
  }); 
  feedparser.on('readable', function() { 
    //console.log(  '-------------------------- readable');
	if (block == 0) 
		dbprocess(this,function(result) {
			if (result == 'end')
				callback();
		});		
  });
}  

function dbprocess(streamdata , callback)  {
	(function addOne() {
		if (block == 0) {
			block = 1;
			record = streamdata.read(); // get the first record of coll and reduce coll by one
		}		
		try {
		 // console.log(record.id);
		  if (record == null) {
			  callback('end');
			  console.log('null return');
			  return;
		  }
		  db.sadd('savestormkey',record.guid, function(err,dbresult) {
			if (err) { callback(err); return }
			
				if (dbresult > 0) {	
					
					var yahootext = record.title;
					var desc = record.description;
					desc = desc.replace("<p>","");
					desc = desc.replace("</p>","");
					desc = desc.replace('align="left"','');
					//desc = desc.replace(record.link,'javascript:none'); 
					
					yahootext = yahootext + " : " + desc;
					yahootext = yahootext + " <a href='" +  record.link  + "' target='new'>Link</a>";
					yahootext = "<span>" + yahootext + "</span>"
					
					console.log(record.title);
					db.rpush("datastorm"  ,yahootext ,function(err,dbdata){});
					newcount++;
					
				} else {
					console.log('exist:' + record.guid + ' ' + record.title);
				}
				
				record = streamdata.read();
				addOne();
			
		  });
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

db.exists("savestorm" ,function(err,dbdata) {					
					if (dbdata == 0) {
						db.hset("savestorm"  ,"page",0);
						db.hset("savestorm"  ,"pos",0);
					}	
					
					
			fetch('http://www.storm.mg/feeds/all',function() {		
				 		
							console.log('done : ' + newcount);						
							if (newcount > 0) {
								var rtn = {command:'newdata',book:'storm'};
								db.publish("events",JSON.stringify(rtn));					
							}
							process.exit();					
				 
			});	
});



  
  
