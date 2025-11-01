const mongoose = require('mongoose');

async function checkFoundations() {
  try {
    // Hardcode connection string or pass via environment
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Check all foundations
    console.log('=== ALL FOUNDATIONS ===');
    const foundations = await db.collection('foundations').find({}).toArray();
    foundations.forEach(f => {
      console.log(`ID: ${f._id}`);
      console.log(`  Code: ${f.code}`);
      console.log(`  Name: ${f.name}`);
      console.log('');
    });

    // 2. Check if CF exists
    const cfExists = foundations.find(f => f.code === 'cf');
    console.log(`CF Foundation exists: ${cfExists ? 'YES' : 'NO'}`);
    if (cfExists) {
      console.log(`  CF ID: ${cfExists._id}`);
      console.log(`  CF Name: ${cfExists.name}\n`);
    }

    // 3. Verify VSF ID
    const vsfFoundation = foundations.find(f => f.code === 'vsf');
    console.log(`VSF Foundation ID: ${vsfFoundation?._id}`);
    console.log(`Is 68F8E0A93EE0BE3EF2450503 correct? ${vsfFoundation?._id.toString() === '68f8e0a93ee0be3ef2450503' ? 'YES' : 'NO'}\n`);

    // 4. Sample donations
    console.log('=== SAMPLE DONATIONS (showing foundation field) ===');
    const donations = await db.collection('donations').find({}).limit(15).toArray();
    donations.forEach(d => {
      console.log(`Donation: ${d._id}`);
      console.log(`  Foundation field: ${JSON.stringify(d.foundation)}`);
      console.log(`  Amount: ₹${d.amount}`);
      console.log('');
    });

    // 5. Foundation value distribution
    console.log('=== FOUNDATION VALUE DISTRIBUTION ===');
    const pipeline = [
      {
        $group: {
          _id: '$foundation',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ];
    const distribution = await db.collection('donations').aggregate(pipeline).toArray();
    distribution.forEach(d => {
      console.log(`Foundation value: ${JSON.stringify(d._id)}`);
      console.log(`  Count: ${d.count}`);
      console.log(`  Total: ₹${d.total}`);
      console.log('');
    });

    // 6. Count "general" donations
    const generalCount = await db.collection('donations').countDocuments({ foundation: 'general' });
    console.log(`=== DONATIONS WITH "general" FOUNDATION ===`);
    console.log(`Count: ${generalCount}\n`);

    await mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFoundations();
