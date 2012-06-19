var http = require('http')
  , events = require('events')

var timeoutID, timeout = function(server){ return setTimeout(function(){ server.close() }, 100) }

module.exports = {
  create : function(port, cb){
    var server = http.createServer(function(req, res){
      server.emit(req.url, req, res)
    })
    server.listen(port, cb)
    timeoutID = timeout(server)
  },

  response : function(text, statusCode){
    return function(req, resp){
      if(req.method == 'PUT'){
        req.on('end', function () {
          resp.writeHead(201, {'content-type':'application/json'});
          resp.write(text);
          resp.end();
        })
      } else {
        resp.writeHead(typeof statusCode === 'number' ? statusCode : 200, {'content-type':'application/json'});
        resp.write(text);
        resp.end();
      }

      clearTimeout(timeoutID)
      timeoutID = timeout(this)
    }
  }
}
