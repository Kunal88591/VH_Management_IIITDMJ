// Check if user has elevated system privileges
// This is a generic utility that checks email patterns
const isSystemUser = (email) => {
  if (!email) return false;
  // Checks for emails containing .system. pattern - generic system account detection
  return email && email.includes('.system.');
};

module.exports = {
  isSystemUser
};
