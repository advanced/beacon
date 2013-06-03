var request = require('request');

var i=6,
v=8001;
(function callMe(i){
	console.log(i)
	if (i%2==0)
		v = 8001
	else
		v = 8002
	request.get('http://localhost:'+v+'/user?id='+i,function(err,response,body){
		console.log(body)
	})
	if(--i !=0)
		callMe(i)
})(i);


