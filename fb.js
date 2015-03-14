var FB = require('fb');
var	redis = require('redis');
var db = redis.createClient();
var fs = require('fs');
var newcount = 0;

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


fs.readFile('fbtoken', 'utf8', function (err,token) {
  if (err) {
	return console.log(err);
  }
  console.log("token:" + token);
  
  FB.api('oauth/access_token', {
	client_id: '470891803068657',
	client_secret: '0fe2fe8f854e3d7628337de1b711a989',
	grant_type: 'fb_exchange_token',
	fb_exchange_token: token
	}, function (res) {
		if(!res || res.error) {
			console.log(!res ? 'error occurred' : res.error);
			return;
		}

		var accessToken = res.access_token;
		fs.writeFile("fbtoken", accessToken, function(err) {}); 
		FB.setAccessToken(accessToken);
		var expires = res.expires ? res.expires : 0;
		//getdata();process.exit(0); 
		//setTimeout(function(){getdata("owner"); },1000 * 60 * 1);
		getdata2("","me/home",function(){
			getdata2("owner","me/home",function(){
					console.log('done : ' + newcount);
					if (newcount > 0) {
							var rtn = {command:'newdata',book:'fb'};
							db.publish("events",JSON.stringify(rtn));					
					}
					process.exit(0); 				
			});
		});
	}
   );
});

//me/home?filter=others
function getdata(filter) {		  
		db.hget("savefb" ,"lastid",function(err,dbdata) {
			//console.log(dbdata);
			//if (dbdata == undefined )
			//	dbdata = 0;			
			var parm ;
			if (filter == "owner")
				parm = {fields: ['created_time','from','message','story','name','actions','link','object_id','description'] ,filter : 'owner'}
			else
				parm = {fields: ['created_time','from','message','story','name','actions','link','object_id','description'] };
			
			FB.api("/v2.2/me/home", parm, function (res) {
				if(!res || res.error) {
				   console.log(!res ? 'error occurred' : res.error);
				   return;
				}
			  
			 // var data = JSON.parse(res);
			console.log(res.data.length);
				for (var i = res.data.length -1  ; i >= 0  ; i-- ) {
					fbtext = res.data[i].from.name;
					  
					//if (typeof res.data[i].actions == "undefined")
					//	continue;
					  
					if (typeof res.data[i].story != "undefined"){
					  fbtext = fbtext + " : ";				  
					  fbtext = fbtext + res.data[i].story;
					}
					  
					if (typeof res.data[i].message != "undefined")
						fbtext = fbtext + " : " + res.data[i].message;
					
					if (typeof res.data[i].name != "undefined")
						fbtext = fbtext + " " + res.data[i].name;
					
					if (typeof res.data[i].description != "undefined")
						fbtext = fbtext + " " + res.data[i].description;
					
					
					//http://graph.facebook.com/550529951716677/picture?type=normal
					/*if (typeof res.data[i].picture != "undefined") {
						fbtext = fbtext + "<br><img src='" + res.data[i].picture + "'/>";
					}*/
					
					if (typeof res.data[i].object_id != "undefined") {
						fbtext = fbtext + "<br><img src='http://graph.facebook.com/" + res.data[i].object_id + "/picture?type=normal'/>";
					}
					
					if (typeof res.data[i].actions != "undefined") {
						fbtext = fbtext + "<a href='" + res.data[i].actions[0].link + "' target='new'>Link</a>"						
					}

					if (typeof res.data[i].link != "undefined") {
						fbtext = fbtext + " <a href='" + res.data[i].link + "' target='new'>Link</a>"						
					}			
					 
					var d = new Date(res.data[i].created_time);  
					var msgid = d.valueOf();
					console.log(msgid + ":" + res.data[i].story);
					   
						if (dbdata == undefined ){					
							db.hset("savefb"  ,"page",0);
							db.hset("savefb"  ,"pos",0);
							db.hset("savefb"  ,"lastid",msgid);
							
							db.hset("savefb"  ,"lastid",msgid);					
							db.rpush("datafb"  ,fbtext ,function(err,dbdata){});
						}  else					
						if ((msgid) > parseInt(dbdata)) {
							dbdata = msgid;
							db.hset("savefb"  ,"lastid",msgid);					
							db.rpush("datafb"  ,fbtext,function(err,dbdata){});				  
						}						
				} 
					
			});				
		});	
}

function fbdbprocess(datalist , callback) {
	var coll = datalist.slice(0); // clone collection
	(function addOne() {
		var record = coll.splice(0, 1)[0]; // get the first record of coll and reduce coll by one
		try {
		 // console.log(record.id);
		  db.sadd('savefbkey',record.id, function(err,dbresult) {
			if (err) { callback(err); return }
			if (coll.length == 0) {
			  callback();
			} else {
				if (dbresult > 0) {	
					
					fbtext = record.from.name;
					  
					//if (typeof res.data[i].actions == "undefined")
					//	continue;
					  
					if (typeof record.story != "undefined"){
					  fbtext = fbtext + " : ";				  
					  fbtext = fbtext + record.story;
					}
					  
					if (typeof record.message != "undefined")
						fbtext = fbtext + " : " + record.message;
					
					if (typeof record.name != "undefined")
						fbtext = fbtext + " " + record.name;
					
					if (typeof record.description != "undefined")
						fbtext = fbtext + " " + record.description;
					
					
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
					 
					
					console.log(record.id + ":" + record.story);
					db.rpush("datafb"  ,fbtext ,function(err,dbdata){});
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
				db.exists("savefb" ,function(err,dbdata) {					
					if (dbdata == 0) {
						db.hset("savefb"  ,"page",0);
						db.hset("savefb"  ,"pos",0);
					}	
					fbdbprocess(res.data,function () {callback();});
				});
				
				 
			});				
		
}


//setTimeout(function(){process.exit(0); },1000 * 60 * 3);