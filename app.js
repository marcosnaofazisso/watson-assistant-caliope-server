'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var AssistantV2 = require('watson-developer-cloud/assistant/v2'); // watson sdk

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper

var assistant = new AssistantV2({
  version: '2019-02-28'
});

var newContext = {
  global: {
    system: {
      turn_count: 1
    }
  }
};

// Endpoint to be call from the client side
app.post('/api/message', function (req, res) {
  var assistantId = process.env.ASSISTANT_ID || '<assistant-id>';
  if (!assistantId || assistantId === '<assistant-id>>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>ASSISTANT_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var contextWithAcc = (req.body.context) ? req.body.context : newContext;

  if (req.body.context) {
    contextWithAcc.global.system.turn_count += 1;
  }

  //console.log(JSON.stringify(contextWithAcc, null, 2));

  var textIn = '';

  if (req.body.input) {
    textIn = req.body.input.text;
  }

  var payload = {
    assistant_id: assistantId,
    session_id: req.body.session_id,
    context: contextWithAcc,
    input: {
      message_type: 'text',
      text: textIn,
      options: {
        return_context: true
      }
    }
  };

  // Send the input to the assistant service
  assistant.message(payload, function (err, data) {
    if (err) {
      const status = (err.code !== undefined && err.code > 0) ? err.code : 500;
      return res.status(status).json(err);
    }

    return res.json(data);
  });
});

app.get('/api/session', function (req, res) {
  assistant.createSession({
    assistant_id: process.env.ASSISTANT_ID || '{assistant_id}',
  }, function (error, response) {
    if (error) {
      return res.send(error);
    } else {
      return res.send(response);
    }
  });
});

module.exports = app;