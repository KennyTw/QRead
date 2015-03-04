 /*document.querySelector('#card').addEventListener('swipeable-card-swipe-away', function(e) {
      //e.target.parentNode.removeChild(e.target);
	    var pages = document.querySelector('core-pages');
		pages.selected = (pages.selected - 1) % pages.children.length;
 });*/
	
  /*document.querySelector('#card').addEventListener('click', function(e) {
    var pages = document.querySelector('core-pages');
    pages.selected = (pages.selected + 1) % pages.children.length;
  });*/
	var currDomain = window.location.host;
	var socket = io.connect(currDomain,{'forceNew':true });
	var book = document.querySelector('#book').value;	
	
	socket.on('events', function(evt) {	
		console.log('events : ' + JSON.stringify(evt));
		//debug.innerText = JSON.stringify(evt);
		var pages = document.querySelector('core-pages');
		var firstpage = parseInt(document.querySelector('#firstpage').value);
		
		if (book != evt.book) return;
		
		if (evt.command == 'click') {			 
			var newpage =  parseInt(evt.page) - firstpage;
			//if (newpage <  pages.children.length) {		
				pages.selected = newpage;
				
				if (Math.abs(parseInt(document.querySelector('#page').value) -  evt.page)  > 1  ) {				
					var data = {command:'reload',book:book};			
					socket.emit('commands',data );
				} else {
					document.querySelector('#page').value = evt.page;
				}
				//debug.innerText = "selected:" + newpage;				
			//}
			window.scrollTo(0, 0);
		} else if (evt.command == 'scrollend') {
			//window.scrollTo(0, evt.pos );
		} else if (evt.command == 'reload') {
			//if (parseInt(evt.page) != parseInt(pages.selected) - firstpage)
				location.reload(true);
		} else if (evt.command == 'forcereload') {
				if (parseInt(evt.page) != parseInt(document.querySelector('#page').value) || pages.children.length > 1)
					location.reload(true);
		} 
		else if (evt.command == 'data') {
			var content = document.getElementById('content').innerHTML;
			
			if (Math.abs(parseInt(document.querySelector('#page').value) -  evt.page)  > 1  ) {				
					var data = {command:'reload',book: book};			
					socket.emit('commands',data );
			} 
			
			if (evt.dbdata.length > 0) {			
				var html = ejs.render(content, { data: evt.dbdata , page: parseInt(evt.page) , i : 0 });
				var doc = document.implementation.createHTMLDocument('');
				range = doc.createRange();
				body = doc.body;
				body.innerHTML = html;
				range.selectNodeContents(body);
				var frag = range.extractContents();
				/*
				var range = document.createRange();
				var frag = range.createContextualFragment(html);*/
				
				if (parseInt(evt.page) < firstpage) {
					pages.firstChild.parentNode.insertBefore(frag, pages.firstChild);
					document.querySelector('#page').value = evt.page;
					document.querySelector('#firstpage').value = evt.page;
					
					window.scrollTo(0, 0);			
					var data = {command:'click',page : parseInt(evt.page),book:book};			 
					socket.emit('commands',  data);	
				}
				else {
					pages.lastChild.parentNode.insertBefore(frag, pages.lastChild);
					var active = document.querySelector('.core-selected .contain');
					active.click();
				}
				
				
			} else {
				debug.innerText = "End Of Content";
			}		
		}
	});
	
	/*socket.on('disconnect', function() {
		var debug = document.querySelector('#debug');
		var d = new Date();
		var n = d.toLocaleTimeString();
		debug.innerText = n + ":disconnect";
    });
	
	socket.on('connect', function() {
		var debug = document.querySelector('#debug');
		var d = new Date();
		var n = d.toLocaleTimeString();
		debug.innerText = n + ":connect";
    });*/
		
	function click(e) {
		var target = e.target; 
		var pages = document.querySelector('core-pages');
		var bchange = false;
		var page = parseInt(document.querySelector('#page').value);
		
		
		if  (target.className == "contain"){
			if (parseInt(pages.selected) + 1 >=  pages.children.length) {
				var data = {command:'loaddata',page: parseInt(page) + 1,book:book};			
				socket.emit('commands',data );
				
			} else {
				//pages.selected = (parseInt(pages.selected) + 1) % pages.children.length;
				pages.selected = (parseInt(pages.selected) + 1);
				page ++;
				bchange = true;
			}

			
		} else {
			
				//pages.selected = pages.children.length;
			if ((pages.selected - 1) >= 0) {
				//pages.selected = (parseInt(pages.selected) - 1) % pages.children.length;
				pages.selected = (parseInt(pages.selected) - 1)
				page --;
				bchange = true;
			} else {
				if (parseInt(page) -2 >= -1) {
					var data = {command:'loaddata',page: parseInt(page) -1 , book:book};			
					socket.emit('commands',data );
				} else {
					debug.innerText = "Begin Of Content";
				}
			}
	
		}
		
		if (bchange) {
			document.querySelector('#page').value = page;
			window.scrollTo(0, 0);
			//var pages = document.querySelector('core-pages');
			var data = {command:'click',page : parseInt(page),book:book};
			//socket.disconnect();
			//socket.connect();
			socket.emit('commands',  data);	
		}
	  }
	  
	document.addEventListener('click', function(e) {
		click(e);
	});
	
	window.addEventListener('load',function(e) {	
		var pos = document.querySelector('#pos');
		if (pos)
			window.scrollTo(0, pos.value  );		
	});
	
	var ismove = false;
	document.addEventListener('touchstart', function(e) {	
		 ismove = false;
	});
	
	
	document.addEventListener('touchmove', function(e) {	
		ismove = true;		
	});
	
	document.addEventListener('touchend', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var pages = document.querySelector('core-pages');
		var page = parseInt(document.querySelector('#page').value);
		
		if (ismove){	
			// window.pageYOffset  document.body.scrollHeight
			var data = {command:'scrollend',page :  page , pos : window.pageYOffset ,book:book};
			//socket.disconnect();
			//socket.connect();
			socket.emit('commands', data );
		}
		else {
			click(e);
			/*window.scrollTo(0, 0);
			var pages = document.querySelector('core-pages');
			var data = {command:'click',selected :  pages.selected};
			//socket.disconnect();
			//socket.connect();
			socket.emit('commands',data );*/
		}
	});
	
	/*window.addEventListener('focus', function(e) {		
		var debug = document.querySelector('#debug');		
		var d = new Date();
		var n = d.toLocaleTimeString();
		debug.innerText = n + ":focus";
		//debug.innerText = socket.connected;
	});
	
	window.addEventListener('blur', function(e) {		
		//var debug = document.querySelector('#debug');
		//debug.innerText = socket.connected;
		
		var debug = document.querySelector('#debug');		
		var d = new Date();
		var n = d.toLocaleTimeString();
		debug.innerText = n + ":blur";
	});*/
	
	document.addEventListener("visibilitychange", function() {
		var debug = document.querySelector('#debug');		
		var d = new Date();
		var n = d.toLocaleTimeString();
		debug.innerText = n + ":visibilityChange:" + document.visibilityState;
		
		
		if ( document.visibilityState == 'visible') {		
			socket.disconnect();
			socket.connect();
			
			var data = {command:'reload',book:book};			
			socket.emit('commands',data );
		}
		
	}, false);
	

  
	
  

  
 