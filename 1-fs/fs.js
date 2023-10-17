// ES6 Modules
import fs from "fs";

const command = process.argv[2];

// if command = read
if (command === "read") {
  const index = process.argv[3];

  // read pets.json
  fs.readFile("../pets.json", "utf-8", function (error, text) {
    if (error) {
      throw error;
    }

    // parse json to an object
    const pets = JSON.parse(text);

    // if an index is provided
    if (index !== undefined) {
      if (index < 0 || index >= pets.length) {
        console.error("Usage: node fs.js read INDEX");
        process.exit(1);
      }
      // log the pet at the given index
      console.log(pets[index]);
    } else {
      // log all pets to the console
      console.log(pets);
    }
  });
} else if (command === "create") {
  const age = process.argv[3];
  const kind = process.argv[4];
  const name = process.argv[5];

  if (!age || !kind || !name) {
    console.error("Usage: node fs.js create AGE KIND NAME");
    process.exit(1);
  }

  fs.readFile("../pets.json", "utf-8", function (error, text) {
    if (error) {
      throw error;
    }

    const pets = JSON.parse(text);
    const newPet = { age: Number(age), kind, name };
    pets.push(newPet);

    fs.writeFile("../pets.json", JSON.stringify(pets), (error) => {
      if (error) {
        throw error;
      }

      console.log(newPet);
    });
  });
} else {
  console.error("Usage: node fs.js [read | create | update | destroy]");
  process.exit(1);
}
