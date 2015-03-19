	var currDomain = window.location.host;
	var socket = io.connect(currDomain,{'forceNew':true });
	
	socket.on('events', function(evt) {	
		console.log('events : ' + JSON.stringify(evt));
		//debug.innerText = JSON.stringify(evt);		
		if (evt.command == 'updateok') {
			var page = evt.page;
			var text = "";
			if (page)
				text = "insert new " + page
			document.querySelector('#status').value = "OK " + text;
		}
	});
	
	var button = document.querySelector('#paper-button');
	button.addEventListener('click', function(e) {
			var content = document.querySelector('#content').value;
			var page = document.querySelector('#page').value;
			var book = document.querySelector('#book').value;
			
			document.querySelector('#status').value = "";
			var data = {command:'update',content : content ,page : page , book: book};		
			socket.emit('commands',  data);		
	});
	
	var buttonnext = document.querySelector('#paper-button-next');
	buttonnext.addEventListener('click', function(e) {
		var page = parseInt(document.querySelector('#page').value);
		var book = document.querySelector('#book').value;
		
		page = page + 1;
		var url = location.protocol + '//' + location.host + location.pathname + "?i=" + page + "&b=" + book;
		location.href = url;
			
	});
	
	var buttonprev  = document.querySelector('#paper-button-prev');
	buttonprev.addEventListener('click', function(e) {
		var page = parseInt(document.querySelector('#page').value);
		var book = document.querySelector('#book').value;
		
		page = page - 1;
		var url = location.protocol + '//' + location.host + location.pathname + "?i=" + page + "&b=" + book;
		location.href = url;
			
	});
	
	var buttonextract  = document.querySelector('#paper-button-extract');
	buttonextract.addEventListener('click', function(e) {
		var content = document.querySelector('#extract').value;
		var linebreak = content.split("\n");
		//console.log("linebreak:" + linebreak.length);
		
		for (var i = 0 ; i < linebreak.length ; i ++) {
			console.log("linebreak:" + i + ":" + linebreak[i]);
		}
			
	});