var PCP = require( './pcp' )
var inherit = require( 'derive' ).inherit

/**
 * Response constructor
 * @returns {Response}
 */
function Response( opcode, data, options ) {
  
  if( !(this instanceof Response) )
    return new Response( opcode, data, options )
  
  // TODO: Avoid zero-filling to PCP.MAX_PAYLOAD_LENGTH,
  // build buffer from parts dynamically, accessible
  // through a `.toBuffer()` method or something
  Buffer.call( this, 1100 )
  this.fill( 0 )
  
  this.version = PCP.VERSION
  
  // Setting the opcode here, to force
  // setting of the PCP.RESPONSE type flag
  this.opcode = 0
  
}

/**
 * Response prototype
 * @type {Object}
 */
Response.prototype = {
  
  constructor: Response,
  
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
    this.writeUInt8( value | 0x08, 1 )
  },
  
  get result() {
    return this.readUInt8( 1 ) & 0x07
  },
  
  set result( value ) {
    this.writeUInt8( value & 0x07, 1 )
  },
  
  get lifetime() {
    return this.readUInt32BE( 4 )
  },
  
  set lifetime( value ) {
    this.writeUInt32BE( value, 4 )
  },
  
  get epoch() {
    return this.readUInt32BE( 8 )
  },
  
  set epoch( value ) {
    this.writeUInt32BE( value, 8 )
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
    
  },
  
}

inherit( Response, Buffer )
// Exports
module.exports = Response
