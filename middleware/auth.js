const jwt = require('jsonwebtoken');

const authenticate = () => {
  return async (event) => {
    const token = event.headers.Authorization || event.headers.authorization;

    if (!token) {
      throw new Error('Authorization token is required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      event.user = decoded; 
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  };
};

module.exports = { authenticate };
