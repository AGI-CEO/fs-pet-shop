import http from "http";
import fs from "fs";
import url from "url";

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const path = reqUrl.pathname;
  const method = req.method;

  const petRegExp = /^\/pets\/(.*)$/;

  if (method === "GET" && petRegExp.test(path)) {
    const petIndex = path.match(petRegExp)[1];

    fs.readFile("../pets.json", "utf8", (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("Internal Server Error");
        return;
      }

      const pets = JSON.parse(data);

      if (petIndex === "") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(pets));
      } else {
        const index = Number(petIndex);

        if (index < 0 || index >= pets.length || Number.isNaN(index)) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end("Not Found");
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(pets[index]));
        }
      }
    });
  } else if (method === "POST" && path === "/pets") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const pet = JSON.parse(body);

      if (!pet.name || !pet.kind || typeof pet.age !== "number") {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/plain");
        res.end("Bad Request");
        return;
      }

      fs.readFile("../pets.json", "utf8", (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Internal Server Error");
          return;
        }

        const pets = JSON.parse(data);
        pets.push(pet);

        fs.writeFile("../pets.json", JSON.stringify(pets), (err) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain");
            res.end("Internal Server Error");
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(pet));
        });
      });
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
  }
});

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
