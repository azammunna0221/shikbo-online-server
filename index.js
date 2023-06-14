const express = require ('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const instructorsData = require('./data/instructors.json')
const port = process.env.PORT || 5000;

//middle wear
app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const classCollection = client.db('Summ_School').collection('classes');
    const instructorsCollection = client.db('Summ_School').collection('instructors');
    const myClassCollection = client.db('Summ_School').collection('myClass');

    app.get('/classes', async(req, res)=>{
      const result = await classCollection.find().toArray();
      res.send(result);
    })

    app.get('/instructors', async(req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    })
    // class Management apis
    app.get('/myClass', async(req, res)=>{
      const email = req.query.email;
      if(!email){
        res.send([]);
      }
      const query = { email : email};
      const result = await myClassCollection.find(query).toArray();
      res.send(result);
    });
    
    //Update myClass
    app.post('/myClass', async(req, res)=>{
      const course = req.body;
      console.log(course);
      const result = await myClassCollection.insertOne(course);
      res.send(result);
    })
    //delete course from myClass
    app.delete('/myClass/:id', async(req, res)=> {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)};
      const result = await myClassCollection.deleteOne(query);
      res.send(result);
    })

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
