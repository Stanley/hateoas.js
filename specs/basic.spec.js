require('./spec_helper')

describe('HATEOAS.js basics', function(){

  var server
  var options = {
    base: 'http://localhost:3000/'
  }

  beforeEach(function(){
    waitsFor(function(){
      return server
    }, 'Server should be created', 1000)
  })

  describe('Initialization', function(){

    Server.create(3000, function(){ 
      this.once('/', Server.response(JSON.stringify({
        collection: {
          links: [
            {'rel': 'books', 'href': 'http://localhost:3000/books'}
          ]
        }
      })))

      server = this
    })

    var api
    new Hateoas(options, function(){ api = this })

    beforeEach(function(){
      waitsFor(function(){ return api }, 'initialization', 1000)
    })

    it('should define links as functions', function(){
      expect(typeof api.books).toBe('function')
    })

    it('should query given collection', function(){

      server.once('/books', Server.response(JSON.stringify({
        collection: {
          items: [
            {data: {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'}},
            {data: {id: 'ttt', name: 'The Two Towers', author: 'J. R. R. Tolkien'}},
            {data: {id: 'trotk', name: 'The Return of the King', author: 'J. R. R. Tolkien'}}
          ]
        }
      })))

      var result
      api.books(function(err, books){
        result = books
      })
      
      waitsFor(function(){ return result }, 'server response', 100)
      runs(function(){
        expect(result).toEqual({collection: {
          items: [
            {data: {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'}},
            {data: {id: 'ttt', name: 'The Two Towers', author: 'J. R. R. Tolkien'}},
            {data: {id: 'trotk', name: 'The Return of the King', author: 'J. R. R. Tolkien'}}
          ]
        }})
      })
    })

    it('should query given item', function(){

      server.once('/books/tfotr', Server.response(JSON.stringify({
        collection: {
          items: [
            {
              data: {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'}
            }
          ]
        }
      })))

      var result
      api.books('tfotr', function(err, book){
        result = book
      })
      
      waitsFor(function(){ return result }, 'server response', 100)
      runs(function(){
        expect(result.collection.items.length).toEqual(1)
        expect(result.collection.items[0].data).toEqual(
          {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'}
        )
      })
    })

    it('should define methods from links recursively', function(){

      server.once('/books/ttt/author', Server.response(JSON.stringify({
        collection: {
          items: [
            {id: 'jrrt', name: 'J. R. R. Tolkien'}
          ]
        }
      })))
      server.once('/books/ttt', Server.response(JSON.stringify({
        collection: {
          items: [
            {
              links: [{rel: 'author', href: 'http://localhost:3000/books/ttt/author'}]
            }
          ]
        }
      })))

      var result
      api.books('ttt', function(err, book){
        book.author(function(err, author){
          result = author
        })
      })

      waitsFor(function(){ return result }, 'server response', 100)
      runs(function(){
        expect(result.collection.items).toEqual([
          {id: 'jrrt', name: 'J. R. R. Tolkien'}
        ])
      })
    })

    it('should create items', function(){

      server.once('/books', function(req, res){
        expect(req.method).toBe('POST')
        Server.response(JSON.stringify({collection: {}}), 201).call(server, req, res)
      })

      var ok
      api.books({template: {data: []}}, function(err){
        ok = !err
      })

      waitsFor(function(){ return ok }, 'server response', 100)
    })

    it('should update items', function(){

      server.once('/books/trotk', function(req, res){
        expect(req.method).toBe('PUT')
        Server.response(JSON.stringify({collection: {}}), 201).call(server, req, res)
      })

      var ok
      api.books('trotk', {template: {data: []}}, function(err){
        ok = !err
      })

      waitsFor(function(){ return ok }, 'server response', 100)
    })
  })
})
