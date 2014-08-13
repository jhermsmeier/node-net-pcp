var PCP = require( '../' )

var client = new PCP.Client()

console.log( client )

function run() {
  console.log( '[MAP]', client.map( 22, 2222 ) )
  run.delay = PCP.timeout( run.delay )
  console.log( '[NEXT]', run.delay )
  setTimeout( run, run.delay )
}

run.delay = 0

client.connect( null, function( error, info ) {
  console.log( '[CONNECT]', error || info )
  run()
})
