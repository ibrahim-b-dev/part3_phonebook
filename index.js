require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const Person = require("./models/person");

const app = express();

morgan.token("body", (request) => {
  return request.body && Object.keys(request.body).length
    ? JSON.stringify(request.body)
    : "No body";
});

app.use(express.static("dist"));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// Info route
app.get("/info", (request, response, next) => {
  const currentDate = new Date();

  Person.countDocuments({}).then((count) => {
    const infoTemplate = `
      <p>Phonebook has info for ${count} people</p>
      <p>${currentDate}</p>
      `;

    response.send(infoTemplate);
  })
  .catch(error => next(error))
});

// Get all persons
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

// Get one person
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Create new person
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

// Update person number
app.put("/api/persons/:id", (request, response, next) => {
  const { number } = request.body;

  if (number === undefined) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      console.log("here");

      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// Delete person
app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findByIdAndDelete(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// handles unknown routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({
      error: error.message,
    });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
