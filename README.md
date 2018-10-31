# moneypit-fan-controller

Used to control / monitor fan operations.  Designed to run on a Raspberry Pi 3+ with the following sensors / controls:

- DHT22 Temperature sensor (https://www.adafruit.com/product/385)
- Hall sensor to measure fan RPM (https://www.sunfounder.com/analog-hall-sensor-module.html)
- Relay to turn fan on / off (https://www.amazon.com/gp/product/B07C3YMFVJ)


## Dependencies

- Git
   `sudo apt-get install git`

- Python 2 w/ pip
  `sudo apt-get install python-pip`
  `sudo python -m pip install --upgrade pip setuptools wheel`

- Redis Server / Python Client
   `sudo apt-get install redis-server`
   `sudo pip install redis`

- Npm / Node
   `sudo apt-get install npm`
   `sudo apt-get install nodejs`

- PHP CLI / Curl
   `sudo apt-get install php7.0-cli`
   `sudo apt-get install php7.0-curl`

- Temp Sensor Python Library
  `sudo pip install Adafruit_DHT`

- Pigpio (http://abyz.me.uk/rpi/pigpio/index.html)

  ```
  rm pigpio.zip
  sudo rm -rf PIGPIO
  wget abyz.me.uk/rpi/pigpio/pigpio.zip
  unzip pigpio.zip
  cd PIGPIO
  make
  sudo make install
  ```

- A remote `elasticsearch` to post stats to

> Recommend running `sudo apt-get update` if running into issues installing dependencies

## Install

- Clone repo `git clone https://github.com/moneypit/moneypit-fan-controller`

- Rename `config_sample.json` to `config.json`

- Update config

```

{
  "device": "moneypit-fan-name",   <-- change to a unique name for your fan
  "location": "moneypitmine",      <-- change to where the fan is installed (this gets posted to Elasticsearch to help filter where devices are installed)
  "elasticsearch": {
    "hosts": [
      "https://elastic:xxx.us-east-1.aws.found.io:9243"  <-- update for your ES install
    ],
    "stats_index": "moneypit-fan-name-stats" <-- change to a unique index where the fan stats will be posted
  },
  "redis": {  <-- typically this shouldn't be changed if redis is running on the pi
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

> You should update pins if sensor is plugged into different GPIO ports than shown

- Enable `redis-server` service is start on reboot

`sudo systemctl enable redis-server`

- Configure node / redis / fan rpm monitoring script to start on reboot using `/etc/rc.local`

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

  # Start pigpiod
  sudo /usr/local/bin/pigpiod &

	# Start moneypit-fan-controller node app / api
	sudo /usr/bin/npm start --cwd /home/pi/moneypit-fan-controller --prefix /home/pi/moneypit-fan-controller &

  # Start fan speed monitor script
	sudo /usr/bin/python /home/pi/moneypit-fan-controller/scripts/fetch_fan_speed.py /home/pi/moneypit-fan-controller/config.json  &

	exit 0

```

- From within the `./moneypit-fan-controller-folder` install PHP / Node dependencies

  ```
  wget https://raw.githubusercontent.com/composer/getcomposer.org/1b137f8bf6db3e79a38a5bc45324414a6b1f9df2/web/installer -O - -q | php -- --quiet
  php composer.phar install
  npm install
  ```

- Setup the following cron jobs:

```

* * * * * python /home/pi/moneypit-fan-controller/scripts/fetch_temp.py /home/pi/moneypit-fan-controller/config.json
* * * * * python /home/pi/moneypit-fan-controller/scripts/set_fan_relay_state.py /home/pi/moneypit-fan-controller/config.json
* * * * * php /home/pi/moneypit-fan-controller/scripts/post_stats.php

```

- Set an initial state for fan

```
curl --header "Content-Type: application/json" --request POST --data '{"state":"off"}' http://localhost:3000/api/fan
```

- Reboot the device to start processes

```
sudo reboot
```

## APIs

`GET /` => Swagger docs

`GET /fanspeed` => Returns current fan speed and last time speed was captured

`GET /temperature` => Returns temperature details and last temp details was captured

`GET /fan` => Returns current state of fan relay (on / off)

`POST /fan` => Changes state of fan relay
  - post JSON body `{"state": "on"}` to turn on
  - post JSON body `{"state": "off"}` to turn off
