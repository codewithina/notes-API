import jwt from 'jsonwebtoken';

export const authenticate = () => {
  return {
    before: async (handler) => {
      const token = handler.event.headers.Authorization || handler.event.headers.authorization;

      if (!token) {
        throw new Error('Authorization token is required');
      }

      const tokenWithoutBearer = token.replace(/^Bearer\s+/, '');

      try {
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        handler.event.user = decoded; 
      } catch (err) {
        throw new Error('Invalid or expired token');
      }
    },
  };
};