<?php

require 'Slim/Slim.php';
require 'Slim/config.php';

$app = new Slim();

$app->get('/summary', function () {
  $sql = "SELECT " .
    "ROUND(AVG(miles)/AVG(gallons), 2) as avg_mpg, " .
    "ROUND(AVG(gallons)*AVG(price)/AVG(miles), 2) as avg_mile_cost, " .
    "ROUND(SUM(miles), 2) as total_miles " .
    "FROM mileage";
  try {
    $db = getConnection();
    $query = $db->query($sql);
    $gas = $query->fetchObject();
    $db = null;
    echo json_encode($gas);
  } catch(PDOException $e) {
    echo '{"error":{"text":' . $e->getMessage() . '}}';
  }
});



$app->get('/mileage', function () {
  $sql = "SELECT id, "  . 
    "date, " .
    "DATE_FORMAT(date, '%W, %b %D, %Y') as prettyDate, " .
    "gallons, " .
    "miles, " .
    "price, " .
    "ROUND(miles/gallons, 2) as mpg, " .
    "ROUND(gallons*price/miles, 2) as mile_cost, " .
    "ROUND(gallons*price, 2) AS total_cost " .
    "FROM mileage " .
    "ORDER BY date";
  try {
    $db = getConnection();
    $query = $db->query($sql);
    $gas = $query->fetchAll(PDO::FETCH_OBJ);
    $db = null;
    echo json_encode($gas);
  } catch(PDOException $e) {
    echo '{"error":{"text":' . $e->getMessage() . '}}';
  }
});

$app->get('/mileage/:id', function($id) {
  $sql = "SELECT * FROM mileage WHERE id=:id";
  try {
    $db = getConnection();
    $query = $db->prepare($sql);
    $query->bindParam("id",$id);
    $query->execute();
    $gas = $query->fetchObject();
    $db = null;
    echo json_encode($gas);
  } catch(PDOException $e) {
    echo '{"error":{"text":' . $e->getMessage() . '}}';
  }
});

$app->post('/mileage', function() {
  $request = Slim::getInstance()->request();
  $mileage = json_decode($request->getBody());
  $sql = "INSERT INTO mileage (date, gallons, miles, price) " .
         "VALUES (:date, :gallons, :miles, :price)";
  try {
    $db = getConnection();
    $query = $db->prepare($sql);
    $query->bindParam("date", $mileage->date);
    $query->bindParam("gallons", $mileage->gallons);
    $query->bindParam("miles", $mileage->miles);
    $query->bindParam("price", $mileage->price);
    $query->execute();
    $mileage->id = $db->lastInsertId();
    $db = null;
    echo json_encode($mileage); 
  } catch(PDOException $e) {
    echo '{"error":{"text":' . $e->getMessage() . '}}';
  }
});

$app->put('/mileage/:id', function($id) {
  $request = Slim::getInstance()->request();
  $body = $request->getBody();
  $miles = json_decode($body);
  $sql = "UPDATE mileage SET date=:date, gallons=:gallons, miles=:miles, price=:price WHERE id=:id";
  try {
    $db = getConnection();
    $query = $db->prepare($sql);
    $query->bindParam("date", $miles->date);
    $query->bindParam("gallons", $miles->gallons);
    $query->bindParam("miles", $miles->miles);
    $query->bindParam("price", $miles->price);
    $query->bindParam("id", $id);
    $query->execute();
    $db = null;
    echo json_encode($miles); 
  } catch(PDOException $e) {
    echo '{"error":{"text":' . $e->getMessage() . '}}';
  }
});

$app->delete('/mileage/:id', function($id) {
  $sql = "DELETE FROM mileage WHERE id=:id";
  try {
    $db = getConnection();
    $query = $db->prepare($sql);
    $query->bindParam("id", $id);
    $query->execute();
    $db = null;
  } catch(PDOException $e) {
    echo '{"error":{"text":' . $e->getMessage() . '}}';
  }
});

$app->run();
