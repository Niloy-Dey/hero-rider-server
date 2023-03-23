const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const path = require("path");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//middle ware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.twfgrrk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("hero-rider").collection("users");
    const lessonsCollection = client.db("hero-rider").collection("lessons");

    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    app.get("/lessons", async (req, res) => {
      const query = {};
      const cursor = lessonsCollection.find(query);
      const lessons = await cursor.toArray();
      res.send(lessons);
    });

    app.get("/lesson/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const lesson = await lessonsCollection.findOne(query)
      res.send(lesson);
    });

    app.get("/create-payment-intent", async (req, res) => {
      const service = req.body;  
      const price = service.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount : amount,
        currency : 'usd',
        payment_method_types : ['card'],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
    });
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });


    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedUser = await usersCollection.deleteOne(query);
      res.send(deletedUser);
    });


    
    app.put("/blockUser/:id", async (req, res) => {
      const id = req.params.id;
      const updatedRequest = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          userstatus: updatedRequest.userstatus,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });


    app.delete("/userDeleteRequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.json(result);
    });



  }
  finally {

  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome hero rider website");
});

app.listen(port, () => {
  console.log(`hero rider website listening on port ${port}`);
});

client.close();