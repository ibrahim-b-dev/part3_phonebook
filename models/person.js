const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URL;
// const url = "mongodb://localhost:27017/PhonebookApp";
console.log("connecting to", url);

mongoose
  .connect(url, {
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 20000,
  })
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

  const personSchema = mongoose.Schema({
    name: {
      type: String,
      minlength: [3, "name must be at least 3 characters"],
      required: true,
    },
    number: {
      type: String,
      minlength: [8, "phone number must be at least 8 digits"],
      match: [/^(\d{2,3})-(\d{5,})$/, "use one of these formats 01-12345678 or 001-12345678"]
    }
  });
  
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
