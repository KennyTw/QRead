﻿var book = document.getElementById('book').value;
var page;
var total;
var savetotal=0;
var savetotal2=0;
var step = parseInt(document.getElementById('step').value);
//step = 40;
var stepdesc = 0;
var laststep = step;
var sendqueue = [];
var lastid = 0;
var savepage = 0;

var socket = io.connect(window.location.origin,{'forceNew':true });
var QueueReadContent = document.getElementById('QueueReadContent');
var TranslateDiv = document.getElementById('TranslateDiv');
var LastDiv =  document.getElementById('LastDiv');

function send(data,traceback) {	
	var timestamp = Number(new Date());	
	data["id"] = timestamp;
	data["step"] = step ;
	console.log(data);
	socket.emit('commands',data);
	
	if (!traceback){
		//click no return
		data["id"] = null;
	} else {
		timerobj = setTimeout("resendcheck(" + timestamp + ")",5000,timestamp);	
		sendqueue[timestamp] = {id:timestamp,timeobj:timerobj,data:data};
	}
	
}

 function  resendcheck(timestamp) {
	if (sendqueue[timestamp] != null) {					
					socket.disconnect();
					socket.connect();
					
					socket.emit('commands',sendqueue[timestamp].data);					
	}	 
 }

socket.on('connect', function() {
			//alert('connect');
			if (!book)
				book='kenny';
			
			var data = {command:'sync',book:book};
			send(data,true);
		});

socket.on('disconnect', function() {
	//alert('disconnect');
	console.log('disconnect');
});

socket.on('events', function(evt) {	

	if (book != evt.book) return;
	
	var sendobj = sendqueue[evt.id];
	if (sendobj != null) {
			clearTimeout(sendobj.timeobj);
			sendqueue[evt.id] = null;
	}

	function go() {
		if (evt.book == "kennyq") return;	

		page = evt.page;
		//var totalchange = false
		//if (evt.total != total && total-page <=  step)	
		//	totalchange = true;		
		if (savetotal == 0)
			savetotal = evt.total;
		
		if (savetotal2 == 0)
			savetotal2 = evt.total;
		
		if (evt.total > savetotal) {
			var oldtitle = window.parent.document.title;
			var pos1 = oldtitle.indexOf(') ');
			if (pos1 > 0) {
				oldtitle = oldtitle.substring(pos1 + 2,oldtitle.length);
			} 					
			window.parent.document.title = "(" + (evt.total - savetotal) + ") " + oldtitle;	
			
			if (evt.total - parseInt(page) > step  &&  savepage == page) {
				var qcounter = document.getElementById('QreadCounter');
				qcounter.innerHTML = "[<a href='javascript:' id=QueueReadNext>" + (parseInt(page) + 1) + "/" + total + "</a>] [<a href='javascript:' id=QueueReadBack>" +  (parseInt(total) -  (parseInt(page) + 1))  + "</a>] "
				return;				
			}
		} 
		
		savepage = page;
		total = evt.total;
		book = evt.book;
		//var data = evt.dbdata[0].replace("<br><br>","");
		var data = evt.dbdata[0];
		data = data.replace(/\<br><br>/g,'');
		data = "<span id='QreadCounter'>[<a href='javascript:' id=QueueReadNext>" + (parseInt(page) + 1) + "/" + total + "</a>] [<a href='javascript:' id=QueueReadBack>" +  (parseInt(total) -  (parseInt(page) + 1))  + "</a>] </span>" + data;
		//var QueueReadContent = document.getElementById('QueueReadContent');
		if (evt.total <= savetotal2) 
			unfade(QueueReadContent);
		QueueReadContent.innerHTML = data;
		
		//QueueReadContent.insertAdjacentHTML( 'beforeend', data );
		var allimg = document.querySelectorAll('img');
		var loadcount = 0;
		for (var i = 0; i < allimg.length; i++) { 
			allimg[i].addEventListener("error", function() { loadcount++;}); 
			allimg[i].addEventListener("load", function() { loadcount++; 
			if (loadcount == allimg.length) {			
				stepdesc = 0;
				for (var i = 0 ; i < QueueReadContent.childNodes.length ; i ++) {
					var obj = QueueReadContent.childNodes[i];
					if (obj.tagName == "SPAN") {
						 var rect = obj.getBoundingClientRect();
						 //if (rect.left + (rect.width/3) >= window.screen.width * ratio) {
						if (rect.left + (rect.width) >= window.innerWidth || 
							rect.top + (rect.height) >= window.innerHeight) {
							obj.style.opacity = 0.3; 
							stepdesc ++;
						 }
					}
				}				
			} });
		}	
		
		var anchors = QueueReadContent.querySelectorAll('a');
		for (var i = 0 ; i < anchors.length ;  i++) { 
			if (i > 0) {anchors[i].setAttribute('target', 'qread');} 
			anchors[i].style.cssText='color:white;  text-decoration: underline;';
		}
		
		var images = QueueReadContent.querySelectorAll('img'); 
		for (var i = 0 ; i < images.length ;  i++) {
			images[i].style.width='100%';
			images[i].style.display =  'none';
			//images[i].style.maxHeight = 100;
			//images[i].parentNode.style.backgroundImage = " linear-gradient(rgba(0, 0, 0, 0.9),rgba(0, 0, 0, 0.1)),url('" + images[i].src  + "')";
			//images[i].parentNode.style.textShadow = "2px 2px 5px #000000";
			//images[i].parentNode.style.backgroundSize = "contain";
			//images[i].parentNode.style.minHeight = "100px";
			//images[i].parentNode.style.backgroundRepeat = "no-repeat";
			//images[i].parentNode.style.backgroundPosition = "center center";
			
			//images[i].parentNode.removeChild( images[i] );
			//images[i].style.position = 'absolute';
			//images[i].style.left = 0;
			
			//images[i].style.maxHeight = window.innerHeight * 0.7;
			//if (i == images.length -1 && document.body.style.backgroundImage == "") {
			if (i == 0 && document.body.style.backgroundImage == "") {
				document.body.style.backgroundImage = " url('" + images[i].src + "')";
				document.body.style.backgroundRepeat = "no-repeat";
				document.body.style.backgroundPosition = "top center";
				document.body.style.backgroundSize = "contain";
			}
		}
		
		
		var spans = QueueReadContent.querySelectorAll('span'); 
		for (var i = 1 ; i < spans.length ;  i++) {
			spans[i].setAttribute("data-id", i);			
			spans[i].addEventListener('click', function(e) {
				if (e.target.nodeName != "A") {
					var id = e.target.getAttribute("data-id");
					if (!id)
						id = e.target.parentNode.getAttribute("data-id");
					
					//lastid = id;
					stepdesc = step - parseInt(id);
					next();
				}				
			});
			
			
			/*spans[i].addEventListener('mouseover', function(e) {
				if (e.target.nodeName != "A") {
					document.body.style.backgroundImage = "";
					var id = e.target.getAttribute("data-id");
					var tag = e.target;
					if (!id) {
						id = e.target.parentNode.getAttribute("data-id");
						tag = e.target.parentNode;
					}
					
					//lastid = id;
					
					var img = tag.querySelector('img');
					if (img) {
						//var imgc = img.cloneNode(true);						
						//LastDiv.appendChild(imgc);
						//var newimg = LastDiv.querySelector('img');
						//newimg.style.display =  '';
						document.body.style.backgroundImage = " url('" + img.src + "')";
						document.body.style.backgroundRepeat = "no-repeat";
						document.body.style.backgroundPosition = "top center";
						document.body.style.backgroundSize = "contain";
					}
					
				}
			});*/
		
			var html = spans[i].innerHTML;			
			//var pos1 = html.indexOf(" : ");
			
			if (book != "twitter") {
			var pos1 = 0;
			//var checkkey = html.substring(pos1 ,pos1 + 1);
			
			//var re1 = new RegExp("^[\u4E00-\uFA29]*$"); //Chinese character range 
			//var re2 = new RegExp("^[\uE7C7-\uE7F3]*$"); //Chinese character range
			
			//if (re1.test(checkkey) || re2.test(checkkey))
			//{
				//spans[i].innerHTML = html.substring(0,pos1) + "<span class='BigTitle'>"  + html.substring(pos1 , pos1  + 4) + "</span>" + html.substring(pos1  + 4, html.length);
			//} else {
				var pos2 = html.indexOf(" ",pos1);
				if (pos2 < 0) pos2 = html.length;
				
				var pos21 = html.indexOf("　",pos1);
				if (pos21 < 0) pos21 = html.length;
				
				var pos22 = html.indexOf(":",pos1);
				if (pos22 < 0) pos22 = html.length;
				
				var pos23 = html.indexOf("?",pos1);
				if (pos23 < 0) pos23 = html.length;	

				var pos24 = html.indexOf("!",pos1);
				if (pos24 < 0) pos24 = html.length;	

				var pos25 = html.indexOf(" ",pos2+1);
				if (pos25 < 0) pos25 = html.length;
				
				var pos26 = html.indexOf("。",pos1);
				if (pos26 < 0) pos26 = html.length;
				
				pos2 = Math.min(pos25,pos21,pos22,pos23,pos24,pos26);
				
				var pos3 = html.indexOf("<",pos1); //html tag
				if (pos2 > pos3) pos2 = pos3 ;
				if (pos2 == 0) pos2 = pos3 ;
				
				//if (pos2 - pos1 > 20) pos2 = pos1 + 20;
				var content =  html.substring(pos2, html.length);
				var contenttext = html.substring(pos2,pos3);
				if (contenttext.length > 80) {
					content = contenttext.substring(0, 80);
					content = content + "..." + html.substring(pos3,html.length);
				}
				
				spans[i].innerHTML = html.substring(0,pos1) + "<span class='BigTitle'>"  + html.substring(pos1 , pos2) + "</span>" + content;
			//}
			
			} else  {
				var highlight = ['Docker','DevOps','XBox','Deep Learning','Google','VR','Kids','Kickstarter','microservice',
								 'Twitter','MongoDB','search',' Uber','Facebook','Map',' app ','Apple','Microsoft',
								 'Android','API','Samsung','.js'];
				for (var z = 0 ; z < highlight.length ; z ++) {
					var re = new RegExp(highlight[z],"ig");
					html = html.replace(re , "<span class='BigTitle'>" + highlight[z] +  "</span>");
				}
				spans[i].innerHTML = html				
			}
			
		}
		
		if (evt.total <= savetotal2) 
				QueueReadContent.scrollLeft = 0;
			
		
		
		
			//window.scrollTo(0,0);		
		/*window.setTimeout(function() {
			//var ratio = window.devicePixelRatio || 1;
			stepdesc = 0;
			for (var i = 0 ; i < QueueReadContent.childNodes.length ; i ++) {
			var obj = QueueReadContent.childNodes[i];
			if (obj.tagName == "SPAN") {
				 var rect = obj.getBoundingClientRect();
				 //if (rect.left + (rect.width/3) >= window.screen.width * ratio) {
				if (rect.left + (rect.width) >= window.innerWidth || 
					rect.top + (rect.height) >= window.innerHeight) {
					obj.style.opacity = 0.3; 
					stepdesc ++;
				 }
			}
			}
			
			
		},1500);*/
		
		if (allimg.length == 0) {
			
				stepdesc = 0;
				for (var i = 0 ; i < QueueReadContent.childNodes.length ; i ++) {
				var obj = QueueReadContent.childNodes[i];
				if (obj.tagName == "SPAN") {
					 var rect = obj.getBoundingClientRect();
					 //if (rect.left + (rect.width/3) >= window.screen.width * ratio) {
					if (rect.left + (rect.width) >= window.innerWidth || 
						rect.top + (rect.height) >= window.innerHeight) {
						obj.style.opacity = 0.3; 
						stepdesc ++;
					 }
				}
				}
			
		}
		
		
		savetotal2 = evt.total;
	}
	
	if (evt.command == 'sync') {		
		if (!book || (book && book == evt.book)  ) {		
			var data = {command:'loaddata',page: parseInt(evt.page) ,book: evt.book , memo:'noclick'};			
			send(data,true);	
		};
	} else if (evt.command == 'click') {
		var data = {command:'loaddata',page: parseInt(evt.page) ,book: evt.book , memo:'noclick'};			
		send(data,true);	
	} else if (evt.command == 'data') {	
		go();
		if (evt.memo != 'noclick') {			
			var data = {command:'click',page : parseInt(evt.page),book:book};						
			send(data,false);	
		} 
		
	}
	
	console.log('events : ' + JSON.stringify(evt));
	
});

function next() {
	TranslateDiv.innerHTML = "";
	lastid = 0;
	if (parseInt(page)+step < parseInt(total)) {			
				laststep = step - stepdesc ;
				if (laststep <= 0)
					laststep = 1;
				var data = {command:'loaddata',page: parseInt(page) + laststep,book:book};			
				
				send(data,true);
	} else if (parseInt(page)+1 < parseInt(total)){
				var newstep = parseInt(total) - parseInt(page) ;
				laststep = newstep - stepdesc ;
				if (laststep <= 0)
					laststep = 1;
				
				if (newstep <  step && stepdesc ==0) //for last page 
					laststep --;
				var data = {command:'loaddata',page: parseInt(page) + laststep ,book:book};			
				send(data,true);
	}
}	

function prev() {
	TranslateDiv.innerHTML = "";
	lastid = 0;
	if (QueueReadContent.scrollLeft == 0) {
			//move to left end
			//window.scrollTo(0,0);
			if (parseInt(page) - laststep >= 0) {			
				var data = {command:'loaddata',page: parseInt(page) - laststep,book:book};			
				send(data,true);
			}			
	}	
}

QueueReadContent.addEventListener('click', function(e) {  

			if (e.target.nodeName == 'A') {
				if(e.target.id == 'QueueReadBack'){
					prev();
				}  else if (e.target.id == 'QueueReadNext') {
					next();					
				}
				return;
			} 
			
			
		    /*if (e.target.nodeName == 'A') {
				if(e.target.id == 'QueueReadBack'){
					window.scrollTo(0,0);
					if (parseInt(page) - step >= 0) {			
						var data = {command:'loaddata',page: parseInt(page) - step,book:book};			
						send(data);
					}	
				} 
				return;
			} 
			
			if (window.getSelection().toString() != ""){
				e.stopPropagation();
				e.preventDefault();
				return;
			}
				
			//next
			window.scrollTo(0,0);
			if (parseInt(page)+step < parseInt(total)) {			
				var data = {command:'loaddata',page: parseInt(page) + step,book:book};			
				send(data);
			} else if (parseInt(page)+1 < parseInt(total)){
				var newstep = parseInt(total) - parseInt(page) -1;
				var data = {command:'loaddata',page: parseInt(page) + newstep,book:book};			
				send(data);
			}	*/	
		});
		
function unfade(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
        
    }, 0);
}
	

//window.onmousewheel = function(e) { 

document.addEventListener('mousewheel', function(e) {  
	if (e.wheelDelta < 0) {
		//if (document.body.scrollWidth - document.body.clientWidth - document.body.scrollLeft < 1) {
		//if (QueueReadContent.scrollWidth - QueueReadContent.clientWidth - QueueReadContent.scrollLeft < 2) {
			//move to right end
			//window.scrollTo(0,0);
			
		//} 
		//next();
		
		
		var spans = QueueReadContent.querySelectorAll('span');
		var found = false;
		for (var i = 1 ; i < spans.length ;  i++) {			
			var id = spans[i].getAttribute("data-id");
			if (parseInt(id) == (parseInt(lastid) + 1)) {
			found = true;					
					window['translate'+id] = function(response) {
					var scriptcode = document.getElementsByTagName('head')[0];
					scriptcode.removeChild(scriptcode.lastChild);		
							
					var s = QueueReadContent.querySelectorAll('span');
					for (var j = 0 ; j < s.length ; j++) {
						if (s[j].getAttribute("data-id") == id) {
							//s[j].innerHTML = response.data.translations[0].translatedText;
							var rect = s[j].getBoundingClientRect();
							TranslateDiv.innerHTML = response.data.translations[0].translatedText;
							TranslateDiv.style.top = rect.top;
							break;
						}
					}		
				
					setTimeout(function() {
						// remove the temporary function
						window['translate'+id] = null;
					}, 1000);
				};
	
				var newScript = document.createElement('script');
				newScript.type = 'text/javascript';
				var html = spans[i].innerHTML;
				var pos1 = html.indexOf(" <a");
				html = html.substring(0,pos1-2);
				var sourceText = escape(html);
				  // WARNING: be aware that YOUR-API-KEY inside html is viewable by all your users.
				  // Restrict your key to designated domains or use a proxy to hide your key
				  // to avoid misusage by other party.
				var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyB6SlunlYNvziOO-UZmAXU3rEJ_MTj8LN0&source=en&target=zh-TW&callback=translate'+id+'&q=' + sourceText;
				newScript.src = source;

				// When we add this script to the head, the request is sent off.
				document.getElementsByTagName('head')[0].appendChild(newScript);
			
				if (spans[i].style.opacity == 0.3 ) {
					next();
				} else {
					//var evObj = document.createEvent('MouseEvents');
					//evObj.initEvent( 'mouseover', true, false );
					//spans[i].dispatchEvent(evObj);
					var img = spans[i].querySelector('img');
					document.body.style.backgroundImage = "";
					if (img) {						
						document.body.style.backgroundImage = " url('" + img.src + "')";
						document.body.style.backgroundRepeat = "no-repeat";
						document.body.style.backgroundPosition = "top center";
						document.body.style.backgroundSize = "contain";
					}
					
					
					spans[i].style.backgroundColor  = "#5D5C5C";
					//spans[i].style.fontSize = "larger"
				}
				
				lastid = parseInt(lastid) + 1
				break;		
			} else if (parseInt(spans[i].getAttribute("data-id")) == (parseInt(lastid) )) {
				spans[i].style.backgroundColor  = "";
				spans[i].style.opacity = "0.1";
				//spans[i].style.fontSize = ""
			}
		}
		
		if (!found) //not found
			next();
	
		
	} else if ( e.wheelDelta > 0) {
		
		//if (document.body.scrollLeft == 0) {
		//prev();
		
		if (parseInt(lastid) <= 1) {
			prev(); 
			return;
		}
		
		var spans = QueueReadContent.querySelectorAll('span');		
		for (var i = 1 ; i < spans.length ;  i++) {
			if (parseInt(spans[i].getAttribute("data-id")) == (parseInt(lastid) - 1)) {
				/*var evObj = document.createEvent('MouseEvents');
				evObj.initEvent( 'mouseover', true, false );			
				spans[i].dispatchEvent(evObj);*/
				
				var img = spans[i].querySelector('img');
				document.body.style.backgroundImage = "";
				if (img) {						
						document.body.style.backgroundImage = " url('" + img.src + "')";
						document.body.style.backgroundRepeat = "no-repeat";
						document.body.style.backgroundPosition = "top center";
						document.body.style.backgroundSize = "contain";
				}
				
				spans[i].style.backgroundColor  = "#5D5C5C";
				spans[i].style.opacity = "1";
				//spans[i].style.fontSize = "larger"
				//spans[i].style.backgroundColor  = "";
				
				var id = spans[i].getAttribute("data-id");
				window['translate'+id] = function(response) {
					var scriptcode = document.getElementsByTagName('head')[0];
					scriptcode.removeChild(scriptcode.lastChild);		
							
					var s = QueueReadContent.querySelectorAll('span');
					for (var j = 0 ; j < s.length ; j++) {
						if (s[j].getAttribute("data-id") == id) {
							//s[j].innerHTML = response.data.translations[0].translatedText;
							var rect = s[j].getBoundingClientRect();
							TranslateDiv.innerHTML = response.data.translations[0].translatedText;
							TranslateDiv.style.top = rect.top;
							break;
						}
					}		
				
					setTimeout(function() {
						// remove the temporary function
						window['translate'+id] = null;
					}, 1000);
				};
		
				var newScript = document.createElement('script');
				newScript.type = 'text/javascript';
				var html = spans[i].innerHTML;
				var pos1 = html.indexOf(" <a");
				html = html.substring(0,pos1-2);
				var sourceText = escape(html);
				  // WARNING: be aware that YOUR-API-KEY inside html is viewable by all your users.
				  // Restrict your key to designated domains or use a proxy to hide your key
				  // to avoid misusage by other party.
				var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyB6SlunlYNvziOO-UZmAXU3rEJ_MTj8LN0&source=en&target=zh-TW&callback=translate'+id+'&q=' + sourceText;
				newScript.src = source;

				// When we add this script to the head, the request is sent off.
				document.getElementsByTagName('head')[0].appendChild(newScript);
				
				for (var j=i ; j < spans.length ;  j++) {
					if ( parseInt(spans[j].getAttribute("data-id")) == (parseInt(lastid) )) {
						spans[j].style.backgroundColor  = "";
						break;
					}
				}
				
				if (parseInt(lastid) >= 1)
					lastid = parseInt(lastid) - 1
				break;		
			} 
		}
	}
	
	
	e.preventDefault();
	e.returnValue=false;
});

document.addEventListener("visibilitychange", function() {		
	if ( document.visibilityState == 'visible') {
		savetotal = total;
		window.parent.document.title = "QRead list";
	}});
	
var startX,
startY,
dist,
threshold = 40, //required min distance traveled to be considered swipe
allowedTime = 300, // maximum time allowed to travel that distance
elapsedTime,
startTime;
	
	
document.addEventListener('touchstart', function(e){ 
		if (e.target.nodeName == "A") return;
        var touchobj = e.changedTouches[0]
		
		if (touchobj.pageX < (10 * 2)) {
			prev();
			e.preventDefault();
			startX = null;
			return;
		}
		else if (touchobj.pageX > (document.body.scrollWidth - 10 * 2)) {
			next();
			e.preventDefault();
			startX = null;
			return;
		}
		
		
		
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface	
		
		
       // e.preventDefault()
}, false)
/*
QueueReadContent.addEventListener('touchmove', function(e){
	if (e.target.nodeName == "A") return;
    e.preventDefault() // prevent scrolling when inside DIV
}, false)

QueueReadContent.addEventListener('touchend', function(e){
	if (e.target.nodeName == "A") return;
	if (startX == null) return;
    var touchobj = e.changedTouches[0]
    dist = touchobj.pageX - startX // get total dist traveled by finger while in contact with surface
    elapsedTime = new Date().getTime() - startTime // get time elapsed
    // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
   
	
	if (elapsedTime <= allowedTime &&  Math.abs(touchobj.pageY - startY) <= 200) {
		//alert("in:" + elapsedTime + ":" + dist);
		if (Math.abs(dist) >= threshold) {
			//alert('inin');
			if (dist  > 0) {
				prev();
			} else {
				next();
			}
		}
	} else {
		alert(elapsedTime + ":" + dist);
	}
	
    e.preventDefault()
}, false)*/

document.onkeydown = function(e) {
	if (e.keyCode == 39) {next();} 
	else if (e.keyCode == 37 ) {prev();} 
};



