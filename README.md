# Port Control Protocol (PCP)
[![npm](http://img.shields.io/npm/v/net-pcp.svg?style=flat-square)](https://npmjs.com/net-pcp)
[![npm](http://img.shields.io/npm/l/net-pcp.svg?style=flat-square)](https://npmjs.com/net-pcp)
[![npm downloads](http://img.shields.io/npm/dm/net-pcp.svg?style=flat-square)](https://npmjs.com/net-pcp)
[![build status](http://img.shields.io/travis/jhermsmeier/node-net-pcp.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-net-pcp)

## Install via [npm](https://npmjs.com)

```sh
$ npm install net-pcp
```

## ATTENTION: Work in progress. DO NOT use.

The Port Control Protocol (PCP) is a computer networking protocol that allows hosts on IPv4 or IPv6 networks to control how the incoming IPv4 or IPv6 packets are translated and forwarded by an upstream router which performs Network Address Translation (NAT) or packet filtering. By allowing hosts to create explicit port forwarding rules, handling of the network traffic can be easily configured to make hosts placed behind NATs or firewalls reachable from the rest of the Internet (so they can also act as network servers), which is required by many applications.

Additionally, PCP makes it possible for hosts to reduce the amount of generated traffic by eliminating outgoing NAT keepalive messages, which are required for maintaining connections to servers, and for various NAT traversal techniques such as TCP hole punching; explicit port forwarding rules make such workarounds unnecessary.

> Source: [Wikipedia](http://en.wikipedia.org/wiki/Port_Control_Protocol)

## Caution

PCP, as the successor of the NAT Port Mapping Protocol ([RFC 6886]), uses ports `5350` and `5351`, previously assigned by IANA to NAT-PMP.
IANA has reassigned those ports to PCP. Thus caution is advised in environments where both, PCP and PMP might be present.

## Usage

```js
// Require PCP
var PCP = require( 'pcp' )
// Create a new client
var client = new PCP.Client()
// Request a port mapping
client.map(
  { public: 2222, private: 22 },
  function( err, response ) {
    // ...
  }
)
```

[RFC 6886]: http://tools.ietf.org/html/rfc6886
[RFC 6887]: https://tools.ietf.org/html/rfc6887
