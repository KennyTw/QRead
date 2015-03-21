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
	//var socket = io.connect(currDomain,{'forceNew':true });
	var socket = io.connect(currDomain,{'forceNew':true });
	var book = document.querySelector('#book').value;
	var countdownini = 5;
	var finalcountdown = countdownini ;
	var intervalobj;
	//var lastcommand = "";
	//var timerobj ;
	var sendqueue = [];
	var debug = document.querySelector('#debug');
	var autolinkwindow = null;
	
	/*var tts = new TTS(); 
	tts.PlayerSet.hidden = false;
    tts.PlayerSet.width = 100; 
    tts.PlayerSet.height = 30;*/
	
	socket.on('events', function(evt) {	
		console.log('events : ' + JSON.stringify(evt));
		document.querySelector('#lastcmd').value = evt.command;		
		//debug.innerText = JSON.stringify(evt);		
		var pages = document.querySelector('core-pages');
		var firstpage = parseInt(document.querySelector('#firstpage').value);
		var lastpage = parseInt(document.querySelector('#lastpage').value);
		//lastcommand = "";
		//clearTimeout(timerobj);
		if (book != evt.book) return;
		
		var sendobj = sendqueue[evt.id];
		if (sendobj != null) {
			clearTimeout(sendobj.timeobj);
			sendqueue[evt.id] = null;
		}
		
		debug.innerText = "";
		
		if (evt.command == 'click') {			 
			var newpage =  parseInt(evt.page) - firstpage;
			//if (newpage <  pages.children.length) {		
				
				
				if (Math.abs(parseInt(document.querySelector('#page').value) -  evt.page)  > 1  ) {				
					var data = {command:'reload',book:book};			
					//socket.emit('commands',data );
					send(data,true);
				} else if (evt.page > lastpage || evt.page <  firstpage)  {
					document.querySelector('#lock').value = 1;
					var data = {command:'loaddata',page: parseInt(evt.page) ,book:book , memo:'noclick'};			
					//socket.emit('commands',data );
					send(data,true);
					debug.innerText = "loading...";
				} else {	
					document.querySelector('#page').value = evt.page;
					pages.selected = newpage;
					window.scrollTo(0, 0);
				}
				//debug.innerText = "selected:" + newpage;				
			//}
			
		} else if (evt.command == 'scrollend') {
			window.scrollTo(0, evt.pos );
		} else if (evt.command == 'reload') {
			//if (parseInt(evt.page) != parseInt(pages.selected) - firstpage)				
				location.reload(true);
		} else if (evt.command == 'forcereload') {
				if (parseInt(evt.page) != parseInt(document.querySelector('#page').value) || pages.children.length > 1)
					location.reload(true);
		} 
		else if (evt.command == 'data') {
			var content = document.getElementById('content').innerHTML;			
			debug.innerText = "";
			document.querySelector('#lock').value = 0;
			
			if (Math.abs(parseInt(document.querySelector('#page').value) -  evt.page)  > 1  ) {				
					var data = {command:'reload',book: book};			
					//socket.emit('commands',data );
					send(data,true);
			} 
			
			if (evt.dbdata.length > 0) {			
				var html = ejs.render(content, { data: evt.dbdata , total:evt.total , page: parseInt(evt.page) , i : 0 });
				var doc = document.implementation.createHTMLDocument('');
				var range = doc.createRange();
				var body = doc.body;
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
					if (evt.memo != 'noclick') {
						var data = {command:'click',page : parseInt(evt.page),book:book};			 
						//socket.emit('commands',  data);	
						send(data,false);
					}
				}
				else {
					pages.lastChild.parentNode.insertBefore(frag, pages.lastChild);
					document.querySelector('#lastpage').value = evt.page;					
					var active = document.querySelector('.core-selected .contain');
					
					if (evt.memo == 'noclick') {
						active.setAttribute('noclick','');
					}					
					active.click();					
				}
				
				/*var textcontain = document.querySelector('#' + "contain" + evt.page);
				textcontain = textcontain.innerHTML.replace(/<(?:.|\n)*?>/gm, '');				
				tts.ConvertInit(textcontain,"media" + evt.page ,"Bruce","100","0","0","0","5");*/
				
				
			} else {
				clearInterval(intervalobj);
				intervalobj = undefined;
				debug.innerText = "End Of Content";
				document.querySelector('#autotts').value = 0;
			}		
		} else if (evt.command == 'sync') {
			var content = document.getElementById('content').innerHTML;
			//var debug = document.querySelector('#debug');
			debug.innerText = "";
			
			if (evt.dbdata.length > 0) {

				var oldlastpage = parseInt(document.querySelector('#lastpage').value);
				
				for (var i = pages.childNodes.length - 1 ; i >= 0 ; i --) {
					if (pages.childNodes[i].nodeName == "DIV")
						pages.removeChild(pages.childNodes[i]);
				}		

				var html = ejs.render(content, { data: evt.dbdata , total:evt.total , page: parseInt(evt.page) , i : 0 });
				
				var doc = document.implementation.createHTMLDocument('');
				var range = doc.createRange();
				var body = doc.body;
				body.innerHTML = html;
				range.selectNodeContents(body);
				var frag = range.extractContents();
				
				pages.lastChild.parentNode.insertBefore(frag, pages.lastChild);
				
				//pages.firstChild.parentNode.innerHTML = html;
				
				//var contentitem = document.querySelector('.contentitem');
				//contentitem.click();
				//contentitem.classList.add('core-selected');
				//contentitem.setAttribute('active', '');			
				
				document.querySelector('#page').value = evt.page;
				document.querySelector('#firstpage').value = evt.page;
				document.querySelector('#lastpage').value = evt.page;
				document.querySelector('#pos').value = evt.pos;	

				pages.selected = 0;
				
				if (evt.total > oldlastpage) {
					debug.innerText = "new data : " + (evt.total - oldlastpage - 1);
					var oldtitle = window.parent.document.title;
					if (window.parent.location.pathname == "/all") 
						oldtitle = "QRead All";					
					var pos1 = oldtitle.indexOf(') ');
					if (pos1 > 0) {
						oldtitle = oldtitle.substring(pos1 + 2,oldtitle.length);
					} 					
					window.parent.document.title = "(" + (evt.total - oldlastpage - 1) + ") " + oldtitle;					
				}
				
				if (document.querySelector('#autotts').value == 1)
					document.querySelector('#ttsplay').click();
					
				
				
			}
			
		} else if (evt.command == 'ping') {
			 
		} else if (evt.command == 'checksync') {
			if (parseInt(document.querySelector('#page').value) != evt.page) {
				location.reload(true);
			}
		} else if (evt.command == 'tts') {
			
			if (document.querySelector('#ttscontrol' + evt.page) == undefined) {			
				var doc = document.implementation.createHTMLDocument('');
				var range = doc.createRange();
				var body = doc.body;					
				var html = "<audio id='ttscontrol" + evt.page  + "' controls='controls' preload='auto' autoplay>";
				html += "<source src='"  + evt.url + "' type='audio/wav'>Your browser does not support the audio element.</audio>";			
				body.innerHTML = html;
				range.selectNodeContents(body);
				var frag = range.extractContents();			
				var ttscontrol = document.querySelector('#ttscontroldiv' + evt.page);							
				ttscontrol.appendChild(frag.cloneNode(true));
				
				/*var playcontrol = document.querySelector('#ttscontrol' + evt.page);
				
				playcontrol.load();
				playcontrol.addEventListener('canplaythrough', function() {				   
				   //playcontrol.play();
				   setTimeout(function(){
						playcontrol.play();
					}, 2000);
				});*/

				if (document.querySelector('#autotts').value == 1) {
					var audiocontrol = document.querySelector('#ttscontrol' + evt.page );
					audiocontrol.addEventListener('ended', function(){
						var active = document.querySelector('.core-selected .contain');								
						active.click();
					});				
				}
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
	
	function clickprocess(e) {
		var target =  e.target;
		finalcountdown = countdownini;
		if (target.id == "auto") {
			if (intervalobj != undefined) {
				clearInterval(intervalobj);
				intervalobj = undefined;
				finalcountdown = countdownini ;
				target.innerText = "auto off";				
			} else {				
				intervalobj = setInterval(function() {
					var auto = document.querySelector('#auto');
					if (finalcountdown == 0) {
						finalcountdown = countdownini;						
						var active = document.querySelector('.core-selected .contain');
						active.click();
					} else {
						finalcountdown --;
						auto.innerText = "auto on " + finalcountdown;										
					}
				}, 1000);
				target.innerText = "auto on  " + finalcountdown;								
			}
		} else if (	target.id == "ttsplay" || target.id == "autottsplay") {
			if ( target.id == "autottsplay")
				document.querySelector('#autotts').value = 1;
			
			var page =  document.querySelector('#page').value;
			var textcontain = document.querySelector('#' + "contain" + page);
			textcontain = textcontain.innerHTML.replace(/<a [^>]+>([^<]+)<\/a>/g,"");
			textcontain = textcontain.replace(/<(?:.|\n)*?>/gm, '');				
				
			var data = {command:'tts', text : textcontain ,page: page , book:book};	
			send(data,false);
			debug.innerText = "send tts ...";
			
		}
	} 
		
	function click(e) {
		var target = e.target;
		if (target.nodeName == "A") return;
		if (target.id == "auto") return;
		if (target.id == "ttsplay" || target.id == "autottsplay") return;
		if (target.id.indexOf("ttscontrol") >= 0 ) return;
		//if (target.id.indexOf("loading") >= 0 ) return;
		
		var pages = document.querySelector('core-pages');
		var bchange = false;
		var page = parseInt(document.querySelector('#page').value);		
		var debug = document.querySelector('#debug');
		var lastpage = parseInt(document.querySelector('#lastpage').value);
		var lock = parseInt(document.querySelector('#lock').value);
		
		if (lock == 1) return;
		
		if  (target.className == "contain" || target.nodeName == "IMG"){
			if (parseInt(page) + 1 >  lastpage) {
				document.querySelector('#lock').value = 1;
				var data = {command:'loaddata',page: parseInt(page) + 1,book:book};			
				//socket.emit('commands',data );
				send(data,true);
				debug.innerText = "loading...";
				
			} else {
				//pages.selected = (parseInt(pages.selected) + 1) % pages.children.length;
				pages.selected = (parseInt(pages.selected) + 1);
				page ++;
				bchange = true;	
				if (document.querySelector('#autotts').value == 1) {
					document.querySelector('#page').value = page;
					document.querySelector('#ttsplay').click();
				}	
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
					document.querySelector('#lock').value = 1;
					var data = {command:'loaddata',page: parseInt(page) -1 , book:book};			
					//socket.emit('commands',data );
					send(data,true);
					debug.innerText = "loading...";
				} else {
					debug.innerText = "Begin Of Content";
				}
			}
	
		}
		
		if (bchange) {
			document.querySelector('#page').value = page;
			window.scrollTo(0, 0);
			
			if (!target.hasAttribute('noclick')) {
				var data = {command:'click',page : parseInt(page),book:book};			 
				send(data,false);
			} else {
				target.removeAttribute('noclick');
			}
			debug.innerText = "";
			
					
		}
	  }
	  
	document.addEventListener('click', function(e) {
		if (window.getSelection().toString() != ""){
			e.stopPropagation();
			e.preventDefault();
			return;
		}
		clickprocess(e);
		click(e);
	});
	
	
	
	
	window.addEventListener('load',function(e) {	
		var pos = document.querySelector('#pos');
		if (pos)
			window.scrollTo(0, pos.value  );
		
		/*var page =  document.querySelector('#page').value;
		var textcontain = document.querySelector('#' + "contain" + page);
		textcontain = textcontain.innerHTML.replace(/<(?:.|\n)*?>/gm, '');				
		tts.ConvertInit(textcontain,"media" + page ,"Bruce","100","0","0","0","5");*/
	});
	
	var ismove = false;
	document.addEventListener('touchstart', function(e) {	
		 ismove = false;
	});
	
	
	document.addEventListener('touchmove', function(e) {	
		ismove = true;		
	});
	
	document.addEventListener('touchend', function(e) {
		//e.stopPropagation();
		//e.preventDefault();
		var pages = document.querySelector('core-pages');
		var page = parseInt(document.querySelector('#page').value);
		
		
		if (ismove){	
			// window.pageYOffset  document.body.scrollHeight
			var data = {command:'scrollend',page :  page , pos : window.pageYOffset ,book:book};
			//socket.disconnect();
			//socket.connect();
			//socket.emit('commands', data );
			send(data,false);
		}
		else {
			clickprocess(e);
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
	
	document.querySelector('core-pages').addEventListener('core-select', function (event) {
	  //parse content link
			if (document.querySelector('#autolink').value  && document.querySelector('#lastcmd').value != 'sync') {
				var active = document.querySelector('.core-selected .contain a');
				if (active) {								
					if (autolinkwindow) {
						autolinkwindow.location.href = active.href;
					} else {
						autolinkwindow = window.open(active.href, 'qread');						
					}
				}
			}		
	});

	document.addEventListener("visibilitychange", function() {
		var debug = document.querySelector('#debug');		
		var d = new Date();
		var n = d.toLocaleTimeString();
		//debug.innerText = n + ":visibilityChange:" + document.visibilityState;
	
		
		if ( document.visibilityState == 'visible') {	
			if (window.parent.location.pathname == "/all") {
				window.parent.document.title = "QRead All";
			} else
				window.parent.document.title = document.querySelector('#title').value;
		
			/*socket.disconnect();
			socket.connect();
			
			var data = {command:'sync',book:book};			
			socket.emit('commands',data );*/
			/*var isTouchDevice = function() {  return 'ontouchstart' in window || 'onmsgesturechange' in window; };			
			if (isTouchDevice())
				location.reload(true);*/
			
			 
			//var data = {command:'ping',book:book};
			var page = parseInt(document.querySelector('#page').value);
			var data = {command:'checksync',book:book,page:page};
			send(data,true);
			 
		}		
	}, false);
	
 function  resendcheck(timestamp) {
	if (sendqueue[timestamp] != null) {
					var debug = document.querySelector('#debug');
					debug.innerText = "resend..";
					socket.disconnect();
					socket.connect();
					
					socket.emit('commands',sendqueue[timestamp].data);					
	}	 
 }
 function send(data,traceback) {	
	var timestamp = Number(new Date());	
	data["id"] = timestamp;
	//console.log(data);
	socket.emit('commands',data);	
	
	//if (data.command == 'click' ||  data.command == 'scrollend') {
	if (!traceback){
		//click no return
		data["id"] = null;
	} else {
		timerobj = setTimeout("resendcheck(" + timestamp + ")",5000,timestamp);	
		sendqueue[timestamp] = {id:timestamp,timeobj:timerobj,data:data};
	}
 }
	
  

  
 