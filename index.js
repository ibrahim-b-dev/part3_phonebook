const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan.token("body", (request) => {
  return request.body && Object.keys(request.body).length
    ? JSON.stringify(request.body)
    : "No body";
});

app.use(cors());
app.use(express.json());
app.use(express.static('dist'))
// app.use(morgan("tiny"));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.head("/", (request, response) => {
  response.set("X-Custom-Header", "CustomHeaderValue");
  response.set(
    "X-Purpose",
    "Return the status code and response headers without body content."
  );

  response.status(200).end();
});

app.get("/info", (request, response) => {
  const currentDate = new Date();
  console.log(currentDate.toString());

  const infoTemplate = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${currentDate}</p>
  `;

  response.send(infoTemplate);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

const generateRandomId = () => {
  const id = Math.floor(Math.random(50000) * (50000 - 1 + 1) + 1);
  return String(id);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name is missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  const nameFound = persons.find((p) => p.name === body.name);

  if (nameFound) {
    return response.status(409).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateRandomId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
