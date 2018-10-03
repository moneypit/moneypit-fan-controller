import sys
import redis
import json
import datetime
import RPi.GPIO as GPIO

# Load config
with open(sys.argv[1]) as f:
    config = json.load(f)

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(config['relay']['pin'], GPIO.OUT)

# Instantiate redis client
rClient = redis.Redis(config['redis']['host'],config['redis']['port'])
fanstate = json.loads(rClient.get('fan'))

if fanstate['state'] == 'on':
    print 'set on'
    GPIO.output(24, GPIO.HIGH)
else:
    print 'set off'
    GPIO.output(24, GPIO.LOW)
