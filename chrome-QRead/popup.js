var BGPage = chrome.extension.getBackgroundPage();
var page;
var book;
var total;
var socket = io.connect("http://104.155.234.188",{'forceNew':true });

socket.on('connect', function() {
	//alert('connect');
	book='twitter';
	var data = {command:'sync',book:'twitter'};
	send(data);	
});

socket.on('disconnect', function() {
	alert('disconnect');
});


socket.on('events', function(evt) {	
	//alert('events : ' + JSON.stringify(evt));
	console.log('events : ' + JSON.stringify(evt));
	var showLink = document.getElementById('showLink');
	var pageidx = document.getElementById('pageidx');
	
	function go() {
		page = evt.page;
		total = evt.total;
		pageidx.innerText = parseInt(page)+1 + "/" + total;
		showLink.innerHTML = evt.dbdata[0];		
		var links = showLink.querySelectorAll('a');
		if (links) {
			for (var i = 0 ; i < links.length ;  i++) {
				links[i].style.display = "none";
				/*chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
					chrome.tabs.update(tab.id, {url: link.href} , function(tab) { chrome.tabs.executeScript({
						code: 'history.replaceState({}, "", " ");'
					});});
				});*/
				

				if (i == 0) {
					chrome.tabs.getSelected(null,function(tab) {						
						if (tab.url != links[0].href) {
							chrome.tabs.query({currentWindow: true, active: true}, function (tab) {				
								chrome.tabs.executeScript(tab.id,{
									code: 'location.replace("' +  links[0].href+ '");'
								});
							});							
						}
					});
					
				}
			}
		}		
	}
	
	if (evt.command == 'sync') {
		if (!book || (book && book == evt.book)) {
			go();
		}
	} else if (evt.command == 'data') {	
		go();

		if (evt.memo != 'noclick') {
			var data = {command:'click',page : parseInt(evt.page),book:book};						
			send(data);	
		}
		
	} else if (evt.command == 'click') {
		var data = {command:'loaddata',page: parseInt(evt.page) ,book: evt.book , memo:'noclick'};			
		send(data);	
	}
});

 function send(data) {	
	var timestamp = Number(new Date());	
	data["id"] = timestamp;
	data["step"] = 1;
	console.log(data);
	socket.emit('commands',data);
 }

document.addEventListener('DOMContentLoaded', function() {	
	
    var OpenTwitter = document.getElementById('OpenTwitter');
	var OpenApple = document.getElementById('OpenApple');
	var OpenMobile01 = document.getElementById('OpenMobile01');
	var OpenFb = document.getElementById('OpenFb');
	var showLink = document.getElementById('showLink');	
	var pageidx = document.getElementById('pageidx');
	
	pageidx.addEventListener('click', function() {
		if (parseInt(page) - 1 >= 0) {
			//var data = {command:'click',page : parseInt(page)+1 ,book:book};			 
			//send(data);
			var data = {command:'loaddata',page: parseInt(page) - 1,book:book};			
			send(data);
		}		
	});
	
	showLink.addEventListener('click', function() {
		if (parseInt(page)+1 < parseInt(total)) {
			//var data = {command:'click',page : parseInt(page)+1 ,book:book};			 
			//send(data);
			var data = {command:'loaddata',page: parseInt(page) + 1,book:book};			
			send(data);
		}
	});
	
	OpenTwitter.addEventListener('click', function() {
       // chrome.windows.create({ url: 'http://104.155.234.188/?b=twitter&f=e&m=n&a=1', width: 420, height: 230 , focused: true, type: 'panel'} , function(newWindow) {BGPage.setLastWindow(newWindow.id);});	
		/*chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
			chrome.tabs.update(tab.id, {url: 'http://www.google.com'});
		});*/
		
		book='twitter';
		var data = {command:'sync',book:'twitter'};
		send(data);	
		
    });
	
	OpenApple.addEventListener('click', function() {
       // chrome.windows.create({ url: 'http://104.155.234.188/?b=apple&m=n&a=1&z=1.2', width: 420, height: 230, type: 'panel'});	
	   book='apple';
	   var data = {command:'sync',book:'apple'};
	   send(data);	
    });
	
	OpenMobile01.addEventListener('click', function() {
        //chrome.windows.create({ url: 'http://104.155.234.188/?b=mobile01&m=n&a=1&z=1.2', width: 420, height: 230, type: 'panel'});	
		book='mobile01';
		var data = {command:'sync',book:'mobile01'};
	    send(data);
    });
	
	OpenFb.addEventListener('click', function() {
        //chrome.windows.create({ url: 'http://104.155.234.188/?b=fb&m=n&a=1&z=1.2', width: 420, height: 230, type: 'panel'});	
		var book='fb';
		var data = {command:'sync',book:'fb'};
	    send(data);
    });
});

