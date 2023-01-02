const express = require("express");
const { createServer } = require("http");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const server = createServer(app);

async function main() {
  if (prisma.$connect()) {
    console.log("Connected to database");
  }
  app.use(express.json({ extended: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(methodOverride());

  //   app.use(bodyParser.form);
  app.use("/api/users", require("./routes/api/users"));
  //   app.use("/api/auth", require("./routes/api/auth"));
  app.use("/api/profile", require("./routes/api/profile"));
  app.use("/api/post", require("./routes/api/post"));

  server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
