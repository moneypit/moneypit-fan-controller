import sys
import Adafruit_DHT
import redis
import json
import datetime

# Load config
with open(sys.argv[1]) as f:
    config = json.load(f)

# Instantiate redis client
rClient = redis.Redis(config['redis']['host'],config['redis']['port'])

sensor = config['temp']['sensor']
pin = config['temp']['pin']

temperatureObject = {}

temperatureObject['timestamp'] = datetime.datetime.now().isoformat()
temperatureObject['humidity'], temperatureObject['temperatureC'] = Adafruit_DHT.read_retry(sensor, pin)
temperatureObject['temperatureF'] = (temperatureObject['temperatureC'] * 1.8) + 32

if temperatureObject['humidity'] is not None and temperatureObject['temperatureC'] is not None:
    rClient.set('temperature',json.dumps(temperatureObject))
    rClient.save()
