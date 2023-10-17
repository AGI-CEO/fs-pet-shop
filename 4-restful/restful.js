import express from "express";
const app = express();
import fs from "fs/promises";
import pkg from "pg";
const { Client } = pkg;
import basicAuth from "express-basic-auth";

app.use(express.json());
app.use(
  basicAuth({
    users: { admin: "meowmix" },
    unauthorizedResponse: "Fuck u commie",
  })
);

const client = new Client({
  user: "pets",
  host: "localhost",
  database: "pets",
  password: "pets",
  port: 5432,
});

client.connect();

app.get("/pets", async (req, res, next) => {
  try {
    const { rows } = await client.query("SELECT * FROM pets");
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

app.post("/pets", async (req, res, next) => {
  const newPet = req.body;
  if (!newPet.name || !newPet.kind || typeof newPet.age !== "number") {
    res.status(400).send("Bad Request, DUMBASS 😹");
    return;
  }

  try {
    const { rows } = await client.query(
      "INSERT INTO pets (name, kind, age) VALUES ($1, $2, $3) RETURNING *",
      [newPet.name, newPet.kind, newPet.age]
    );
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.get("/pets/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const { rows } = await client.query("SELECT * FROM pets WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      res.status(404).send("You gotta be fucking kidding me.");
    } else {
      res.status(200).json(rows[0]);
    }
  } catch (err) {
    next(err);
  }
});

app.patch("/pets/:id", async (req, res, next) => {
  const id = req.params.id;
  const updatedPet = req.body;

  try {
    const { rows } = await client.query("SELECT * FROM pets WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      res.status(404).send("god dammit!");
      return;
    }

    const pet = rows[0];
    if (updatedPet.name) pet.name = updatedPet.name;
    if (updatedPet.kind) pet.kind = updatedPet.kind;
    if (typeof updatedPet.age === "number") pet.age = updatedPet.age;

    await client.query(
      "UPDATE pets SET name = $1, kind = $2, age = $3 WHERE id = $4 RETURNING *",
      [pet.name, pet.kind, pet.age, id]
    );
    res.status(200).json(pet);
  } catch (err) {
    next(err);
  }
});

app.delete("/pets/:id", async (req, res, next) => {
  const id = req.params.id;

  try {
    const { rows } = await client.query("SELECT * FROM pets WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      res.status(404).send("Not Found");
      return;
    }

    const deletedPet = rows[0];

    await client.query("DELETE FROM pets WHERE id = $1", [id]);
    res.status(200).json(deletedPet);
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).send("freakin idiot");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

process.on("exit", () => {
  client.end();
});
