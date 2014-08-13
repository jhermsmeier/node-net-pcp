var PCP = module.exports

// Port Control Protocol version
PCP.VERSION = 2

// Message Types
PCP.REQUEST = 0
PCP.RESPONSE = 1

// Maximum UDP packet length; 1100 octets
PCP.MAX_PAYLOAD_LENGTH = 1100

// Opcodes
PCP.ANNOUNCE = 0
PCP.MAP      = 1
PCP.PEER     = 2

// Result Codes
PCP.SUCCESS                 = 0
PCP.UNSUPP_VERSION          = 1
PCP.NOT_AUTHORIZED          = 2
PCP.MALFORMED_REQUEST       = 3
PCP.UNSUPP_OPCODE           = 4
PCP.UNSUPP_OPTION           = 5
PCP.MALFORMED_OPTION        = 6
PCP.NETWORK_FAILURE         = 7
PCP.NO_RESOURCES            = 8
PCP.UNSUPP_PROTOCOL         = 9
PCP.USER_EX_QUOTA           = 10
PCP.CANNOT_PROVIDE_EXTERNAL = 11
PCP.ADDRESS_MISMATCH        = 12
PCP.EXCESSIVE_REMOTE_PEERS  = 13

// Initial retransmission timeout; 3 seconds
PCP.IRT = 3 * 1000
// Maximum retransmission count (0 = no maximum)
PCP.MRC = 0
// Maximum retransmission timeout; 1024 seconds
PCP.MRT = 1024 * 1000
// Maximum retransmission duration (0 = no maximum)
PCP.MRD = 0

/**
 * PCP IANA Protocol Numbers
 * NOTE: only protocols with 16 bit port numbers are supported
 * FIXME: These might be incomplete / or just plain wrong
 * @see http://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml
 * @type {Object}
 */
PCP.PROTOCOL = {
  ANY: 0,
  DCCP: 33,
  IL: 40,
  MTP: 92,
  SCTP: 132,
  TCP: 6,
  TLSP: 56,
  UDP: 17,
  UDPLITE: 136,
  XTP: 36,
}

PCP.IPv4 = '224.0.0.1'
PCP.IPv6 = '[ff02::1]'

// PCP uses ports 5350 and 5351,
// previously assigned by IANA to NAT-PMP.
// IANA has reassigned those ports to PCP.
PCP.CLIENT_PORT = 5350
PCP.SERVER_PORT = 5351

/**
 * Retransmittion timeout randomization
 * parameter, according to RFC 6887
 * @param {Number} min
 * @param {Number} max
 */
PCP.rand = function( min, max ) {
  min = min || -0.1
  max = max || 0.1
  return min + ( Math.random() * ( max - min ))
}

/**
 * Client retransmission behavior timeout,
 * according to RFC 6887
 * @param {Number} prc
 */
PCP.timeout = function( prc ) {
  // Previous retransmission timeout
  prc = prc || 0
  // RT value is initialized based on IRT:
  var RT = ( 1 + PCP.rand() ) * PCP.IRT
  // RT for each subsequent message transmission
  if( prc > 0 ) {
    RT = ( 1 + PCP.rand() ) * Math.min( 2 * prc, PCP.MRT || Infinity )
  }
  // Clamp to maximum retransmission timeout
  return Math.min( RT, PCP.MRT || Infinity )
}

PCP.Request = require( './request' )
PCP.Response = require( './response' )
PCP.Mapping = require( './mapping' )
PCP.Peer = require( './peer' )
PCP.Client = require( './client' )

PCP.connect = function( gateway, callback ) {
  return new PCP.Client()
    .connect( gateway, callback )
}
