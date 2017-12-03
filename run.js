var app = require('./app');

if(process.argv[2] == undefined) {
    console.log('Missing arguments. Usage: node run.js [carrier]')
    process.exit();
}
app.runDynamoUpdate(null, process.argv[2]);