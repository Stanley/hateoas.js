var request = require('request')

var nozbe = module.exports = function Hateoas(options, callback){
  request(options.base, function(err, resp, body){
    if(!err) {
      var metaprogram = function(link){
        this[link.rel] = function(/* [id], [body], [cb] */){
          var id, body, cb
          var args = Array.prototype.slice.call(arguments).map(function(arg){
            return typeof arg
          }).join(',')

          switch(args){
            case 'string,function':
              id = arguments[0]
            case 'function':
              cb = arguments[arguments.length-1]
              break;
            case 'object,function':
              cb = arguments[1]
            case 'object':
              body = arguments[0]
              break;
            case 'string,object,function':
              cb = arguments[2]
            case 'string,object':
              body = arguments[1]
            case 'string':
              id = arguments[0]
              break;
          }


          var uri = link.href
          if(id) uri = uri +'/'+ id

          var options = {uri: uri, method: 'GET'}

          if(body){ options.method = id ? 'PUT' : 'POST'
                    options.body = JSON.stringify(body) }

          request(options, function(err, resp, body){

            if(err){ if(cb) cb(err); return }

            var resource = JSON.parse(body)
            var collection = resource.collection
            if(id !== undefined &&
               collection.items &&
               collection.items.length === 1) {
              var item = collection.items[0]
              if(item.links) {
                item.links.forEach(function(link){
                  metaprogram.call(resource, link)
                })
              }
            }
            if(cb) cb(undefined, resource)
          })
        }
      }
      var json = JSON.parse(body)
      json.collection.links.forEach(metaprogram)
    }
    if(callback) callback(err)
  })
}
