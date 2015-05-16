var BGPage = chrome.extension.getBackgroundPage();

document.addEventListener('DOMContentLoaded', function() {
    var OpenTwitter = document.getElementById('OpenTwitter');
	var OpenApple = document.getElementById('OpenApple');
	var OpenMobile01 = document.getElementById('OpenMobile01');
	var OpenFb = document.getElementById('OpenFb');
	
	OpenTwitter.addEventListener('click', function() {
        chrome.windows.create({ url: 'http://104.155.234.188/?b=twitter&f=e&m=n&a=1', width: 420, height: 230, type: 'panel'});	
    });
	
	OpenApple.addEventListener('click', function() {
        chrome.windows.create({ url: 'http://104.155.234.188/?b=apple&m=n&a=1&z=1.2', width: 420, height: 230, type: 'panel'});	
    });
	
	OpenMobile01.addEventListener('click', function() {
        chrome.windows.create({ url: 'http://104.155.234.188/?b=mobile01&m=n&a=1&z=1.2', width: 420, height: 230, type: 'panel'});	
    });
	
	OpenFb.addEventListener('click', function() {
        chrome.windows.create({ url: 'http://104.155.234.188/?b=fb&m=n&a=1&z=1.2', width: 420, height: 230, type: 'panel'});	
    });
});

