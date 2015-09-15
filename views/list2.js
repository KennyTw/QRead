var book = document.getElementById('book').value;
var page;
var total;
var savetotal=0;
var savetotal2=0;
var step = parseInt(document.getElementById('step').value);
//step = 40;
var stepdesc = 0;
var laststep = step;
var sendqueue = [];

var socket = io.connect("http://104.155.234.188",{'forceNew':true });
var QueueReadContent = document.getElementById('QueueReadContent');

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
		} 
		
		total = evt.total;
		book = evt.book;
		//var data = evt.dbdata[0].replace("<br><br>","");
		var data = evt.dbdata[0];
		data = data.replace(/\<br><br>/g,'<hr>');
		data = "<span id='QreadCounter'>[<a href='javascript:' id=QueueReadNext>" + (parseInt(page) + 1) + "/" + total + "</a>] [<a href='javascript:' id=QueueReadBack>" +  (parseInt(total) -  (parseInt(page) + 1))  + "</a>] </span><br><hr>" + data;
		//var QueueReadContent = document.getElementById('QueueReadContent');
		if (evt.total <= savetotal2) 
			unfade(QueueReadContent);
		QueueReadContent.innerHTML = data;
		//QueueReadContent.insertAdjacentHTML( 'beforeend', data );
		/*var allimg = document.querySelectorAll('img');
		var loadcount = 0;
		for (var i = 0; i < allimg.length; i++)        
			allimg[i].addEventListener("load", function() { loadcount++; if (loadcount == allimg.length) {			
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
			
		}*/
		
		var anchors = QueueReadContent.querySelectorAll('a');
		for (var i = 0 ; i < anchors.length ;  i++) { 
			if (i > 0) {anchors[i].setAttribute('target', 'qread');} 
			anchors[i].style.cssText='color:white;  text-decoration: underline;';
		}
		
		var images = QueueReadContent.querySelectorAll('img'); 
		for (var i = 0 ; i < images.length ;  i++) {
			images[i].style.width='100%';
			images[i].style.maxHeight = window.innerHeight * 0.7;
		}
		
		var spans = QueueReadContent.querySelectorAll('span'); 
		for (var i = 1 ; i < spans.length ;  i++) {
			var html = spans[i].innerHTML;			
			//var pos1 = html.indexOf(" : ");
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
				/*if (contenttext.length > 80) {
					content = contenttext.substring(0, 80);
					content = content + "..." + html.substring(pos3,html.length);
				}*/
				
				spans[i].innerHTML = html.substring(0,pos1) + "<span class='BigTitle'>"  + html.substring(pos1 , pos2) + "</span>" + content;
			//}
			
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
	if (parseInt(page)+step < parseInt(total)) {			
				laststep = step - stepdesc ;
				if (laststep <= 0)
					laststep = 1;
				var data = {command:'loaddata',page: parseInt(page) + laststep,book:book};			
				
				send(data,true);
	} else if (parseInt(page)+1 < parseInt(total)){
				var newstep = parseInt(total) - parseInt(page) -1;
				laststep = newstep - stepdesc ;
				if (laststep <= 0)
					laststep = 1;
				var data = {command:'loaddata',page: parseInt(page) + laststep ,book:book};			
				send(data,true);
	}
}	

function prev() {
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
		next();
	} else if ( e.wheelDelta > 0) {
		//if (document.body.scrollLeft == 0) {
		prev();
	}
	
	//window.scrollBy(e.wheelDelta * -3.2,0);
	//var dir = 1;
	//if (e.wheelDelta > 0)
		//dir = -1;	
	
	/*if (document.body.scrollWidth - document.body.clientWidth - document.body.scrollLeft  >  document.body.clientWidth ) 	
		window.scrollBy(dir * document.body.clientWidth ,0)
	else
		window.scrollBy(e.wheelDelta * -1 ,0);*/
	
	//window.scrollBy(dir * 15 ,0);
	
	//QueueReadContent.scrollLeft += e.wheelDelta * -3.2;
	
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



