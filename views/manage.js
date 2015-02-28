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
			document.querySelector('#status').value = "";
			var data = {command:'update',content : content ,page : page};		
			socket.emit('commands',  data);		
	});