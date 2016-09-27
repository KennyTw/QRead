//var infoWindow;
var userData = new Array();
var map;
var categorymap={0:'靜止',1:'走路',2:'跑步',3:'未穿戴',4:'淺睡',5:'深睡',6:'充電中'};

function initMap() {
 
  initPubNub();

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 14
  });
  //infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  /*if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //infoWindow.setPosition(pos);
      //infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      //handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    //handleLocationError(false, infoWindow, map.getCenter());
  }*/

 

   var pos = {
        lat: 24.9840598,
        lng: 121.560777
      };

     map.setCenter(pos);
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  //infoWindow.setPosition(pos);
  //infoWindow.setContent(browserHasGeolocation ?
  //                      'Error: The Geolocation service failed.' :
  //                      'Error: Your browser doesn\'t support geolocation.');
}

function handledata(obj) {
	var infoWindow; 
	var marker;
	var firstrun = false;

	var pos = {
	        //lat: obj.lat + (Math.random() / 1000),
	        //lng: obj.lon + (Math.random() / 1000)

	        lat: obj.lat ,
	        lng: obj.lon 
		};

		

	    var color = "";
	    var markericon = "";
	    if ((obj.heartRate) < 70 ) {
	    		color = "gray";
	    		markericon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
	    } else if ((obj.heartRate) >= 70 & (obj.heartRate) < 100 ) {
	    		color = "green"
	    		markericon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
	    } else if ((obj.heartRate) >= 100 ) {
	    		color = "red"
	    		markericon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
	    }

	    var intensitycolor = "";
	    if ((obj.intensity) < 30 ) {
	    		intensitycolor = "gray";
	    } else if ((obj.intensity) >= 30 & (obj.intensity) < 80 ) {
	    		intensitycolor = "green"
	    } else if ((obj.intensity) >= 80 ) {
	    		intensitycolor = "red"
	    }

	    var fid = "";
	    if(obj.mac == "C8:0F:10:11:FE:24")  {
	    	fid = "100001091792149";
	    } else if (obj.mac == "C8:0F:10:37:43:F6") {
	    	fid = "1823927411";
	    } else if (obj.mac == "C8:0F:10:37:47:90") {
	    	fid = "100002472483336";
	    } else if (obj.mac ==　"C8:0F:10:37:44:A8" || obj.mac ==　"C4:88:E5:A5:30:E2") {
	    	fid = "100002174641112";
	    }
	

	//get last data	
	if (!userData[obj.mac]) {
		//infoWindow = new google.maps.InfoWindow({map: map});
		//userData[obj.mac + "info"] = infoWindow;
		firstrun = true;
		marker = new google.maps.Marker({map: map,draggable: true , animation: google.maps.Animation.DROP , icon:markericon});
		userData[obj.mac + "marker"] = marker;
		
		marker.addListener('click', (function(mac,m_marker) {		
		    //infowindow.open(map, marker);
		    return function() {		    	
		    	var info = new google.maps.InfoWindow({map: map, content: userData[mac + "content"] });
		    	userData[obj.mac + "info"] = info;
		    	//info.setPosition(m_marker.getPosition());
		    	info.open(map, m_marker);
		    }
		})(obj.mac,marker));

	} else {
		infoWindow = userData[obj.mac + "info"];
		marker = userData[obj.mac + "marker"];
	}

		userData[obj.mac] = obj;

		

	    if (obj.data != undefined && obj.data.length > 0) {

		    var lastdata = obj.data[obj.data.length -1];
		    if (lastdata != undefined) {
			    marker.setPosition(pos);
			    var catvalue = categorymap[lastdata.category];
			    if (catvalue == undefined)
			    	catvalue = lastdata.category;

			    var content = "<img style='float:left;margin-right:5px;width:50px;weight:50px' src='//graph.facebook.com/" + fid +"/picture'><div style='float:right'>Heart:<b><font color='"+ color  + "'>" + obj.heartRate + "</font></b>,todaysteps:" + obj.todaysteps + ",nightsleep:" + Number(obj.nightsleep / 60).toFixed(1)  + ",category:" + catvalue + ",intensity:<b><font color='" + intensitycolor + "'>" + lastdata.intensity + "</font></b>,Battery:" + obj.battery + "<br>Weight:" + obj.weight  + "," + lastdata.timestampstr + "</div>";
			    
			    userData[obj.mac + "content"] = content;

			    if (firstrun) {
			    	new google.maps.event.trigger( marker, 'click' );
			    } else {
			    	if (infoWindow != undefined)
			    		infoWindow.setContent(content);
			    	
			    	marker.setIcon(markericon);
			    }
		    }
		    //infoWindow.setContent(content);
		   // infoWindow.setPosition(pos);
		    //infowindow.open(map, marker);
	    //infoWindow.open();
	    }
   
}

function initPubNub() {
	// Initialize the instance
	 
	var pubnub = PUBNUB.init({
	    publish_key: 'pub-c-93f82346-2f2b-46bd-a173-89ba916317f9',
	    subscribe_key: 'sub-c-1b3bcd60-0322-11e6-b552-02ee2ddab7fe',
	    error: function (error) {
	        console.log('Error:', error);
	    }
	})

	pubnub.subscribe({
    channel: 'healthmap',
    message: function(m){
    	handledata(m);console.log(m)},
    error: function (error) {
      // Handle error here
      console.log(JSON.stringify(error));
    }
 });

  pubnub.history({
     channel: 'healthmap',
     callback: function(m){console.log(m);m[0].forEach(function(data) {handledata(data)});},
     count: 20, // 100 is the default
     reverse: false // false is the default
  });

}