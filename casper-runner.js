require('dotenv').config({ silent: true });

if (!process.env.ASSISTANT_ID) {
  // eslint-disable-next-line
  console.warn('Skipping casper tests because ASSISTANT_ID is null');
  return;
}

var spawn = require('child_process').spawn;
var app = require('./app');
var port = 3000;

var server = app.listen(port, function () {
  // eslint-disable-next-line no-console
  console.log('Server running on port: %d', port);

  function kill(code) {
    server.close(function () {
      // eslint-disable-next-line no-process-exit
      process.exit(code);
    });
  }

  function runTests() {
    var casper = spawn('npm', ['run', 'test-integration']);
    casper.stdout.pipe(process.stdout);

    casper.on('error', function (error) {
      // eslint-disable-next-line
      console.error(error);
      server.close(function () {
        process.exit(1);
      });
    });

    casper.on('close', kill);
  }

  runTests();
});
