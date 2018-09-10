import sys
import redis
import json
import datetime
import time
import RPi.GPIO as GPIO

print("[START]")

# Load config
with open(sys.argv[1]) as f:
    config = json.load(f)

# Instantiate redis client
rClient = redis.Redis(config['redis']['host'],config['redis']['port'])

#Init Hall Count
hallCount = 0

# Init Hall Sensor
HALL = config['hall']['pin']
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(HALL,GPIO.IN, pull_up_down=GPIO.PUD_UP)

def change_detected(channel):

    if GPIO.input(HALL) == GPIO.LOW:
        global hallCount
        hallCount = hallCount + 1
GPIO.add_event_detect(HALL, GPIO.RISING, change_detected)

# Listen to hall sensor for sampleTime to determine RPM
startTime = int(time.time())
sampleDuration = 60
fanSpeed = {}

while int(time.time()) <= (startTime + sampleDuration):
        pass

print(hallCount)
print("[END]")
fanSpeed['timestamp'] = datetime.datetime.now().isoformat()
fanSpeed['rpm'] = float(hallCount) / (float(sampleDuration)/float(60))
rClient.set('fanspeed',json.dumps(fanSpeed))
rClient.save()

GPIO.cleanup()
