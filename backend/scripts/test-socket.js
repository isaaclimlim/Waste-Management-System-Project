const { getIO } = require('../socket');
const mongoose = require('mongoose');
require('dotenv').config();

const testSocketEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-management');
    console.log('Connected to MongoDB');

    // Get the Socket.IO instance
    const io = getIO();
    if (!io) {
      console.error('Socket.IO not initialized');
      process.exit(1);
    }

    // Test bulk request events
    console.log('Testing bulk request events...');
    
    // Simulate new bulk request
    const newBulkRequest = {
      _id: new mongoose.Types.ObjectId(),
      businessId: new mongoose.Types.ObjectId(),
      date: new Date(),
      time: 'morning',
      wasteType: 'biodegradable',
      quantity: 150,
      address: '789 Business Ave, City',
      status: 'pending'
    };

    // Emit to all business rooms
    io.emit('bulkRequest:created', newBulkRequest);
    console.log('Emitted bulkRequest:created event');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate bulk request update
    const updatedBulkRequest = {
      ...newBulkRequest,
      status: 'accepted'
    };
    io.emit('bulkRequest:updated', updatedBulkRequest);
    console.log('Emitted bulkRequest:updated event');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test analytics update
    console.log('Testing analytics events...');
    const analyticsData = {
      monthlyData: [
        { month: 'Jan', quantity: 100 },
        { month: 'Feb', quantity: 150 },
        { month: 'Mar', quantity: 200 }
      ],
      wasteTypeDistribution: [
        { type: 'biodegradable', quantity: 40 },
        { type: 'recyclable', quantity: 35 },
        { type: 'non-biodegradable', quantity: 25 }
      ]
    };
    io.emit('analytics:updated', analyticsData);
    console.log('Emitted analytics:updated event');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test scheduled pickup events
    console.log('Testing scheduled pickup events...');
    const newScheduledPickup = {
      _id: new mongoose.Types.ObjectId(),
      businessId: new mongoose.Types.ObjectId(),
      frequency: 'weekly',
      dayOfWeek: 'monday',
      time: 'morning',
      wasteType: 'biodegradable',
      address: '789 Business Ave, City',
      startDate: new Date(),
      status: 'active'
    };
    io.emit('scheduledPickup:created', newScheduledPickup);
    console.log('Emitted scheduledPickup:created event');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test recommendations update
    console.log('Testing recommendations events...');
    const recommendationsData = [
      {
        title: 'Optimize Collection Schedule',
        description: 'Based on your waste generation patterns, consider adjusting your collection schedule.',
        impact: 'Reduce operational costs by 15%'
      },
      {
        title: 'Waste Segregation Improvement',
        description: 'Your recyclable waste could be better segregated.',
        impact: 'Increase recycling rate by 25%'
      }
    ];
    io.emit('recommendations:updated', recommendationsData);
    console.log('Emitted recommendations:updated event');

    console.log('All test events completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing socket events:', error);
    process.exit(1);
  }
};

testSocketEvents(); 