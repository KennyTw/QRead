var http = require('http'),   
	express = require('express'),
	redis = require('redis'),
	db = redis.createClient(),
	evt = redis.createClient(),
	socket = require('socket.io');	
	var soap = require('soap');
	//var gcm = require('node-gcm');
	
	
	var template = require('fs').readFileSync('./views/item.ejs', 'utf-8');

	var app = express()	 
	  , server = http.createServer(app);
	var io = socket.listen(server);
	var currentpage = -1;
	var currentbook = "";
	var step = 1;
	  

	app.set('view engine', 'ejs');
    app.use(
        "/", //the URL throught which you want to access to you static content
        express.static(__dirname) //where your static content is located in your filesystem
    );
	
	app.get('/all', function(req, res) {
		var qobj = req.query;
		var mode = qobj.m;
		var a = qobj.a;
		var z = qobj.z;
		if (qobj.s)
			step = parseInt(qobj.s)
		else
			step = 1;
		
		res.render('all', {  mode : mode , autolink : a , step : step , fontsize : z});									
	});
	
	app.get('/list', function(req, res) {
		var qobj = req.query;
		var mode = qobj.m;
		var a = qobj.a;
		var z = qobj.z;
		var book = qobj.b;
		
		if (qobj.s)
			step = parseInt(qobj.s)
		else
			step = 40;
		
		res.render('list', {  mode : mode , autolink : a , step : step , fontsize : z, book:book});									
	});
	
	
	app.get('/', function(req, res) {		
		var qobj = req.query;
		var book = qobj.b;
		var font = qobj.f;
		var mode = qobj.m;
		var a = qobj.a;
		var z = qobj.z;
		var pageurl = qobj.i;
		
		if (qobj.s)
			step = parseInt(qobj.s)
		else
			step = 1;
		
		var page = 0 ;
		var pos = 0 ;
		
		if (!book)
			book = "";	
		
		db.exists("save" + book ,function(err,dbdata) {					
			if (dbdata == 0) {
				db.hset("save" + book  ,"page",0);
				db.hset("save" + book  ,"pos",0);
			}}
		);	
		
		if (pageurl)  { //no js render				
			db.llen("data" + book, function(err,total) {
				if (parseInt(pageurl) <= total) {
					db.hget("save" + book,"page",function(err,dbpage) {
					if(!dbpage) {
							res.send('No Data');
							return;
					}
					
					if (parseInt(pageurl)  <  dbpage) 
						pageurl = dbpage;
						
						db.lrange("data" + book ,pageurl,pageurl+1,function(err,data){
								 //console.log(data);								 
								 res.render('index', { data: data ,pos : 0 ,page:pageurl ,total : total ,firstpage: pageurl ,template:template , book : book , font : font , mode : mode , autostatus : 'auto off' , autolink : a , fontsize : z});
								 
								 db.hset("save" + book ,"page",pageurl);
								 var rtn = {command:'newdata',book:'apple'};
								 db.publish("events",JSON.stringify(rtn));	
						});
					});	
					
				} else {					
					res.send('No Data');
					return;
				}				
			});
				
		} else {		
			db.hget("save" + book,"page",function(err,data) {
				if(!data) {
					res.send('No Data');
					return;
				}
				
				page = data;				
				db.hget("save" + book,"pos",function(err,data) {
					pos = data;	
					
					db.llen("data" + book, function(err,total) {
						db.lrange("data" + book ,page,parseInt(page)+(step-1) ,function(err,data){
								// console.log(data);
								 var datamerge = "" ;
								 for (var i = 0 ; i < data.length ; i ++) {									 
									 datamerge += data[i] + "<br><br>";
								 }						 
								 
								var dataarr = [];
								if (data.length > 0) {								 
								 dataarr.push(datamerge);
								} else {
									dataarr = data;
								}
								 
								 currentpage = page;
								 currentbook = book;
								 res.render('index', { data: dataarr ,pos : pos ,page:page ,total : total ,firstpage: page ,template:template , book : book , font : font , mode : mode , autostatus : 'auto off' , autolink : a , step : step , fontsize : z});									
						}); 							
					});						
				});
			});
		}
	});
	
	app.get('/manage', function(req, res) {			
		var qobj = req.query;
		var page = qobj.i;
		var book = qobj.b;
		
		if (!book)
			book = "";
		
		if (!page)
			page = 0;
		db.lrange("data" + book ,page,page ,function(err,data){
			currentpage = -1;
			res.render('manage', { data:data[0] ,page : page , book : book});													
		});	 
	});
	
	io.on('connection', function(socket) {
		var conn = socket.request.connection.remoteAddress ;
		console.log(conn + ' -- connects to socket.io');
		
		/*if (currentpage > -1) {
			var rtn = {command:'forcereload',page:currentpage , book : currentbook};
			console.log(rtn);
			//io.sockets.emit('events', rtn);
			socket.broadcast.emit('events', rtn);
		}*/
		
		
							 
		socket.on('commands', function(data) {
			console.log('On commands:' + JSON.stringify( data) + "," + conn);
			
			var book = data.book;
				if (!book)
					book = ""; 
				
			if (data.page) {				
				if (data.page < 0)
					return;
			}
				
			if (data.command == 'tts') {
				soap.createClient('http://tts.itri.org.tw/TTSService/Soap_1_3.php?wsdl', function(err, client) {
				   client.ConvertSimple({Account: 'KennyLee' , Password : 'kenny1222',TTSText : data.text}, function(err, result) {
						var resultData = result.Result.$value;
						resultData = resultData.split('&');
						
						if (resultData[0] == 0) {
							var audioId = resultData[2];
							console.log('audioId:' +  audioId); 
							var limit = 0;
							var selfInterval = setInterval(function(){ 
								if (limit > 60)
									clearInterval(selfInterval);
								
								client.GetConvertStatus({Account: 'KennyLee' , Password : 'kenny1222',ConvertID : audioId}, function(err, result) {
								//console.log(result);
								var resultData = result.Result.$value;
								console.log(result);
								resultData = resultData.split('&');
								if (resultData[0] == 0 && resultData[2] == 2 ) {
										clearInterval(selfInterval);
										console.log(resultData[4]);
										delete data.text;
										data.url = resultData[4];
										socket.emit('events', data);										
									};									
								});	

								limit ++;
							}, 1000);
						}  
					});
				});				
			} else
			if (data.command == 'ping') {
				 socket.emit('events', data);				
			} else	if (data.command == 'scrollend') {
				db.llen("data" + book , function (err , dbdata) {
					if (data.page > dbdata - 1) 
						return;
					data.total = dbdata;
					
					//db.hset("save" + book ,"page",data.page);
					db.hset("save" + book,"pos",data.pos);
					//io.sockets.emit('events', data);
					socket.broadcast.emit('events', data);
				});		
				
			} else if (data.command == 'click') {
				db.llen("data" + book , function (err , dbdata) {
					var total = dbdata;
					db.hget("save" + book ,"page",function(err,dbdata) {
						//var currentpage = dbdata;	
						console.log("step : " + data.step);	
						if (data.page > total - 1 || Math.abs(data.page - dbdata) > parseInt(data.step)  ) {
							console.log("data.page : " + data.page  + ", dbdata : " + dbdata);
							var rtn = {command:'reload',book:book,id:data.id};
							io.sockets.emit('events', rtn);	
							return;
						}
						
						//read behaviour stat
						if (data.page > dbdata) {							 
							db.rpush("behaviour"  ,JSON.stringify({count:data.page-dbdata,time:Date.now()}) ,function(err,dbdata){});
						}
						
						data.total = total;
						db.hset("save" + book ,"page",data.page);
						//io.sockets.emit('events', data);				
						socket.broadcast.emit('events', data);

						
						
					});				
				});
			} else if (data.command == 'reload') {
				var page = 0 ;
				var pos = 0 ;
				
				db.hget("save" + book ,"page",function(err,dbdata) {
					page = dbdata;	
					db.hget("save" + book ,"pos",function(err,dbdata) {
						pos = dbdata;
						var rtn = {command:'reload',page:page,pos:pos,book:book,id:data.id};
						io.sockets.emit('events', rtn);								
						//socket.broadcast.emit('events', rtn);
					});
				});					
			}  else if (data.command == 'loaddata') {
				//var page = parseInt(data.page) + 1;
				var page = parseInt(data.page) ;
				
				db.llen("data" + book, function(err,total) {
					db.lrange("data" + book , page, page + (parseInt(data.step) -1),function(err,dbdata){							 
								 //res.render('index', { data: data ,pos : pos ,page:page })
								 
								  var datamerge = "" ;
								 for (var i = 0 ; i < dbdata.length ; i ++) {									 
									 datamerge += dbdata[i] + "<br><br>";
								 }						 
								 				 
								 var dataarr = [];
								if (dbdata.length > 0) {
									dataarr.push(datamerge);
								} else {
									dataarr = 	dbdata;								
								}
								 
								 var rtn = {command:'data',dbdata:dataarr,page: page,total : total,book:book,id:data.id,memo:data.memo,step:data.step,id:data.id};
								 //console.log(dbdata);
								 //io.sockets.emit('events', rtn);	
								 socket.emit('events', rtn);
							}); 
				});			
				
			}	else if (data.command == 'update') {
				
				var page =  parseInt(data.page);

				db.llen("data" + book ,function(err,dbdata) {
					if (!dbdata) {
						db.hmset("save" + book , "pos" , 0 , "page",0);
					}
					
					if (page > dbdata - 1) {
						//insert
						db.rpush("data" + book ,data.content,function(err,dbdata){
							var rtn = {command:'updateok',page:dbdata,book:book,id:data.id};
							socket.emit('events', rtn);							
						});					
					} else {
						db.lset("data" + book ,parseInt(data.page) ,data.content,function(err){					
							var rtn = {command:'updateok',book:book,id:data.id};
							socket.emit('events', rtn);
							
							var rtn = {command:'forcereload',page:currentpage,book:book,id:data.id};
							console.log(rtn);					
							socket.broadcast.emit('events', rtn);
						});						
					}					
				});			
			} else if (data.command == 'append') {
				db.llen("data" + book ,function(err,dbdata) {
					if (!dbdata) {
						dbdata = 0;
						db.hmset("save" + book , "pos" , 0 , "page",0);
					}					
					
					//insert
					db.rpush("data" + book ,data.content,function(err,dbdata){
					var rtn = {command:'appendok',page:dbdata,book:book,id:data.id};
							socket.emit('events', rtn);							
					});						
					
					db.hget("save" + book,"page",function(err,pagedata) {
						if(!pagedata) {
							//res.send('No Data');
							return;
						}
						
						db.lrange("data" + book , pagedata, pagedata ,function(err,dbdatasync){
							var total = parseInt(dbdata) + 1;
							var dataarr = [];
							dataarr.push(dbdatasync);
							var rtn = {command:'sync',dbdata:dataarr,page:pagedata,pos:0,total:total,book:book,id:data.id};
							io.sockets.emit('events', rtn);		
						});									
					});				
				});			
			}
			else if (data.command == 'sync') {
					db.hget("save" + book,"page",function(err,pagedata) {
					if(!pagedata) {
						//res.send('No Data');
						return;
					}
					
					page = pagedata;					
					db.llen("data" + book ,function(err,dbdata) {
						var total = dbdata;						
						db.lrange("data" + book , page, page,function(err,dbdata){
							var rtn = {command:'sync',dbdata:dbdata,page:page,pos:0,total:total,book:book,id:data.id};
							//console.log(rtn);
							socket.emit('events', rtn)							
						});							
					}); 
					});
			} else if (data.command == 'checksync') {
				db.hget("save" + book,"page",function(err,dbdata) {
				if(!dbdata) {
						//res.send('No Data');
						return;
				}
				
					page = dbdata;
					db.llen("data" + book ,function(err,dbdata) {
							var total = dbdata;						
							var rtn = {command:'checksync',page:page,total:total,book:book,id:data.id};
							socket.emit('events', rtn);
					}); 				
				});
			}
		});	
		
		socket.on('disconnect', function() {
			console.log('Got disconnect!');			
		});
	});

	// listen to events from redis and call each callback from subscribers
	evt.on('message', function(channel, message) {
		console.log("message : " + message);
		message = JSON.parse(message);
		if (message.command == "newdata") {			
			db.hget("save" + message.book,"page",function(err,data) {
					if(!data) {
						//res.send('No Data');
						return;
					}
					
					var page = data;					
					db.llen("data" + message.book ,function(err,dbdata) {
						var total = dbdata;						
						db.lrange("data" + message.book , page, page,function(err,dbdata){
							var rtn = {command:'sync',dbdata:dbdata,page:page,pos:0,total:total,book:message.book,id:0};
							io.sockets.emit('events', rtn)							
						});							
					}); 
			});	

			/*db.hget("savekenny","page",function(err,data) {
					if(!data) {
						//res.send('No Data');
						return;
					}
					
					var page = data;					
					db.llen("datakenny" ,function(err,dbdata) {
						var total = dbdata;						
						db.lrange("datakenny"  , page, page,function(err,dbdata){
							var rtn = {command:'sync',dbdata:dbdata,page:page,pos:0,total:total,book:"kenny",id:0};
							io.sockets.emit('events', rtn)							
						});							
					}); 
			});	*/	
		}		
	});

	// subscribe to __events channel__
	evt.subscribe('events');
	
		
server.listen(80); //the port you want to use