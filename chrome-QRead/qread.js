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


setBook = function(m_book) {
   book = m_book;
} 

getBook = function() {
  return book;
} 


	
	
	
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        // Execute some script when the page is fully (DOM) ready
        //chrome.tabs.executeScript(null, {code:"var iframe = document.createElement('iframe');iframe.src ='http://104.155.234.188/?b=twitter&f=e&m=n';document.body.appendChild(iframe);"});
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

    if (notInteresting) {
        /* We are not interested in this request */
        //console.log("Just ignore this one:", details);
    }
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