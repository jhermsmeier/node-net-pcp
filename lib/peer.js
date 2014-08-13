var ip = require( 'ipaddr.js' )
var PCP = require( './pcp' )
var hat = require( 'hat' )
var inherit = require( 'derive' ).inherit

/**
 * Peer constructor
 * @returns {Peer}
 */
function Peer( buffer ) {
  
  if( !(this instanceof Peer) )
    return new Peer( buffer )
  
  Buffer.call( this, buffer || Peer.SIZE )
  
  this._retransmissions = 0
  this._retransmissionTimeout = PCP.timeout()
  this._timeout = null
  
  if( buffer == null ) {
    this.fill( 0 )
    this.nonce = hat( 96 )
  }
  
}

/**
 * Peer structure size
 * @type {Number} bytes
 */
Peer.SIZE = 56

/**
 * Peer prototype
 * @type {Object}
 */
Peer.prototype = {
  
  constructor: Peer,
  
  get nonce() {
    return this.toString( 'hex', 0, 12 )
  },
  
  set nonce( value ) {
    this.write( value, 0, 12, 'hex' )
  },
  
  get protocol() {
    return this.readUInt8( 12 )
  },
  
  set protocol( value ) {
    this.writeUInt8( value, 12 )
  },
  
  get internal() {
    return this.readUInt16BE( 16 )
  },
  
  set internal( value ) {
    this.writeUInt16BE( value, 16 )
  },
  
  get external() {
    return this.readUInt16BE( 18 )
  },
  
  set external( value ) {
    this.writeUInt16BE( value, 18 )
  },
  
  get address() {
    return ip.parse( this.slice( 20, 36 ) )
      .toString()
  },
  
  set address( value ) {
    
    var family = net.isIP( value )
    if( family === 0 ) {
      throw new TypeError( 'Must be a valid IP address' )
    }
    
    if( family === 4 ) {
      var addr = ip.parse( value )
        .toIPv4MappedAddress()
        .toByteArray()
    }
    
    if( family === 6 ) {
      var addr = ip.parse( value )
        .toByteArray()
    }
    
    new Buffer( addr ).copy( this, 20 )
    
  },
  
  get remote() {
    return this.readUInt16BE( 36 )
  },
  
  set remote( value ) {
    this.writeUInt16BE( value, 36 )
  },
  
  get remoteAddress() {
    return ip.parse( this.slice( 40, 56 ) )
      .toString()
  },
  
  set remoteAddress( value ) {
    
    var family = net.isIP( value )
    if( family === 0 ) {
      throw new TypeError( 'Must be a valid IP address' )
    }
    
    if( family === 4 ) {
      var addr = ip.parse( value )
        .toIPv4MappedAddress()
        .toByteArray()
    }
    
    if( family === 6 ) {
      var addr = ip.parse( value )
        .toByteArray()
    }
    
    new Buffer( addr ).copy( this, 40 )
    
  },
  
}

inherit( Peer, Buffer )
// Exports
module.exports = Peer
