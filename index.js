const express = require ('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const classesData = require('./data/classes.json')
const instructorsData = require('./data/instructors.json')
const port = process.env.PORT || 5000;

//middle wear
app.use(cors());
app.use(express.json());

app.get('/classes', (req, res) =>{
  res.send(classesData);
})

app.get('/instructors', (req, res) => {
  res.send(instructorsData)
})



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.jwmpqqv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db('Summ_School').collection('users');


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/', ( req, res)=>{
    res.send("Summer School Server RUNNING")
})

app.listen(port, ()=>{
    console.log(`Summer-School-Camp is running on PORT: ${port}`);
})
