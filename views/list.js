var book;
var page;
var total;
var savetotal=0;
var savetotal2=0;
var step = parseInt(document.getElementById('step').value);
var stepdesc = 0;
var laststep = step;

var socket = io.connect("http://104.155.234.188",{'forceNew':true });
var QueueReadContent = document.getElementById('QueueReadContent');

function send(data) {	
	var timestamp = Number(new Date());	
	data["id"] = timestamp;
	data["step"] = step ;
	console.log(data);
	socket.emit('commands',data);
}


socket.on('connect', function() {
			//alert('connect');
			if (!book)
				book='kenny';
			
			var data = {command:'sync',book:book};
			send(data);
		});

socket.on('disconnect', function() {
	alert('disconnect');
});

socket.on('events', function(evt) {	 

	function go() {
		if (evt.book == "kennyq") return;
		
		stepdesc = 0;
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
		data = "<span id='QreadCounter'>[<a href='javascript:' id=QueueReadBack>" + (parseInt(page) + 1) + "/" + total + "</a>] [" +  (parseInt(total) -  (parseInt(page) + 1))  + "] </span><br><hr>" + data;
		//var QueueReadContent = document.getElementById('QueueReadContent');
		if (evt.total <= savetotal2) 
			unfade(QueueReadContent);
		QueueReadContent.innerHTML = data;
		//QueueReadContent.insertAdjacentHTML( 'beforeend', data );
		
		var anchors = QueueReadContent.querySelectorAll('a');
		for (var i = 0 ; i < anchors.length ;  i++) { 
			if (i > 0) {anchors[i].setAttribute('target', 'qread');} 
			anchors[i].style.cssText='color:white;  text-decoration: underline;';
		}
		
		var images = QueueReadContent.querySelectorAll('img'); 
		for (var i = 0 ; i < images.length ;  i++) {images[i].style.width='100%';}
		
		if (evt.total <= savetotal2) 
				QueueReadContent.scrollLeft = 0;
		
			//window.scrollTo(0,0);		
		window.setTimeout(function() {
			
			for (var i = 0 ; i < QueueReadContent.childNodes.length ; i ++) {
			var obj = QueueReadContent.childNodes[i];
			if (obj.tagName == "SPAN") {
				 var rect = obj.getBoundingClientRect();
				 if (rect.left + (rect.width/3) >= window.screen.width) {
					obj.style.opacity = 0.3; 
					stepdesc ++;
				 }
			}
			}
			
			
		},3000);
		
		
		savetotal2 = evt.total;
	}
	
	if (evt.command == 'sync') {		
		if (!book || (book && book == evt.book)  ) {		
			var data = {command:'loaddata',page: parseInt(evt.page) ,book: evt.book , memo:'noclick'};			
			send(data);	
		};
	} else if (evt.command == 'click') {
		var data = {command:'loaddata',page: parseInt(evt.page) ,book: evt.book , memo:'noclick'};			
		send(data);	
	} else if (evt.command == 'data') {	
		go();
		if (evt.memo != 'noclick') {			
			var data = {command:'click',page : parseInt(evt.page),book:book};						
			send(data);	
		} 
		
	}
	
	console.log('events : ' + JSON.stringify(evt));
	
});

QueueReadContent.addEventListener('click', function(e) {  
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
        
    }, 15);
}
		
//window.onmousewheel = function(e) { 
QueueReadContent.addEventListener('mousewheel', function(e) {  
	if (e.wheelDelta < 0) {
		//if (document.body.scrollWidth - document.body.clientWidth - document.body.scrollLeft < 1) {
		//if (QueueReadContent.scrollWidth - QueueReadContent.clientWidth - QueueReadContent.scrollLeft < 2) {
			//move to right end
			//window.scrollTo(0,0);
			if (parseInt(page)+step < parseInt(total)) {			
				var data = {command:'loaddata',page: parseInt(page) + step - stepdesc,book:book};			
				laststep = step - stepdesc;
				send(data);
			} else if (parseInt(page)+1 < parseInt(total)){
				var newstep = parseInt(total) - parseInt(page) -1;
				laststep = newstep - stepdesc;
				var data = {command:'loaddata',page: parseInt(page) + newstep - stepdesc ,book:book};			
				send(data);
			}		
		//} 
	} else if ( e.wheelDelta > 0) {
		//if (document.body.scrollLeft == 0) {
		if (QueueReadContent.scrollLeft == 0) {
			//move to left end
			//window.scrollTo(0,0);
			if (parseInt(page) - laststep >= 0) {			
				var data = {command:'loaddata',page: parseInt(page) - laststep,book:book};			
				send(data);
			}	
			
		}
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