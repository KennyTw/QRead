var http = require('http'),   
	express = require('express'),
	redis = require('redis'),
	db = redis.createClient(),
	socket = require('socket.io');
	
	var template = require('fs').readFileSync('./views/item.ejs', 'utf-8');

	var app = express()	 
	  , server = http.createServer(app);
	var io = socket.listen(server);
	var currentpage = 0;
	  

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
	
	io.on('connection', function(socket) {
		var conn = socket.request.connection.remoteAddress ;
		console.log(conn + ' -- connects to socket.io');
		var rtn = {command:'forcereload',page:currentpage};
		console.log(rtn);
		//io.sockets.emit('events', rtn);
		socket.broadcast.emit('events', rtn);
							 
		socket.on('commands', function(data) {
			console.log('On commands:' + JSON.stringify( data));
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
				
			}		
		});	
		
		socket.on('disconnect', function() {
			console.log('Got disconnect!');			
		});
	});

	
		
server.listen(80); //the port you want to use