const mongoose = require("mongoose");

const args = process.argv.slice(2);

const url = (password) =>
  `mongodb+srv://ibrahimdev:${password}@datanode.ca6dc.mongodb.net/PhonebookApp?retryWrites=true&w=majority&appName=DataNode`;

mongoose.set("strictQuery", false);

// config
const config = {
  connectTimeoutMS: 20000,
  serverSelectionTimeoutMS: 20000,
};

// schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// model
const Person = mongoose.model("Person", personSchema);

if (args.length === 3) {
  const [password, name, number] = args;
  mongoose.connect(url(password), config);

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((result) => {
    console.log(`added ${result.name} ${result.number} to phonebook`);
    mongoose.connection.close();
  });
} else if (args.length === 1) {
  const [password] = args;
  mongoose.connect(url(password), config);

  Person.find({}).then((result) => {
    console.log(`phonebook:`);
    result.forEach((p) => {
      console.log(`${p.name} ${p.number}`);
    });
    mongoose.connection.close();
  });
} else {
  console.log("Invalid number of arguments.");
  process.exit(1);
}
