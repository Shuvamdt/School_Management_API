import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const db = mysql
  .createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT,
  })
  .promise();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (typeof name !== "string" || typeof address !== "string") {
    return res.status(400).json({ error: "Name and address must be strings" });
  }
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: "Invalid Latitude and Longitude" });
  }

  if (latitude < -90 || latitude > 90) {
    return res
      .status(400)
      .json({ error: "Latitude must be between -90 and 90" });
  }

  if (longitude < -180 || longitude > 180) {
    return res
      .status(400)
      .json({ error: "Longitude must be between -180 and 180" });
  }
  try {
    await db.query(
      "INSERT INTO schools (name,address,latitude,longitude) VALUES (?,?,?,?)",
      [name, address, latitude, longitude]
    );
    console.log("Data uploaded successfully!");
    res.sendStatus(200);
  } catch (err) {
    console.log("Error uploading data: " + err.message);
    res.sendStatus(500);
  }
});

app.get("/listSchools", async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: "Invalid latitude or longitude" });
  }
  try {
    const [schools] = await db.query("SELECT * FROM schools");
    const schoolsWithDistance = schools.map((school) => {
      const distance = getDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude
      );
      return { ...school, distance };
    });
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(schoolsWithDistance);
  } catch (err) {
    console.log("Error finding data: " + err.message);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
