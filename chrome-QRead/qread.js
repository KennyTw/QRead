var req = {}; 
var count = 0;
var firsttime = 0; 
var slowarr = [] ;
var level = 500;
var largetime = 0;
var resources = [];
var resourceslen = 0;
var lastwindow;
var book;
var page;
var total;
var step = 1;

// send data to qread
function appendToQueue(info,tab)
{
	var selecttext = info.selectionText;
	selecttext += "<br><a href='" + tab.url + "'>" + tab.title + "</a>";
	
	var data = {command:'append',content : selecttext  , book: "kennyq"};		
	send(data);
	
	/*var code = " var selection = window.getSelection ();"
    code += "if (selection.rangeCount > 0) {";
    code += " range = selection.getRangeAt(0);";
    code += " var clonedSelection = range.cloneContents();";
    code += " var div = document.createElement('div');";
    code += " div.appendChild(clonedSelection);";
    code += "      alert( div.innerHTML); chrome.runtime.sendMessage({event:\"test\"});";
    code += "    }";
	chrome.tabs.executeScript(null, {code:code});*/
}

chrome.contextMenus.create({title: "Append to QRead", contexts:["selection"], onclick: appendToQueue});

var socket = io.connect("http://104.155.234.188",{'forceNew':true });
function send(data) {	
	var timestamp = Number(new Date());	
	data["id"] = timestamp;
	data["step"] = step;
	console.log(data);
	socket.emit('commands',data);
}


//page communication
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	//alert(message.event );
    if(message.event == "QueueReadClick") {
		if (parseInt(page)+step < parseInt(total)) {			
			var data = {command:'loaddata',page: parseInt(page) + step,book:book};			
			send(data);
		} else if (parseInt(page)+1 < parseInt(total)){
			var newstep = parseInt(total) - parseInt(page) -1;
			var data = {command:'loaddata',page: parseInt(page) + newstep,book:book};			
			send(data);
		}
	} else if (message.event == "QueueReadBack") {
		if (parseInt(page) - step >= 0) {			
			var data = {command:'loaddata',page: parseInt(page) - step,book:book};			
			send(data);
		}	
	}
});

setBook = function(m_book) {
   book = m_book;
   
    if (!book)
		book='twitter';
	
	var data = {command:'sync',book:book};
	send(data);
} 

getBook = function() {
  return book;
} 

socket.on('connect', function() {
			//alert('connect');
			if (!book)
				book='twitter';
			
			var data = {command:'sync',book:book};
			send(data);
		});

socket.on('disconnect', function() {
	alert('disconnect');
});

socket.on('events', function(evt) {	
	//alert('events : ' + JSON.stringify(evt));	
	
	//chrome.tabs.executeScript(null, {code:"var QueueReadContent = document.getElementById('QueueReadContent');QueueReadContent.innerText='" + JSON.stringify(evt) + "';"});
	
	//chrome.tabs.executeScript(null, {code:"alert('" + JSON.stringify(evt) + "');"});
	
	//chrome.tabs.executeScript(null, {code:"var div1 = document.createElement('div');div1.innerHTML = '" + JSON.stringify(evt) + "';div1.setAttribute('id','QueueReadContent');  div1.style.cssText = 'color:white ;background:black;height:20px;z-index:999999;text-align:center;width:40%;position: relative ;top:0px';document.body.insertBefore(div1,document.body.firstChild);"});
	
	function go() {
		if (evt.book == "kennyq") return;
		page = evt.page;
		var totalchange = false
		if (evt.total != total && total-page <=  step)
		//if (evt.total != total )
			totalchange = true;
		total = evt.total;
		book = evt.book;
		//var data = evt.dbdata[0].replace("<br><br>","");
		var data = evt.dbdata[0];
		data = data.replace(/\<br><br>/g,'<hr>')
		
		
		
		//data = data.replace(/<a\b[^>]*>/i,"");
		//data = data.replace(/<\/a>/i, "");
		//data = data.replace("Link", "");
		//data = "[<a href='#QueueReadBack'>" + (parseInt(page) + 1) + "/" + total + "</a>] <br><br>" + data;		
		data = "[<a href='javascript:' id=QueueReadBack>" + (parseInt(page) + 1) + "/" + total + "</a>] [" +  (parseInt(total) -  (parseInt(page) + 1))  + "] <br><hr>" + data;
	
		/*var code = "var stopscroll=false; var QueueReadContent = document.getElementById('QueueReadContent'); ";
		code += " if (QueueReadContent) {QueueReadContent.innerHTML = " + JSON.stringify(data)+ "; var anchors = QueueReadContent.querySelectorAll('a');";
		code += " for (var i = 0 ; i < anchors.length ;  i++) { anchors[i].setAttribute('target', ''); anchors[i].style.cssText='color:white;  text-decoration: underline;'}";
		code += " var images = QueueReadContent.querySelectorAll('img'); for (var i = 0 ; i < images.length ;  i++) {images[i].parentNode.removeChild(images[i]);}" ;
		code += " document.onclick = function(e) {if (e.ctrlKey && e.which == 1) {location.href='#QueueReadClick';} else if (e.altKey && e.which == 1) {location.href='#QueueReadBack';} else if (e.shiftKey && e.which == 1) {var _a=document.createElement('a');_a.href=anchors[anchors.length-1].href;_a.target='new'; _a.click();} };";
		code += " document.onkeydown = function(e) {if (e.keyCode == 37 && e.ctrlKey) {location.href='#QueueReadBack';} else if (e.keyCode == 39 && e.ctrlKey) {location.href='#QueueReadClick';} else if (e.keyCode == 38 && e.ctrlKey) {location.href= anchors[anchors.length-1].href;}};";
		//code += " window.onscroll = function(e) {if (((document.documentElement.clientHeight + document.body.scrollTop) >= document.body.offsetHeight - 100) && !stopscroll ) { stopscroll=true; location.href='#QueueReadClick';location.href= anchors[anchors.length-1].href;}};";
		code += "}";*/
		var code = "var QueueReadContent = document.getElementById('QueueReadContent'); ";
		code += " if (QueueReadContent) {";		
		code += " QueueReadContent.innerHTML = " + JSON.stringify(data)+ "; ";
		code += " var anchors = QueueReadContent.querySelectorAll('a');";
		code += " for (var i = 0 ; i < anchors.length ;  i++) { if (i > 0) {anchors[i].setAttribute('target', 'qread');} anchors[i].style.cssText='color:white;  text-decoration: underline;'}";
		//code += " var images = QueueReadContent.querySelectorAll('img'); for (var i = 0 ; i < images.length ;  i++) {images[i].parentNode.removeChild(images[i]);}" ;
		code += " var images = QueueReadContent.querySelectorAll('img'); for (var i = 0 ; i < images.length ;  i++) {images[i].style.width='100%';}" ;
		code += " document.onclick = function(e) {if (e.altKey && e.which == 1) {if (QueueReadContent.style.maxHeight == '96%') {QueueReadContent.style.maxHeight = '10px'} else {QueueReadContent.style.maxHeight = '96%';} }  };";
		code += " QueueReadContent.onmouseenter = function(e) { QueueReadContent.style.maxHeight = '96%';};";
		//code += " QueueReadContent.onmouseleave = function(e) { QueueReadContent.style.maxHeight = '10px';QueueReadContent.scrollTop=0;};";
		code += " QueueReadContent.onmouseleave = function(e) { QueueReadContent.style.maxHeight = '10px';};";
		//code += " QueueReadContent.onmousewheel = function(e) { e.currentTarget.scrollTop -= (e.wheelDelta);e.preventDefault();e.returnValue=false;};";	
		code += " QueueReadContent.onmousewheel = function(e) { e.currentTarget.scrollTop -= (e.wheelDelta);e.preventDefault();e.returnValue=false;};";			
		if (totalchange)
			code += " QueueReadContent.style.maxHeight = '96%';setTimeout(function(){ QueueReadContent.scrollTop=QueueReadContent.scrollHeight;  }, 1000);";		
		code += " } ";		
		
		chrome.tabs.executeScript(null, {code:code});
		
	}
	
	if (evt.command == 'sync') {
		//if (!book || (book && book == evt.book) || (parseInt(page)  == parseInt(total) -1) ) {
		if (!book || (book && book == evt.book)  ) {
			//go();
			//page = evt.page;
			//total = evt.total;
			//book = evt.book;
			
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
		
	} else if (evt.command == 'appendok') {	
		alert('appendok');
	}
	
	console.log('events : ' + JSON.stringify(evt));

});
	

	
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	//console.debug (tab.url  );
	//alert(changeInfo.status + ":" + tab.url);
    if (changeInfo.status == 'complete' && tab.url.indexOf("http://104.155.234.188") < 0 ) {		
		
		//Object.keys(activeTabs).every(function(key) {			
			//if (activeTabs[key] == tabId ) {				
				/* We are interested in this request */
				// Execute some script when the page is fully (DOM) ready
				//chrome.tabs.executeScript(null, {code:"var iframe = document.createElement('iframe');iframe.src ='http://104.155.234.188/?b=twitter&f=e&m=n';document.body.appendChild(iframe);"});
				//chrome.tabs.executeScript(null, {ode:"var script1 = document.createElement('script');script1.setAttribute('src', 'https://cdn.socket.io/socket.io-1.3.5.js'); document.head.appendChild(script1); script1.onload = function() { alert('Script loaded and ready');var socket = io.connect('http://104.155.234.188',{'forceNew':true });};"});		
				/*var code = "var QueueReadContent = document.getElementById('QueueReadContent');";
				code += "if (!QueueReadContent) { var div1 = document.createElement('div');div1.innerHTML = 'Hello QueueRead'; div1.setAttribute('id', 'QueueReadContent'); div1.style.cssText = '   -webkit-box-orient: vertical; -webkit-line-clamp: 3;  display: -webkit-box; text-overflow: ellipsis;  overflow: hidden; line-height: initial; font-size: 15px; font-family: Helvetica Neue, Helvetica, Arial, Microsoft Jhenghei, sans-serif; cursor:pointer; color:white ; opacity: 0.87; padding: 5px ; background:black;min-height: 22px; height:auto ; z-index:999999;text-align:center;width:50%;position: fixed ; bottom:0px ; right: 20%;    border-radius: 5px 5px 0px 0px;';document.body.insertBefore(div1,document.body.firstChild);";		
				code += "QueueReadContent = document.getElementById('QueueReadContent'); QueueReadContent.addEventListener('click', function(e) { if (e.target.nodeName == 'A') {return;} location.href='#QueueReadClick';});}";
				chrome.tabs.executeScript(null, {code:code});*/
				
				var code = "var QueueReadContent = document.getElementById('QueueReadContent');";
				code += "if (!QueueReadContent) { ";
				code += " var css = document.createElement('style');css.type = 'text/css'; css.innerHTML = '#QueueReadContent hr {   display: block !important; border: 0;  height: 1px;  background-color: #732D2D;   margin: 8px 0px 8px 0px;}   #QueueReadContent::-webkit-scrollbar { width: 6px; height: 6px; } #QueueReadContent::-webkit-scrollbar-thumb {background: #959595;  border-radius: 10px;	} '; document.body.appendChild(css);";
				//code += " var css = document.createElement('style');css.type = 'text/css'; css.innerHTML = 'html { transform: translate(340px,0px); }'; document.body.appendChild(css);";
				//  box-shadow: -5px 0 20px rgba(50,50,50,.5)
				code += " var div1 = document.createElement('div');div1.innerHTML = 'Hello QueueRead'; div1.setAttribute('id', 'QueueReadContent'); div1.style.cssText = 'box-sizing: content-box; box-shadow: -2px -2px 20px rgba(50,50,50,.2),2px 0 20px rgba(50,50,50,.2);   zoom: reset; max-height: 10px;  overflow-x: hidden;overflow-y: auto; line-height: 25px; font-size: 16px; font-family: Helvetica Neue, Helvetica, Arial, Microsoft Jhenghei, sans-serif; cursor:pointer; color:white ; opacity: 1; padding: 7px ; background:black;min-height: 20px; height:auto ; z-index:9999999999;text-align:left;width:30%;position: fixed ; bottom:0px ; right: 10px;    border-radius: 5px 5px 0px 0px;';document.body.insertBefore(div1,document.body.firstChild);"
				//code += " QueueReadContent = document.getElementById('QueueReadContent'); QueueReadContent.addEventListener('click', function(e) {  if (e.target.nodeName == 'A') {return;} location.href='#QueueReadClick';});";
				code += " QueueReadContent = document.getElementById('QueueReadContent'); QueueReadContent.addEventListener('click', function(e) {  if (e.target.nodeName == 'A') {if(e.target.id == 'QueueReadBack'){chrome.runtime.sendMessage({event:\"QueueReadBack\"});QueueReadContent.scrollTop=0;} return;} chrome.runtime.sendMessage({event:\"QueueReadClick\"});QueueReadContent.scrollTop=0;});";
				
				
				code += " }";
				chrome.tabs.executeScript(null, {code:code});
				
				//if (tab.url.indexOf("#QueueRead") >= 0 ) {
					
					//var code = " window.history.pushState('', document.title, window.location.pathname); btn.disabled = !(location.hash || location.href.slice(-1) == '#');";			
					//chrome.tabs.executeScript(null, {code:code});			
					/*if (tab.url.indexOf("#QueueReadClick") >= 0 ) {
						if (parseInt(page)+step < parseInt(total)) {			
							var data = {command:'loaddata',page: parseInt(page) + step,book:book};			
							send(data);
						} else if (parseInt(page)+1 < parseInt(total)){
							var newstep = parseInt(total) - parseInt(page) -1;
							var data = {command:'loaddata',page: parseInt(page) + newstep,book:book};			
							send(data);
						}
					} else if ( tab.url.indexOf("#QueueReadBack") >= 0 ) {
						if (parseInt(page) - step >= 0) {			
							var data = {command:'loaddata',page: parseInt(page) - step,book:book};			
							send(data);
						}		
					}*/
					
				//} else {
					if (!book)
					book='twitter';
					
					var data = {command:'sync',book:book};
					send(data);
				//}
				//chrome.tabs.executeScript(null, {code:"setTimeout(function(){var socket = io.connect('http://104.155.234.188',{'forceNew':true });socket.on('connect', function() {alert('connect');});},3000) "});
				
				/*if (!book)
					book='twitter';
					
					var data = {command:'sync',book:book};
					send(data);
				*/	
				//chrome.tabs.executeScript(null, {code:"var div1 = document.createElement('div');div1.innerHTML = 'Queue Read';  div1.setAttribute('id','QueueReadContent'); div1.style.cssText = 'color:white ;background:black;height:20px;z-index:999999;text-align:center;width:100%;position: relative ;top:0px';document.body.insertBefore(div1,document.body.firstChild);"});
				
			//}
		//});
	
       
	}
});


chrome.webNavigation.onBeforeNavigate.addListener(function(details) {				
			     chrome.tabs.query({
					active: true,               // Select active tabs
					lastFocusedWindow: true     // In the current window
				}, function(array_of_Tabs) {
					// Since there can only be one active tab in one active window, 
					//  the array has only one element
					var tab = array_of_Tabs[0];
					// Example:
					if (tab) {
						var url = tab.url;						
						if (url ==  details.url) {
								if (url.indexOf("#QueueRead") >= 0  && tab.url.indexOf("http://104.155.234.188") < 0) {									
									  chrome.tabs.update(details.tabId, {url:  url.replace("#QueueReadBack","").replace("#QueueReadClick","")});
								}
						} else {
							 console.debug ("onBeforeNavigate not main,url:" + details.url  );
						}
					}
					
					 
				});
});

chrome.webNavigation.onCompleted.addListener(function(details) {
              console.debug ("onCompleted");			
});

/* Keep track of the active tab in each window */
var activeTabs = {};

chrome.tabs.onActivated.addListener(function(details) {
    activeTabs[details.windowId] = details.tabId;
	
	if ( details.url.indexOf("http://104.155.234.188") < 0) {
		if (!book)
		book='twitter';
		
		var data = {command:'sync',book:book};
		send(data);
	}
});

/* Clear the corresponding entry, whenever a window is closed */
chrome.windows.onRemoved.addListener(function(winId) {
    delete(activeTabs[winId]);
});

/* Listen for web-requests and filter them */
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (details.tabId == -1) {
       // console.log("Skipping request from non-tabbed context...");
        return;
    }

    var notInteresting = Object.keys(activeTabs).every(function(key) {
        if (activeTabs[key] == details.tabId) {
            /* We are interested in this request */
			
            return false;
        } else {
            return true;
        }
    });

   // if (notInteresting) {
        /* We are not interested in this request */
        //console.log("Just ignore this one:", details);
   // }
}, { urls: ["<all_urls>"] });

/* Get the active tabs in all currently open windows */
chrome.tabs.query({ active: true }, function(tabs) {
    /*tabs.forEach(function(tab) {
        activeTabs[tab.windowId] = tab.id;
    });*/
    //console.log("activeTabs = ", activeTabs);
});

chrome.webRequest.onResponseStarted.addListener(function(details) {  

	if (details.tabId == -1) {
       // console.log("Skipping request from non-tabbed context...");
        return;
    }

	var notInteresting = Object.keys(activeTabs).every(function(key) {
        //if (activeTabs[key] == details.tabId && req[details.requestId] != undefined) {		
			//har array
			//resources[details.requestId].startReply = details; 				
		//}
	});
}, {
    urls: ["<all_urls>"]
});
	

/*
chrome.webRequest.onHeadersReceived.addListener(function(details) { 
	if (details.tabId == -1) {
       // console.log("Skipping request from non-tabbed context...");
        return;
    }

	var notInteresting = Object.keys(activeTabs).every(function(key) {
        if (activeTabs[key] == details.tabId && req[details.requestId] != undefined) {		
			//har array
			//resources[details.requestId].startReply = details; 
			//resources[details.requestId].responseHeaders = details.responseHeaders;			
		}
	});
}, {
    urls: ["<all_urls>"]
},["responseHeaders"]);*/
	
chrome.webRequest.onCompleted.addListener(function(details) {  

	if (details.tabId == -1) {
       // console.log("Skipping request from non-tabbed context...");
        return;
    }
	
	 var notInteresting = Object.keys(activeTabs).every(function(key) {
        if (activeTabs[key] == details.tabId) {
            /* We are interested in this request */
            //console.log("Check this out:", details);
			
            return false;
        } else {
            return true;
        }
    });
	
	
	
}, {
    urls: ["<all_urls>"]
} ,["responseHeaders"] );