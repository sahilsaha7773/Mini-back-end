const express = require('express')
const mongoose = require('mongoose')
const InitiateMongoServer = require("./config/db");
const userRoutes = require("./routes/user");
const bodyParser = require('body-parser');
var cors = require("cors");
const app = express()

InitiateMongoServer();
app.use(cors());
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.get("/", (req, res) => {
    res.json({ message: "API Working" });
});
app.use('/user', userRoutes);
app.post('/shortUrls', (req, res) => {
    
})
app.listen(process.env.PORT || 5000, (req, res) => {
    console.log(`Server started!!`)
});