var express = require('express');
var child_process = require('child_process');
const bodyParser = require("body-parser");
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json(swagger);
});

router.get('/config', function(req, res, next) {
  res.json(config);
});

router.get('/temperature', function(req, res, next) {
  rClient.get("temperature", function(err, reply) {
    if (err) {
      res.json(err);
    } else {

      if (reply == null) {
        res.json({});
      } else {
        res.json(JSON.parse(reply));
      }

    }

  });
});

router.get('/fanspeed', function(req, res, next) {
  rClient.get("fanspeed", function(err, reply) {
    if (err) {
      res.json(err);
    } else {

      if (reply == null) {
        res.json({});
      } else {
        res.json(JSON.parse(reply));
      }

    }

  });
});

router.get('/fan', function(req, res, next) {
  rClient.get("fan", function(err, reply) {
    if (err) {
      res.json(err);
    } else {

      if (reply == null) {
        res.json({});
      } else {
        res.json(JSON.parse(reply));
      }

    }

  });
});

router.post('/fan', function(req, res, next) {

  var stateBody = req.body;
  var date = new Date();

  stateBody.timestamp = date.toISOString();

  if (stateBody.state == "on") {
    child_process.exec('python /home/pi/moneypit-fan-controller/scripts/set-fan-relay-state-on.py /home/pi/moneypit-fan-controller/config.json', function (err, stdout, stderr) {
      console.log(err);
      console.log(stdout);
      console.log(stderr);
    });
  }

  if (stateBody.state == "off") {
    child_process.exec('python /home/pi/moneypit-fan-controller/scripts/set-fan-relay-state-off.py /home/pi/moneypit-fan-controller/config.json', function (err, stdout, stderr) {
      console.log(err);
      console.log(stdout);
      console.log(stderr);
    });
  }

  rClient.set("fan", JSON.stringify(stateBody), function(err, reply) {
    if (err) {
      res.json(err);
    } else {
      if (reply == 'OK') {
        rClient.save();
        res.json(stateBody);
      }
    }

  });
});

module.exports = router;
