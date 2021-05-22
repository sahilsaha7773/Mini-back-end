const mongoose = require('mongoose');
const config = require('./config');
const dbURL = process.env.DBURL || config.DBURL;
const InitiateMongoServer = async () => {
    try {
      await mongoose.connect(dbURL, {
        useNewUrlParser: true, 
        useUnifiedTopology: true
      });
      console.log("Connected to DB !!");
    } catch (e) {
      console.log(e);
      throw e;
    }
};
  
module.exports = InitiateMongoServer;