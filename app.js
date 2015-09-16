var http = require('http'),
	querystring = require('querystring');
// this is difficute
/**
* 载入控制器
* @function loadControllers
* @param {Obj} opt 请求选项 host 和 port
* @param {Function} cb 回调函数 传入参数controllers
*/
function loadControllers(opt, cb){
	sendRequrest({
		host:opt.host,
		port:opt.port,
		path:'getControllers'
	},
	{},
	function(data){
		console.log(data);
		initControllers(data)
		cb(data)
	})

	/**
	* 对controllers对象进行初始化，使之具有调用远程接口的能力
	* @function init
	* @param {Object} controllers 原始的控制器对象
	*/
	function initControllers(controllers){
		controllers._path = controllers._path || '';
		for(key in controllers){
			if(key.charAt(0) === '_') continue;
			var controller = controllers[key];
			if(controller === null){
				controllers[key] = (function(){
					var path = controllers._path+'/'+key;
					return function(param,cb){
						console.log(path);
						sendRequrest(
						{
							host:opt.host,
							port:opt.port,
							path:path
						},
						param,
						cb
						)
					}
				})()
			}else{
				controller._path = controllers._path+('/'+key);
				initControllers(controller);
			}
		}
	}
}




/**
* 发送请求，采用post请求
* @function sendRequrest
* @param {Ojbect} opt 请求的选项 设置host，port，path
* @param {Object} param 请求的参数
* @param {Function} cb 传入一个data参数，表示获取的响应结果
*/

function sendRequrest(opt, param, cb){
	var _opt = {  
	    method: "POST",  
	    host: opt.host,  
	    port: opt.port,  
	    path: opt.path,  
	    headers: {} 
	};
	var req = http.request(opt, function (res) {
		var body = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk){
	        body += chunk;
	    }); 
	    res.on('end',function(chunk){
	    	body = JSON.parse(body);
	    	console.log(body)
	    	cb(body);
	    })
	});
	req.write(JSON.stringify(param));  
	req.end();
	req.on('error', function (e) {  
	    console.log('problem with request: ' + e.message);  
	});
}
// for test
sendRequrest({host:'localhost',port:4000,path:'/getControllers'},{},function(data){
	console.log(data);
})
exports.loadControllers = loadControllers;