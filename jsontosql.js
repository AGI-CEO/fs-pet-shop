// this file migrates pets.json to my postgres database that I just made called pets
import fs from "fs";
import pg from "pg";

//reads pets.json
const data = fs.readFileSync("./pets.json", "utf8");
const pets = JSON.parse(data);

//connects to postgres database
const Client = pg.Client;
const client = new Client("postgres://pets:pets@localhost:5432/pets");
client.connect();

//creates table
client
  .query(
    `
  CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    kind TEXT NOT NULL
  );
`
  )
  .then(() => {
    //inserts data into table
    let promises = pets.map((pet) => {
      return client.query(
        `
          INSERT INTO pets (name, age, kind)
          VALUES ($1, $2, $3);
        `,
        [pet.name, pet.age, pet.kind]
      );
    });

    return Promise.all(promises);
  })
  .then(() => {
    //closes connection
    client.end();
  })
  .catch((err) => {
    console.log(err);
  });
// when complete, console log "created table pets"
console.log("created table pets");
