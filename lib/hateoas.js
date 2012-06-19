var request = require('request')

var nozbe = module.exports = function Hateoas(options, callback){
  request(options.base, function(err, resp, body){
    if(!err) {
      var json = JSON.parse(body)
      json.collection.links.forEach(function(link){
        this[link.rel] = function(/* [id], [body], [cb] */){
          var id, body, cb
          var args = Array.prototype.slice.call(arguments).map(function(arg){
            return typeof arg
          }).join(',')

          switch(args){
            case 'string,function':
              var id = arguments[0]
            case 'function':
              var cb = arguments[arguments.length-1]
              break;
            case 'object,function':
              var cb = arguments[1]
            case 'object':
              var body = arguments[0]
              break;
            case 'string,object,function':
              var cb = arguments[2]
            case 'string,object':
              var body = arguments[1]
            case 'string':
              var id = arguments[0]
              break;
          }

          var uri = link.href
          if(id) uri = uri +'/'+ id

          request(uri, function(err, resp, body){
            if(cb) cb(body)
          })
        }
      })
    }
    if(callback) callback(err)
  })
};


nozbe.lol = "LULZ"
