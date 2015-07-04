var book;
var page;
var total;
var savetotal=0;
var step = parseInt(document.getElementById('step').value);


var socket = io.connect("http://104.155.234.188",{'forceNew':true });
var QueueReadContent = document.getElementById('QueueReadContent');

function send(data) {	
	var timestamp = Number(new Date());	
	data["id"] = timestamp;
	data["step"] = step;
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
		page = evt.page;
		//var totalchange = false
		//if (evt.total != total && total-page <=  step)	
		//	totalchange = true;		
		if (savetotal == 0)
			savetotal = evt.total;
		
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
		QueueReadContent.innerHTML = data;
		
		var anchors = QueueReadContent.querySelectorAll('a');
		for (var i = 0 ; i < anchors.length ;  i++) { 
			if (i > 0) {anchors[i].setAttribute('target', 'qread');} 
			anchors[i].style.cssText='color:white;  text-decoration: underline;'
		}
		
		var images = QueueReadContent.querySelectorAll('img'); 
		for (var i = 0 ; i < images.length ;  i++) {images[i].style.width='100%';}
		
		
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
		    if (e.target.nodeName == 'A') {
				if(e.target.id == 'QueueReadBack'){
					window.scrollTo(0,0);
					if (parseInt(page) - step >= 0) {			
						var data = {command:'loaddata',page: parseInt(page) - step,book:book};			
						send(data);
					}	
				} 
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
			}		
		});
		
window.onmousewheel = function(e) { 
	
	window.scrollBy(e.wheelDelta * -3.2,0);
	
	e.preventDefault();
	e.returnValue=false;
};

document.addEventListener("visibilitychange", function() {		
	if ( document.visibilityState == 'visible') {
		savetotal = total;
		window.parent.document.title = "QRead list";
	}});