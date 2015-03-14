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
	var currentbook = "";
	  

	app.set('view engine', 'ejs');
    app.use(
        "/", //the URL throught which you want to access to you static content
        express.static(__dirname) //where your static content is located in your filesystem
    );
	
	
	app.get('/', function(req, res) {		
		var qobj = req.query;
		var book = qobj.b;
		var font = qobj.f;
		var mode = qobj.m;
		var page = 0 ;
		var pos = 0 ;
		
		if (!book)
			book = "";
		
		db.hget("save" + book,"page",function(err,data) {
			if(!data) {
				res.send('No Data');
				return;
			}
			
			page = data;
			db.hget("save" + book,"pos",function(err,data) {
				pos = data;	
				
				db.llen("data" + book, function(err,total) {
					db.lrange("data" + book ,page,page,function(err,data){
							 //console.log(data);
							 currentpage = page;
							 currentbook = book;
							 res.render('index', { data: data ,pos : pos ,page:page ,total : total ,firstpage: page ,template:template , book : book , font : font , mode : mode , autostatus : 'auto off'});									
					}); 							
				});						
			});
		});
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
		
		if (currentpage > -1) {
			var rtn = {command:'forcereload',page:currentpage , book : currentbook};
			console.log(rtn);
			//io.sockets.emit('events', rtn);
			socket.broadcast.emit('events', rtn);
		}
							 
		socket.on('commands', function(data) {
			console.log('On commands:' + JSON.stringify( data) + "," + conn);
			
			var book = data.book;
				if (!book)
					book = ""; 
				
			if (data.page) {				
				if (data.page < 0)
					return;
			}
				
			if (data.command == 'scrollend') {
				db.llen("data" + book , function (err , dbdata) {
					if (data.page > dbdata - 1) 
						return;
					data.total = dbdata;
					
					db.hset("save" + book ,"page",data.page);
					db.hset("save" + book,"pos",data.pos);
					//io.sockets.emit('events', data);
					socket.broadcast.emit('events', data);
				});		
				
			} else if (data.command == 'click') {
				db.llen("data" + book , function (err , dbdata) {
					if (data.page > dbdata - 1) 
						return;
					data.total = dbdata;
					db.hset("save" + book ,"page",data.page);
					//io.sockets.emit('events', data);				
					socket.broadcast.emit('events', data);
				});
			} else if (data.command == 'reload') {
				var page = 0 ;
				var pos = 0 ;
				
				db.hget("save" + book ,"page",function(err,dbdata) {
					page = dbdata;	
					db.hget("save" + book ,"pos",function(err,dbdata) {
						pos = dbdata;
						var rtn = {command:'reload',page:page,pos:pos,book:book};
						io.sockets.emit('events', rtn);								
						//socket.broadcast.emit('events', rtn);
					});
				});					
			}  else if (data.command == 'loaddata') {
				//var page = parseInt(data.page) + 1;
				var page = parseInt(data.page) ;
				
				db.llen("data" + book, function(err,total) {
					db.lrange("data" + book , page, page,function(err,dbdata){							 
								 //res.render('index', { data: data ,pos : pos ,page:page })
								 var rtn = {command:'data',dbdata:dbdata,page: page,total : total,book:book};
								 console.log(dbdata);
								 io.sockets.emit('events', rtn);	
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
							var rtn = {command:'updateok',page:dbdata,book:book};
							socket.emit('events', rtn);							
						});					
					} else {
						db.lset("data" + book ,parseInt(data.page) ,data.content,function(err){					
							var rtn = {command:'updateok',book:book};
							socket.emit('events', rtn);
							
							var rtn = {command:'forcereload',page:currentpage,book:book};
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