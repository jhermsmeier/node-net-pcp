var PCP = require( './pcp' )
var net = require( 'net' )
var ip = require( 'ipaddr.js' )
var inherit = require( 'derive' ).inherit

/**
 * Request constructor
 * @returns {Request}
 */
function Request( opcode, address ) {
  
  if( !(this instanceof Request) )
    return new Request( opcode, address )
  
  // TODO: Avoid zero-filling to PCP.MAX_PAYLOAD_LENGTH,
  // build buffer from parts dynamically, accessible
  // through a `.toBuffer()` method or something
  Buffer.call( this, 1100 )
  this.fill( 0 )
  
  this.version = PCP.VERSION
  
  if( opcode != null )
    this.opcode = opcode
  
  if( address != null )
    this.address = address
  
}

/**
 * Request prototype
 * @type {Object}
 */
Request.prototype = {
  
  constructor: Request,
  
  get version() {
    return this.readUInt8( 0 )
  },
  
  set version( value ) {
    this.writeUInt8( value, 0 )
  },
  
  get opcode() {
    return this.readUInt8( 1 ) & 0x07
  },
  
  set opcode( value ) {
    this.writeUInt8( value & 0x07, 1 )
  },
  
  get lifetime() {
    return this.readUInt32BE( 4 )
  },
  
  set lifetime( value ) {
    this.writeUInt32BE( value, 4 )
  },
  
  get address() {
    return ip.parse( this.slice( 8, 8 + 16 ) )
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
    
    new Buffer( addr ).copy( this, 8 )
    
  },
  
  get data() {
    
    var offset = 24
    
    switch( this.opcode ) {
      case PCP.MAP:
        var mapping = new PCP.Mapping()
        this.copy( mapping, 0, offset, offset + PCP.Mapping.SIZE )
        break
      case PCP.PEER:
        var peer = new PCP.Peer( data )
        this.copy( peer, 0, offset, offset + PCP.Peer.SIZE )
        break
      case PCP.ANNOUNCE:
        return null
        break
    }
    
  },
  
  set data( value ) {
    var offset = 24
    value.copy( this, offset )
  },
  
  get options() {
    
    var offset = 24 + this.data.length
    var length = this.length
    var opt, options = []
    
    while( offset < length ) {
      opt = {}
      opt.code = this.readUInt8( offset )
      opt.length = this.readUInt16BE( offset + 2 )
      opt.data = this.slice( offset += 4, offset += opt.length )
      options.push( opt )
    }
    
    return opt
    
  },
  
  set options( value ) {
    var offset = 24 + this.data.length
  },
  
}

inherit( Request, Buffer )
// Exports
module.exports = Request
