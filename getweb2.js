var readability = require('readability-api');
 
readability.configure({   
    parser_token: '00bcb3c60dbbdf583db06f8dee1a5040a9d0a044'
});

var parser = new readability.parser();
 
// Parse an article 
parser.parse('https://tw.news.yahoo.com/%E9%87%8B%E6%98%AD%E6%85%A7%E7%A5%9D%E5%8C%97%E5%B8%82%E6%B0%B8%E7%84%A1%E7%81%BD%E9%9B%A3-%E6%9F%AFp%E5%9B%9E%E9%98%BF%E5%BD%8C%E9%99%80%E4%BD%9B-004205718.html', function (err, parsed) {

  console.log(parsed.content);
});