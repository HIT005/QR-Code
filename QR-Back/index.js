const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const app = express();
const cors = require('cors')
app.use(cors())

const port = process.env.PORT || 3000;

// Connect to your MongoDB
mongoose.connect('mongodb://localhost/Data-qrcode', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema for your data
const qrCodeSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  jobTitle: String,
  qrCodeImage: String, // You can save the image as a URL or binary data
});

// Create a model for your data
const QRCodeModel = mongoose.model('QRCode', qrCodeSchema);

// Middleware to parse JSON
app.use(express.json());

// Define a route to save data
app.post('/api/qrcodes', async (req, res) => {
  try {
    const { name, phoneNumber, jobTitle } = req.body;
    
    // Create a QR code containing user details
    const qrData = `${name}, ${phoneNumber}, ${jobTitle}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Create a new QRCode document with user details and the generated QR code
    const newQRCode = new QRCodeModel({
      name,
      phoneNumber,
      jobTitle,
      qrCodeImage,
    });

    // Save the QR code to the database
    await newQRCode.save();

    res.status(201).send(newQRCode);
  } catch (error) {
    console.error('Error saving data and QR code:', error);
    res.status(500).send('Error saving data and QR code');
  }
});
// Define a route to get user details
app.get('/api/userdetails', async (req, res) => {
    try {
      // Fetch user details from the database
      const userDetails = await QRCodeModel.find({});
      res.json(userDetails);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).send('Error fetching user details');
    }
  });

  // Define a route to delete a user's details by ID
app.delete('/api/userdetails/:id', async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Find the user details by ID and remove them from the database
      const deletedUser = await QRCodeModel.findByIdAndRemove(userId);
  
      if (!deletedUser) {
        return res.status(404).send('User not found');
      }
  
      res.status(200).json(deletedUser);
    } catch (error) {
      console.error('Error deleting user details:', error);
      res.status(500).send('Error deleting user details');
    }
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
