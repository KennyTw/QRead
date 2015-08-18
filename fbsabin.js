var FB = require('fb');
var	redis = require('redis');
var db = redis.createClient();
var fs = require('fs');
var newcount = 0;
var book = "fbsabin";
//var gcmstring = "";
//var gcmindex = 0;
//var gcm = require('node-gcm');

/*
FB.api('oauth/access_token', {
    client_id: '470891803068657',
    client_secret: '0fe2fe8f854e3d7628337de1b711a989',
    grant_type: 'fb_exchange_token',
    fb_exchange_token: 'CAAGsRgqmSPEBAN1EPjZCZCZCUw52iUIUILikSucDdnTeUpOj8p4Rs1r3sLuz6C8pZAkw9qXZA5mEXnNXUZB8HVSR6rqmammnYFfbwJMP98tvU5254mdal3hKl7tMCZAcLpKtZBmNh88lxro1M28OYfe9nG5mhhquHv5oHZAk4A5y0xPBH5Kbx4m9jJ0gp49EGEgQ7jcsMl3zpSwXiZCx3wBu4ZBFKXXJ3KBFdlQkWBhR5N3igZDZD'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
    var expires = res.expires ? res.expires : 0;
	
	console.log(accessToken);
});*/


fs.readFile( book +  "token", 'utf8', function (err,token) {
  if (err) {
	process.exit(0);   
	return console.log(err);
  }
  console.log("token:" + token);
  gcmstring = "";
  gcmindex = 0;
  
  FB.api('oauth/access_token', {
	client_id: '470891803068657',
	client_secret: '0fe2fe8f854e3d7628337de1b711a989',
	grant_type: 'fb_exchange_token',
	fb_exchange_token: token
	}, function (res) {
		if(!res || res.error) {
			console.log(!res ? 'error occurred' : res.error);
			process.exit(0); 
			return;
		}

		var accessToken = res.access_token;
		fs.writeFile( book + "token", accessToken, function(err) {}); 
		FB.setAccessToken(accessToken);
		var expires = res.expires ? res.expires : 0;
		//getdata();process.exit(0); 
		//setTimeout(function(){getdata("owner"); },1000 * 60 * 1);
		getdata2("","me/home",function(){
			getdata2("owner","me/home",function(){
					console.log('done : ' + newcount);
					if (newcount > 0) {
							var rtn = {command:'newdata',book:book};
							db.publish("events",JSON.stringify(rtn));

							/*var message = new gcm.Message();
							message.addData('key1', gcmstring);
							var regIds = ['APA91bEdiFgl9ySFKpIN87T7eySjeFa1dGcZ9yiqlA5sD3Q71rTjV921ASoVnKHo35gRofuBj9_IuhbyIt_85crCYKpdmR78yy5cGVcH8YsUi8tSAufX4VNxn-n2BVP6upyycfflcvvl2nS2UwPeUwTqh-ycFpeqWQ'];
							var sender = new gcm.Sender('AIzaSyD4Iba2-V5a_KRdx5tHbDmRhGhvVnZsO7g');
							sender.send(message, regIds, function (err, result) {
								if(err) console.log(err);
								else    console.log(result);
								process.exit(0);
							});*/
							process.exit(0); 
					} else {					
						process.exit(0); 				
					}
			});
		});
	}
   );
});

//me/home?filter=others

function fbdbprocess(datalist , callback) {
	var coll = datalist.slice(0); // clone collection
	(function addOne() {
		var record = coll.splice(0, 1)[0]; // get the first record of coll and reduce coll by one
		try {
		 // console.log(record.id);
		  db.sadd('save' +  book + "key",record.id, function(err,dbresult) {
			if (err) { callback(err); return }
			if (coll.length == 0) {
			  callback();
			} else {
				if (dbresult > 0) {	
					//gcmstring = "";
					fbtext = "";
					//gcmindex += 1;
					gcmstring = gcmstring +  record.from.name;
					  
					//if (typeof res.data[i].actions == "undefined")
					//	continue;
				
					if (typeof record.description != "undefined") {
						fbtext = fbtext + " " + record.description;
						
						gcmstring = gcmstring + " , " +  record.description ;
					}
					  
					

					if (typeof record.message != "undefined") {
						fbtext = fbtext +  record.message;
						gcmstring = gcmstring + " , " + record.message ;
					}
					
					if (typeof record.story != "undefined"){			
					  fbtext = fbtext +  record.story;
					  gcmstring = gcmstring + " , " + record.story;
					}	
					
					if (typeof record.name != "undefined") {
						fbtext = fbtext + " " + record.name;
						gcmstring = gcmstring + " , " + record.name ;
					}
					
					
					
					fbtext = fbtext + "(" + record.from.name + ")";
					
					gcmstring = gcmstring + "\n\n";
					
					//http://graph.facebook.com/550529951716677/picture?type=normal
					/*if (typeof res.data[i].picture != "undefined") {
						fbtext = fbtext + "<br><img src='" + res.data[i].picture + "'/>";
					}*/
					
					if (typeof record.object_id != "undefined") {
						fbtext = fbtext + "<br><img src='http://graph.facebook.com/" + record.object_id + "/picture?type=normal'/>";
					}
					
					if (typeof record.actions != "undefined") {
						fbtext = fbtext + "<a href='" + record.actions[0].link + "' target='new'>Link</a>"						
					}

					if (typeof record.link != "undefined") {
						fbtext = fbtext + " <a href='" + record.link + "' target='new'>Link</a>"						
					}			
					 
					var now = new Date();
					var nowstr = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();
					fbtext = fbtext + " " + nowstr;
					
					fbtext = "<span>" + fbtext + "</span>";
					console.log(record.id + ":" + record.story);
					db.rpush("data" + book  ,fbtext ,function(err,dbdata){});
					//db.rpush("datakenny"  ,fbtext ,function(err,dbdata){});
					newcount ++;
					
				} else {
					console.log('exist:' + record.id);
				}
				addOne();
			}
		  });
		} catch (exception) {
		  callback(exception);
		}
	})();
}

function getdata2(filter,query,callback) {			
			//console.log(dbdata);
			//if (dbdata == undefined )
			//	dbdata = 0;			
			var parm ;
			if (filter != "")
				parm = {fields: ['id','created_time','from','message','story','name','actions','link','object_id','description'] ,filter : filter}
			else
				parm = {fields: ['id','created_time','from','message','story','name','actions','link','object_id','description'] };
			
			//FB.api("/v2.2/me/home", parm, function (res) {			
			FB.api("/v2.2/" + query, parm, function (res) {
				if(!res || res.error) {
				   console.log(!res ? 'error occurred' : res.error);
				   return;
				}
			  
			 // var data = JSON.parse(res);
				console.log(res.data.length);
				db.exists("save" + book ,function(err,dbdata) {					
					if (dbdata == 0) {
						db.hset("save" + book  ,"page",0);
						db.hset("save" + book  ,"pos",0);
					}	
					fbdbprocess(res.data,function () {callback();});
				});
				
				 
			});				
		
}


//setTimeout(function(){process.exit(0); },1000 * 60 * 3);