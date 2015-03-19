var request = require('request'),
	htmlToText = require('html-to-text');
	//var args = process.argv.slice(2);
	var url = "https://tw.news.yahoo.com/%E6%94%B6%E8%B2%BB%E5%93%A1%E8%A8%B4%E6%B1%82%E8%8B%A5%E5%87%86-%E5%85%A8%E6%B0%91%E8%B2%B7%E5%96%AE26%E5%84%84-113400605.html";
	
	//request.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
	//request.setHeader('accept', 'text/html,application/xhtml+xml');
  
/*	var options = {
    url: 'http://www.nownews.com/n/2015/03/17/1632229',
    headers: {
        'user-agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
    }
	};
	 
	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			//console.log(body);
			var data = extractor(body);
			console.log("text:" + data.text);
		}
	}
	 
	request(options, callback);*/

	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		//console.log(body) // Show the HTML for the Google homepage. 
		//var data = extractor(body,'zh');
		//console.log("title:" + data.title);
		//console.log("text:" + data.text);
		//console.log("lang :" + data.lang);
		
		var text = htmlToText.fromString(body, {
			wordwrap: 130
		});
		console.log(text);
		
		var linebreak = text.split("\n\n");
		//console.log("linebreak:" + linebreak.length);
		
		for (var i = 0 ; i < linebreak.length ; i ++) {
			console.log("linebreak:" + i + ":" + linebreak[i]);
		}
	  }
	});