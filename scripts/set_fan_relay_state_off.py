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

GPIO.output(24, GPIO.LOW)
