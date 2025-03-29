const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const WasteRequest = require('../models/WasteRequest');
const BulkWasteRequest = require('../models/BulkWasteRequest');
const ScheduledPickup = require('../models/ScheduledPickup');
const Expense = require('../models/Expense');
const WasteTip = require('../models/WasteTip');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-management');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      WasteRequest.deleteMany({}),
      BulkWasteRequest.deleteMany({}),
      ScheduledPickup.deleteMany({}),
      Expense.deleteMany({}),
      WasteTip.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create users
    const resident1 = await User.create({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: 'password123',
      phone: '1234567890',
      role: 'resident',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610]
      }
    });

    const resident2 = await User.create({
      name: 'Jane Smith',
      email: 'janesmith@gmail.com',
      password: 'password123',
      phone: '0987654321',
      role: 'resident',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610]
      }
    });

    const business1 = await User.create({
      name: 'Green Waste Solutions',
      email: 'greenwaste@gmail.com',
      password: 'password123',
      phone: '5555555555',
      role: 'business',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610]
      }
    });

    const collector1 = await User.create({
      name: 'Mike Johnson',
      email: 'mikejohnson@gmail.com',
      password: 'password123',
      phone: '1112223333',
      role: 'collector',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610]
      }
    });

    console.log('Created users');

    // Create waste requests
    const wasteRequests = await Promise.all([
      WasteRequest.create({
        residentId: resident1._id,
        date: new Date(),
        time: 'morning',
        wasteType: 'biodegradable',
        address: '123 Main St, City',
        status: 'pending'
      }),
      WasteRequest.create({
        residentId: resident1._id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: 'afternoon',
        wasteType: 'recyclable',
        address: '123 Main St, City',
        status: 'accepted'
      }),
      WasteRequest.create({
        residentId: resident2._id,
        date: new Date(),
        time: 'evening',
        wasteType: 'non-biodegradable',
        address: '456 Oak St, City',
        status: 'completed'
      })
    ]);

    console.log('Created waste requests');

    // Create bulk waste requests
    const bulkRequests = await Promise.all([
      BulkWasteRequest.create({
        businessId: business1._id,
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        time: 'morning',
        wasteType: 'biodegradable',
        quantity: 100,
        address: '789 Business Ave, City',
        status: 'pending'
      }),
      BulkWasteRequest.create({
        businessId: business1._id,
        date: new Date(Date.now() + 259200000), // 3 days from now
        time: 'afternoon',
        wasteType: 'recyclable',
        quantity: 200,
        address: '789 Business Ave, City',
        status: 'accepted'
      })
    ]);

    console.log('Created bulk waste requests');

    // Create scheduled pickups
    const scheduledPickups = await Promise.all([
      ScheduledPickup.create({
        businessId: business1._id,
        frequency: 'weekly',
        dayOfWeek: 'monday',
        time: 'morning',
        wasteType: 'biodegradable',
        address: '789 Business Ave, City',
        startDate: new Date(),
        isActive: true
      }),
      ScheduledPickup.create({
        businessId: business1._id,
        frequency: 'monthly',
        dayOfMonth: 1,
        time: 'afternoon',
        wasteType: 'recyclable',
        address: '789 Business Ave, City',
        startDate: new Date(),
        isActive: true
      })
    ]);

    console.log('Created scheduled pickups');

    // Create expenses
    const expenses = await Promise.all([
      Expense.create({
        businessId: business1._id,
        requestId: bulkRequests[0]._id,
        amount: 500,
        category: 'collection',
        description: 'Weekly waste collection service',
        date: new Date()
      }),
      Expense.create({
        businessId: business1._id,
        requestId: bulkRequests[1]._id,
        amount: 750,
        category: 'recycling',
        description: 'Recycling facility processing fee',
        date: new Date()
      })
    ]);

    console.log('Created expenses');

    // Create waste tips
    const wasteTips = await Promise.all([
      WasteTip.create({
        title: 'Proper Waste Segregation',
        content: 'Always separate biodegradable and non-biodegradable waste to help with recycling efforts.',
        category: 'recyclable'
      }),
      WasteTip.create({
        title: 'Composting Guide',
        content: 'Learn how to compost your food waste to reduce landfill waste and create nutrient-rich soil.',
        category: 'biodegradable'
      }),
      WasteTip.create({
        title: 'Reduce Plastic Usage',
        content: 'Use reusable bags and containers to reduce plastic waste in your daily life.',
        category: 'non-biodegradable'
      })
    ]);

    console.log('Created waste tips');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 