// fix-password.js
require('dotenv').config(); // If you use environment variables

const { User } = require('./backend/src/models'); // Adjust path to your models
const bcrypt = require('bcrypt');

async function updateUserPassword() {
  try {
    // Find the user
    const user = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Generate a new password hash
    const newPassword = 'tempPassword123'; // You can change this temporary password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password
    await user.update({ password: hashedPassword });
    
    console.log('Password updated successfully');
    console.log('Temporary password:', newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    process.exit(); // Exit the script when done
  }
}

updateUserPassword();