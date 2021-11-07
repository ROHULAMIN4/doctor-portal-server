const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const dotenv = require("dotenv");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middlewere
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4vnd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("DortorPortal");
    const bookingCollection = database.collection("Book");
    app.get("/appoinments", async (req, res) => {
      // find a specifie email first 2 lines
      const email = req.query.email;
      // find special date apoinment
      const date = req.query.date;
      console.log(date);
      const query = { email: email };
      // basic find oparasion
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });
    app.post("/appoinments", async (req, res) => {
      const appoinment = req.body;
      const result = await bookingCollection.insertOne(appoinment);
      // console.log(apponment);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("staart the root folder");
});
app.listen(port, () => {
  console.log("Server started docotr portal ", port);
});
