<?php

function getConfig() {
  $config = array(
    "db" => array(
      "user" => 'guzzlr_usr',
      "pass" => '8VdVyQpwDR3KBGtU',
      "host" => 'localhost',
      "dbname" => 'guzzler'
    )  
  );

  return $config;
}

function getConnection() {
  $config = getConfig();
  $db = $config['db'];
  
  $user = $db['user'];
  $pass = $db['pass'];
  $host = $db['host'];
  $dbname = $db['dbname'];

  $dbc = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);  
  return $dbc;
}
