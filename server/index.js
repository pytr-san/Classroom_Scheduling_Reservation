const express = require('express');
const mysql = require('mysql2')
const dotenv = require("dotenv")
const cors = require('cors')
dotenv.config({ path: "./.env" });


const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'schedulingsystem',
})


    db.connect( (error) => {
    if(error){
        console.log(error)
    }else{
        console.log("Database Connected...")
    }
})


app.get("/", (req, res) =>{
    res.send("<h1>I was Here</h1>")
})


app.listen(8000, () =>{

    console.log("Server Started on Port 8000");
})
