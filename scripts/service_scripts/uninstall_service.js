var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Unicorn Auto Staker',
  description: 'Automatically stake and unstake your Crypto Unicorns to/from the Dark Forest',
  script: 'C:\\development\\bitkraft\\dark_forest_auto_staker\\scripts\\auto_staker.js',
  nodeOptions: [
    '--experimental-json-modules'
  ]
  //, workingDirectory: '...'
  //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('uninstall',function(){
  console.log('uninstall complete')
});

svc.uninstall();