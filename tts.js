var soap = require('soap');
var url = 'http://tts.itri.org.tw/TTSService/Soap_1_3.php?wsdl';

soap.createClient(url, function(err, client) {
   /*client.ConvertSimple({Account: 'KennyLee' , Password : 'kenny1222',TTSText : 'Gift of the Moon, Bane of the Spanish: The Story of Yerba Mate'}, function(err, result) {
		var resultData = result.Result.$value;
		resultData = resultData.split('&');
		var audioId = resultData[2];
		
        console.log(audioId); 
		
		
    });*/
	
	client.GetConvertStatus({Account: 'KennyLee' , Password : 'kenny1222',ConvertID : 161069}, function(err, result) {
			console.log(result);
			var resultData = result.Result.$value;
			resultData = resultData.split('&');
			console.log(resultData[4]);
	});
});