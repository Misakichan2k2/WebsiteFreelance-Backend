const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const generateUserId = async () => {
  // Assuming you have a function to generate unique IDs for users
  const userId = `CTM${Date.now()}`;
  return userId;
};

module.exports = { hashPassword, generateUserId };
