import express from "express";
import fs from "fs";
const app = express();
const port = 8000;

let pets;
fs.readFile("../pets.json", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  pets = JSON.parse(data);
});

app.get("/pets", (req, res) => {
  res.status(200).json(pets);
});

app.get("/pets/:id", (req, res) => {
  const id = req.params.id;
  if (id < 0 || id >= pets.length) {
    res.status(404).send("Not Found");
  } else {
    res.status(200).json(pets[id]);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
