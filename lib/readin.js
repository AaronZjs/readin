/*
读取远程文件到指定路径并提供回调
@params:{
    @picUrl:"远程文件",
    @targetFolder:"存储目录",
    @callback:"回调"
}
*/

module.exports = function (picUrl,targetFolder,callback){
    callback = callback || function () {};

    var http = require('http');
    var url = require('url');
    var fs = require('fs');
    var path = require('path');

    //解析链接
    var urlData = url.parse(picUrl);

    //爬虫配置
    var options = {
        hostname:urlData.host,
        port:urlData.port,
        path:urlData.pathname,
        method:'GET'
    };

    //爬虫
    var req = http.request(options,function(res){
        if(res.statusCode != 200){
            console.log("readin failer : " + picUrl);
            return callback(new Error("readOnlineFile 404 request at " + picUrl + " "),null);
        }
        var resultBuffer = new Buffer(res.headers["content-length"] * 1 + 2);
        var buffers = [];

        res.on('data',function (chuck){
          if(res.statusCode == 200){
              buffers.push(new Buffer(chuck));
          }
        });

        res.on('end',function(){
            var i = 0, size = buffers.length, pos = 0;
            for (i = 0; i < size; i++){
                buffers[i].copy(resultBuffer, pos);
                pos += buffers[i].length;
            }
            var targetFile = path.join(targetFolder,path.basename(urlData.pathname));
            
            fs.writeFile(targetFile, resultBuffer, function (e) {
                if (e) {
                    console.log("readin failer : " + picUrl);
                    return callback(new Error("readOnlineFile write file error: " + e.message + " "),null);
                }
                console.log("readin success : " + picUrl);
                callback(null, {
                    targetFile: targetFile,
                    picUrl: picUrl
                });
            });
        });
    });

    //结束
    req.end();
}