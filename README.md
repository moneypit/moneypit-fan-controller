# moneypit-fan-controller

Used to control / monitor fan operations.  Designed to run on a Raspberry Pi 3+ with the following sensors / controls:

- DHT22 Temperature sensor (https://www.amazon.com/dp/B0795F19W6)
- Hall sensor to measure fan RPM (tbd)
- Relay to turn fan on / off (https://www.amazon.com/gp/product/B07C3YMFVJ)


## Dependencies

- Redis `sudo apt-get install redis-server`
- Node `sudo apt-get install npm`
- PHP CLI `sudo apt-get install php7.0-cli`
- PHP Curl `sudo apt-get install php7.0-curl`
- A remote `elasticsearch` to post stats to

## Install

- Clone repo

- Rename `config_sample.json` to `config.json`

- Update config (as necessary) to define PINs where sensors / relay are attached:

```

{
  "device": "moneypit-fan-name",
  "location": "moneypitmine",
  "elasticsearch": {
    "hosts": [
      "https://elastic:xxx.us-east-1.aws.found.io:9243"
    ],
    "stats_index": "mp-fan-name-stats",
    "log_index": "mp-fan-name-logs"
  },
  "redis": {
    "host": "localhost",
    "port": "6379"
  },
  "temp": {
    "sensor": 22,
    "pin": "4"
  },
  "hall": {
    "pin": 14
  },
  "relay": {
    "pin": 24
  }
}

```

- Configure node / redis to start on reboot using `/etc/rc.local`

```

	#!/bin/sh -e
	#
	# rc.local
	#
	# This script is executed at the end of each multiuser runlevel.
	# Make sure that the script will "exit 0" on success or any other
	# value on error.
	#
	# In order to enable or disable this script just change the execution
	# bits.
	#
	# By default this script does nothing.

	# Print the IP address
	_IP=$(hostname -I) || true
	if [ "$_IP" ]; then
	  printf "My IP address is %s\n" "$_IP"
	fi

	# Start redis-server
	sudo /home/pi/redis/src/redis-server /home/pi/redis/redis.conf &

	# Start moneypit-fan-controller node app / api
	sudo /usr/bin/npm start --prefix /home/pi/moneypit-fan-controller &
	exit 0

```

- Setup the following cron jobs:

```

* * * * * python /home/pi/moneypit-fan-controller/scripts/fetch-temp.py /home/pi/moneypit-fan-controller/config.json
* * * * * python /home/pi/moneypit-fan-controller/scripts/fetch-fan-speed.py /home/pi/moneypit-fan-controller/config.json
* * * * * python /home/pi/moneypit-fan-controller/scripts/set-fan-relay-state.py /home/pi/moneypit-fan-controller/config.json
* * * * * php /home/pi/moneypit-fan-controller/scripts/post-stats.php

```

## APIs

`GET /` => Swagger docs

`GET /fanspeed` => Returns current fan speed and last time speed was captured

`GET /temperature` => Returns temperature details and last temp details was captured

`GET /fan` => Returns current state of fan relay (on / off)

`POST /fan` => Changes state of fan relay
  - post JSON body `{"state": "on"}` to turn on
  - post JSON body `{"state": "off"}` to turn off
