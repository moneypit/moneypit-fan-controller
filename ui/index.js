new Vue({
  el: '#mp-fan-controller',
  data: {
    device: '',
    location: '',
    fanspeed: 0,
    fanspeed_last_updated: '',
    fanstate: '',
    fanstate_last_updated: '',
    fantemp: 0,
    fantemp_last_updated: ''
  },

  methods: {
    turn_fan_on: function () {
      var vm = this;

      axios.post('./api/fan', {
        state: 'on'
      })
      .then(function (response) {
        vm.fanstate = response.data.state;
        vm.fanstate_last_updated = response.data.timestamp;
      });

    },

    turn_fan_off: function () {
      var vm = this;

      axios.post('./api/fan', {
        state: 'off'
      })
      .then(function (response) {
        vm.fanstate = response.data.state;
        vm.fanstate_last_updated = response.data.timestamp;
      });

    }
  },

  created () {
    var vm = this;


    axios.get('./api/config')
    .then(function (response) {
      vm.device = response.data.device;
      vm.location = response.data.location;
    })

    axios.get('./api/fanspeed')
    .then(function (response) {
      vm.fanspeed = response.data.rpm;
      vm.fanspeed_last_updated = response.data.timestamp;
    })

    axios.get('./api/fan')
    .then(function (response) {
      vm.fanstate = response.data.state;
      vm.fanstate_last_updated = response.data.timestamp;
    })

    axios.get('./api/temperature')
    .then(function (response) {
      vm.fantemp = Math.round(response.data.temperatureF * 100) / 100;
      vm.fantemp_last_updated = response.data.timestamp;
    })


  }
})
