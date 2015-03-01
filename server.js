var http = require('http'),   
	express = require('express'),
	redis = require('redis'),
	db = redis.createClient(),
	socket = require('socket.io');
	
	var template = require('fs').readFileSync('./views/item.ejs', 'utf-8');

	var app = express()	 
	  , server = http.createServer(app);
	var io = socket.listen(server);
	var currentpage = -1;
	  

	app.set('view engine', 'ejs');
    app.use(
        "/", //the URL throught which you want to access to you static content
        express.static(__dirname) //where your static content is located in your filesystem
    );
	
	
	app.get('/', function(req, res) {
		var page = 0 ;
		var pos = 0 ;
		
		db.hget("save","page",function(err,data) {
			page = data;

			db.hget("save","pos",function(err,data) {
				pos = data;	

				db.lrange("data",page,page,function(err,data){
							 //console.log(data);
							 currentpage = page;
							 res.render('index', { data: data ,pos : pos ,page:page ,firstpage: page ,template:template });									
						}); 				
			});
		});
	});
	
	app.get('/manage', function(req, res) {	
		var page = req.param('i');	
		if (!page)
			page = 0;
		db.lrange("data",page,page ,function(err,data){
			currentpage = -1;
			res.render('manage', { data:data[0] ,page : page});													
		});	 
	});
	
	io.on('connection', function(socket) {
		var conn = socket.request.connection.remoteAddress ;
		console.log(conn + ' -- connects to socket.io');
		
		if (currentpage > -1) {
			var rtn = {command:'forcereload',page:currentpage};
			console.log(rtn);
			//io.sockets.emit('events', rtn);
			socket.broadcast.emit('events', rtn);
		}
							 
		socket.on('commands', function(data) {
			console.log('On commands:' + JSON.stringify( data) + "," + conn);
			if (data.command == 'scrollend') {
				db.hset("save","page",data.page);
				db.hset("save","pos",data.pos);
				//io.sockets.emit('events', data);
				socket.broadcast.emit('events', data);
			} else if (data.command == 'click') {
				db.hset("save","page",data.page);
				//io.sockets.emit('events', data);				
				socket.broadcast.emit('events', data);
			} else if (data.command == 'reload') {
				var page = 0 ;
				var pos = 0 ;
				
				db.hget("save","page",function(err,dbdata) {
					page = dbdata;	
					db.hget("save","pos",function(err,dbdata) {
						pos = dbdata;
						var rtn = {command:'reload',page:page,pos:pos};
						//io.sockets.emit('events', rtn);								
						socket.broadcast.emit('events', rtn);
					});
				});					
			}  else if (data.command == 'loaddata') {
				var page = parseInt(data.page) + 1;
				db.lrange("data", page, page,function(err,dbdata){							 
							 //res.render('index', { data: data ,pos : pos ,page:page })
							 var rtn = {command:'data',dbdata:dbdata,page: page};
							 console.log(dbdata);
							 io.sockets.emit('events', rtn);	
						}); 		
				
			}	else if (data.command == 'update') {
				
				var page =  parseInt(data.page);

				db.llen("data",function(err,dbdata) {
					if (page > dbdata - 1) {
						//insert
						db.rpush("data",data.content,function(err,dbdata){
							var rtn = {command:'updateok',page:dbdata};
							socket.emit('events', rtn);							
						});
						
					} else {
						db.lset("data",parseInt(data.page) ,data.content,function(err){					
							var rtn = {command:'updateok'};
							socket.emit('events', rtn);
							
							var rtn = {command:'forcereload',page:currentpage};
							console.log(rtn);					
							socket.broadcast.emit('events', rtn);
						});						
					}					
				});			
			}
		});	
		
		socket.on('disconnect', function() {
			console.log('Got disconnect!');			
		});
	});

	
		
server.listen(80); //the port you want to use