const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const stripe = require("stripe")(process.env.PAYMENT_SECRATE);
const app = express();
const port = process.env.PORT || 5000;
// dorcors-portal-firebase-adminsdk-mg362-40ad64776b

const serviceAccount = require("./dorcors-portal-firebase-adminsdk-mg362-40ad64776b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// middlewere
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4vnd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// async function varifyToken(req, res, next) {
//   if (req?.headers?.authorization?.startsWith("bearer")) {
//     const token = req.headers.authorization.split(" ")[1];
//     try {
//       const decondedUser = await admin.auth().varifyToken(token);
//       req.decodedEmail = decondedUser.email;
//     } catch {}
//   }

//   next();
// }
async function run() {
  try {
    await client.connect();
    const database = client.db("DortorPortal");
    const bookingCollection = database.collection("Book");
    const userCollection = database.collection("Users");
    app.get("/appoinments", async (req, res) => {
      // find a specifie email first 2 lines
      const email = req.query.email;
      // find special date apoinment
      const date = new Date(req.query.date).toLocaleDateString();

      const query = { email: email, date: date };
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
    app.get("/appoinments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.json(result);
    });
    // intent update for payment method
    app.put("/appoinments/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          payment: payment,
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // creat email and password with secure server
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });
    // secure google
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // make and admit for special banifit
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);

      res.json(result);
    });

    // find admin email and get special role
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // payment system strike
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
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
