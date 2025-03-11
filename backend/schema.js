const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    name: String,

    email: String,

    password: String,

    phone: String,

    role: { type: String, 
            enum: ['Seller', 'Buyer', 'Manufacturer', 'Logistics'] },
    location: String
});

const ScrapSchema = new mongoose.Schema({
sellerId: { type: mongoose.Schema.Types.ObjectId,
     ref: 'User' },
    plasticType: String,

    weight: Number,

    price: Number,

    imageUrl: String,

    status: { type: String,
         enum: ['Available', 'Sold'],
          default: 'Available' }
  });


  
 const TransportSchema = new mongoose.Schema({
    
    buyerId: { type: mongoose.Schema.Types.ObjectId,
                 ref: 'User' },
    
    logisticsId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',
                     default: null },
    
    scrapId: { type: mongoose.Schema.Types.ObjectId,
                 ref: 'Scrap' },
    
    status: { type: String, enum: ['Pending', 'Accepted'],
                 default: 'Pending' }
  });


module.exports = mongoose.model('Transport', TransportSchema);

module.exports = mongoose.model('Scrap', ScrapSchema);

module.exports = mongoose.model('User', UserSchema);
