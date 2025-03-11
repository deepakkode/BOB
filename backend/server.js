const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    role: { type: String, enum: ['Seller', 'Buyer', 'Manufacturer', 'Logistics'] },
    location: String
});
const User = mongoose.model('User', UserSchema);

// Scrap Schema
const ScrapSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plasticType: String,
    weight: Number,
    price: Number,
    imageUrl: String,
    status: { type: String, enum: ['Available', 'Sold'], default: 'Available' }
});
const Scrap = mongoose.model('Scrap', ScrapSchema);

// Transport Schema
const TransportSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    logisticsId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    scrapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scrap' },
    status: { type: String, enum: ['Pending', 'Accepted'], default: 'Pending' }
});
const Transport = mongoose.model('Transport', TransportSchema);

// User Registration
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, phone, role, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone, role, location });
    await user.save();
    res.json({ message: 'User Registered Successfully' });
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid Credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
});

// Add Scrap Listing
app.post('/api/scrap/add', async (req, res) => {
    const { sellerId, plasticType, weight, price, imageUrl } = req.body;
    const scrap = new Scrap({ sellerId, plasticType, weight, price, imageUrl });
    await scrap.save();
    res.json({ message: 'Scrap Added Successfully' });
});

// Get All Scrap Listings
app.get('/api/scrap/all', async (req, res) => {
    const scraps = await Scrap.find();
    res.json(scraps);
});

// Request Transport
app.post('/api/transport/request', async (req, res) => {
    const { buyerId, scrapId } = req.body;
    const transport = new Transport({ buyerId, scrapId });
    await transport.save();
    res.json({ message: 'Transport Request Created' });
});

// Accept Transport Request
app.post('/api/transport/accept', async (req, res) => {
    const { transportId, logisticsId } = req.body;
    await Transport.findByIdAndUpdate(transportId, { logisticsId, status: 'Accepted' });
    res.json({ message: 'Transport Request Accepted' });
});

// Start Server
const PORT = process.env.PORT || 3107;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
