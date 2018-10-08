<?php
require __DIR__.'/../vendor/autoload.php';

use Elasticsearch\ClientBuilder;

// Load config
$config = json_decode(file_get_contents(__DIR__."/../config.json"),TRUE);

// Create Elasticsearch client
$esClient = ClientBuilder::create()->setHosts($config['elasticsearch']['hosts'])->build();

// Fetch Device Stats
$deviceStats = [];
$deviceStats['timestamp'] = date("c");
$deviceStats['device'] = $config['device'];
$deviceStats['location'] = $config['location'];
$deviceStats['stats']['temperature'] = json_decode(file_get_contents("http://localhost:3000/api/temperature"), TRUE);
$deviceStats['stats']['fan'] = json_decode(file_get_contents("http://localhost:3000/api/fan"), TRUE);
if ($deviceStats['stats']['fan']['state'] == "on") {
  $deviceStats['stats']['fan']['state_num'] = 1;
} else {
  $deviceStats['stats']['fan']['state_num'] = -1;
}
$deviceStats['stats']['fanspeed'] = json_decode(file_get_contents("http://localhost:3000/api/fanspeed"), TRUE);

$params = [
  'index' => strtolower($config['elasticsearch']['stats_index']),
  'type' => strtolower($config['elasticsearch']['stats_index']),
  'body' => $deviceStats
];

 $esClient->index($params);
