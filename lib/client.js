var net = require( 'net' )
var network = require( 'network' )
var PCP = require( './pcp' )
var UDP = require( 'dgram' )
var inherit = require( 'bloodline' )
var Emitter = require( 'async-emitter' )

/**
 * Client constructor
 * @returns {Client}
 */
function Client() {
  
  if( !(this instanceof Client) )
    return new Client()
  
  Emitter.call( this )
  
  // @type {Object} str private:public -> mapping
  this.mappings = {}
  
  this.interface = null
  // TODO: Bind sockets in `listen()` method
  this.socket = null
  this.recv = UDP.createSocket( 'udp4' )
  this.recv.bind( PCP.CLIENT_PORT, function() {
    this.setMulticastTTL( 128 )
    this.addMembership( PCP.IPv4 )
  })
  
  this.recv.on( 'error', function( error ) {
    // TODO: Figure out why this happens on OS X
    // and figure out if there's a way to do PCP
    // if the PCP.CLIENT_PORT is bound to something else 
    console.log( 'Could not bind receiver socket' )
    console.log( error.message )
  })
  
  this.recv.on( 'message', function( msg, info ) {
    // TODO: Handle incoming messages
    console.log( 'RECV Message from', info )
    console.log( msg.toString( 'hex' ).toUpperCase() )
  })
  
}

/**
 * Client prototype
 * @type {Object}
 */
Client.prototype = {
  
  constructor: Client,
  
  connect: function( gateway, callback ) {
    
    var self = this
    
    if( gateway != null && !net.isIP( gateway ) )
      throw new TypeError( 'Invalid gateway address' )
    
    callback = typeof callback === 'function' ?
      callback.bind( this ) : function() {}
    
    // TODO: Don't ignore `gateway` argument
    // (or remove it altogether)
    network.get_active_interface( function( error, info ) {
      
      if( error != null ) {
        self.emit( 'error', error )
        return callback( error )
      }
      
      self.interface = info
      self.socket = UDP.createSocket( 'udp4' )
      self.socket.on( 'message', function( msg, info ) {
        console.log( 'SOCK Message from', info )
        console.log( msg.toString( 'hex' ).toUpperCase() )
      })
      self.socket.on( 'error', callback )
      self.socket.on( 'listening', function() {
        self.emit( 'connect', self.interface )
        callback( null, self.interface )
      })
      
      self.socket.bind()
      
    })
    
    return this
    
  },
  
  map: function( internal, external, callback ) {
    
    // Client address
    var address = this.interface.ip_address
    
    // Create a new mapping request detail
    var mapping = new PCP.Mapping()
        mapping.internal = internal
        mapping.external = external
        mapping.address = address
        mapping.generateNonce()
    
    var request = new PCP.Request( PCP.MAP, address )
        request.lifetime = 10
        request.data = mapping
    
    this.socket.send(
      request.slice(), 0,
      request.length,
      PCP.SERVER_PORT,
      this.interface.gateway_ip
    )
    
    return request
    // ...
    // callback.call( this, mapping )
  },
  
  unmap: function( mapping, callback ) {
    // ...
  },
  
  peer: function( local, remote, callback ) {
    // ...
  },
  
  listen: function( callback ) {
    // ...
  },
  
  _reset: function( mapping ) {
    
    // Reset retransmission count
    mapping._retransmissions = 0
    
    // Reset RT to a value randomly selected from
    // range 1/2 to 5/8 of the mapping lifetime
    mapping._retransmissionTimeout = Mapping.RAND(
      (1/2) * mapping.lifetime,
      (5/8) * mapping.lifetime
    )
    
    // Reset timeout
    // clearTimeout( mapping._timeout )
    // mapping._timeout = null
    
    return mapping
    
  }
  
}

inherit( Client, Emitter )
// Exports
module.exports = Client
