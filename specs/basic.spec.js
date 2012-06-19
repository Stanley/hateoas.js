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

      this.once('/books', Server.response(JSON.stringify({
        collection: {
          items: [
            {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'},
            {id: 'ttt', name: 'The Two Towers', author: 'J. R. R. Tolkien'},
            {id: 'trotk', name: 'The Return of the King', author: 'J. R. R. Tolkien'}
          ]
        }
      })))

      this.once('/books/tfotr', Server.response(JSON.stringify({
        collection: {
          items: [
            {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'}
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
      var result
      api.books(function(books){
        result = JSON.parse(books)
      })
      
      waitsFor(function(){ return result }, 'server response', 100)
      runs(function(){
        expect(result).toEqual({collection: {
          items: [
            {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'},
            {id: 'ttt', name: 'The Two Towers', author: 'J. R. R. Tolkien'},
            {id: 'trotk', name: 'The Return of the King', author: 'J. R. R. Tolkien'}
          ]
        }})
      })
    })

    it('should query given item', function(){
      var result
      api.books('tfotr', function(book){
        result = JSON.parse(book)
      })
      
      waitsFor(function(){ return result }, 'server response', 100)
      runs(function(){
        expect(result).toEqual({collection: {
          items: [
            {id: 'tfotr', name: 'The Fellowship of the Ring', author: 'J. R. R. Tolkien'}
          ]
        }})
      })
    })
  })
})
