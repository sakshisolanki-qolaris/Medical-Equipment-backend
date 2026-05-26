import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';
import User from '../modules/auth/user.model.js'; 

const seedAdminAndClerk = async () => {
  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log('Database connected. Starting user seeding...');

    // 1. Hash the default strong password
    // Using the strong password rule you established: Maharashtra@2026
    const saltRounds = 10;
    const defaultHashedPassword = await bcrypt.hash('Maharashtra@2026', saltRounds);

    // 2. Define the initial system users
    const usersToSeed = [
      {
        name: 'System Admin',
        email: 'admin@maharashtramandal.com', // Stored for records, but not used for login
        phone_number: '9999999999', // Primary Login ID
        password: defaultHashedPassword,
        role: 'Admin'
      },
      {
        name: 'Front Desk Clerk',
        email: 'clerk@maharashtramandal.com',
        phone_number: '8888888888', // Primary Login ID
        password: defaultHashedPassword,
        role: 'Staff'
      }
    ];

    // 3. Insert into the database safely
    for (const userData of usersToSeed) {
      // findOrCreate ensures we don't accidentally create duplicates if you run this script twice
      const [user, created] = await User.findOrCreate({
        where: { phone_number: userData.phone_number },
        defaults: userData
      });

      if (created) {
        console.log(`✅ Successfully seeded ${userData.role}: ${userData.name} (${userData.phone_number})`);
      } else {
        console.log(`⚠️ User already exists: ${userData.phone_number}. Skipping creation.`);
      }
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0); // Exit the script gracefully

  } catch (error) {
    console.error('❌ Critical error during seeding:', error);
    process.exit(1); // Exit with failure code
  }
};

// Execute the function
seedAdminAndClerk();