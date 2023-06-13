const express = require ('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

//middle wear
app.use(cors());
app.use(express.json());

app.get('/', ( req, res)=>{
    res.send("Summer School Server RUNNING")
})

app.listen(port, ()=>{
    console.log(`Summer-School-Camp is running on PORT: ${port}`);
})
