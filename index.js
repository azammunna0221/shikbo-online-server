const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const instructorsData = require('./data/instructors.json')
const port = process.env.PORT || 5000;

//middle wear
const corsConfig = {
  origin: '',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}
app.use(cors(corsConfig));
app.options("" , cors(corsConfig));

app.use(cors());
app.use(express.json());

//jwt token verify
const verifyJWT = (req, res, next) => {
  const authorized = req.headers.authorization;
  if (!authorized) {
    return res.status(401).send({ error: true, message: 'Unauthorized Access' });
  }

  const token = authorized.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ error: true, message: 'Unauthorized Access' })
    }
    req.decoded = decoded;
    next();
  })
}




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
    //await client.connect();
    // Send a ping to confirm a successful connection

    const classCollection = client.db('Summ_School').collection('classes');
    const instructorsCollection = client.db('Summ_School').collection('instructors');
    const myClassCollection = client.db('Summ_School').collection('myClass');
    const userCollection = client.db('Summ_School').collection('users');


    // APIs Started
    //verify is Admin



    // get APIs All Classes
    app.get('/classes', async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    })

    //Add A class by Instructor
    app.post('/classes', verifyJWT, async(req, res) => {
      const newClasses = req.body;
      const result = await classCollection.insertOne(newClasses);
      res.send(result);
    })

    app.get('/instructors', async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    })

    // class Management apis
    app.get('/myClass', verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      //jwt token
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'Forbidden' });
      }

      const query = { email: email };
      const result = await myClassCollection.find(query).toArray();
      res.send(result);
    });

    //Update myClass
    app.post('/myClass', async (req, res) => {
      const course = req.body;
      const result = await myClassCollection.insertOne(course);
      res.send(result);
    })


    //delete course from myClass
    app.delete('/myClass/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myClassCollection.deleteOne(query);
      res.send(result);
    })

    // Get, post, update, delete Users from ADMIN PANEL
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    //Jwt Token
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existing = await userCollection.findOne(query)
      if (existing) {
        return res.send({ message: 'User Email Exist' })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    //jwt user admin verification
    app.get('/users/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (req.decoded.email !== email) {
        res.send({ admin: false })
      }
      const query = { email: email }
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === 'Admin' }
      res.send(result);
    })
    //jwt user instructor verification
    app.get('/users/instructor/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (req.decoded.email !== email) {
        res.send({ instructor: false })
      }
      const query = { email: email }
      const user = await userCollection.findOne(query);
      const result = { instructor: user?.role === 'Instructor' }
      res.send(result);
    })

    //Role Admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'Admin'
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    })
    // Role Instructor
    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'Instructor'
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    //Approved Class
    app.patch('/classes/approved/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'Approved'
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    //Denied Class
    app.patch('/classes/deny/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'Denied'
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    })


    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myClassCollection.deleteOne(query);
      res.send(result);
    })


    //-------------------------------------------------------------

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Summer School Server RUNNING")
})

app.listen(port, () => {
  console.log(`Summer-School-Camp is running on PORT: ${port}`);
})
