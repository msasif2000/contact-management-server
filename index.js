const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: ['http://localhost:5173'],
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iirzaag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const dbConnect = async () => {
    try {
        client.connect()
        console.log('DB Connected Successfully✅')
    } catch (error) {
        console.log(error.name, error.message)
    }
}
dbConnect()
const contactsCollection = client.db("Cellio-Contact").collection("Contacts");
const usersCollection = client.db("Cellio-Contact").collection("Users");

app.get('/', (req, res) => {
    res.send('Hello Cellio-Contact!')
})

app.post('/users', async (req, res) => {
    const newUser = req.body;
    const query = { email: newUser.email };
    try {
        const existingUser = await usersCollection.findOne(query);

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
            userId: result.insertedId,
            message: "User created successfully",
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.get('/user-profile/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    try {
        const existingUser = await usersCollection.findOne(query);
        if (!existingUser) {
            return res.status(404).send({ message: "User not found" });
        }
        const user = await usersCollection.findOne(query);
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.post('/addContact', async (req, res) => {
    const newContact = req.body;
    const query = { phone: newContact.phone };
    try {
        const existingContact = await contactsCollection.findOne(query);

        if (existingContact) {
            return res.status(409).json({ message: "Contact already exists" });
        }

        const result = await contactsCollection.insertOne(newContact);

        res.status(201).json({
            contactId: result.insertedId,
            message: "Contact created successfully",
        });
    } catch (error) {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

//get all contacts
app.get('/allContacts/:email', async (req, res) => {
    const email = req.params.email;
    const query = { userEmail: email };
    try {
        const contacts = await contactsCollection.find(query).toArray();
        res.send(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

//update contact 
app.patch('/updateContact/:id', async (req, res) => {
    const id = req.params.id;
    const updatedContact = req.body;
    const query = { _id: new ObjectId(id) };
    try {
        const result = await contactsCollection.findOneAndUpdate(query, { $set: updatedContact });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

//delete contact
app.delete('/deleteContact/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    try {
        const result = await contactsCollection.findOneAndDelete(query);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

//bookmark contact
app.patch('/saveContact/:id' , async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    try {
        const result = await contactsCollection.findOneAndUpdate(query, { $set: { bookmarked: true } });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.patch('/removeBookmark/:id' , async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    try {
        const result = await contactsCollection.findOneAndUpdate(query, { $set: { bookmarked: false } });
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})