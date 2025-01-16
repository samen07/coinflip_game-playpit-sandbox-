export default {
  BASE_BACKEND_ENDPOINT_URL: process.env.BASE_URL || 'http://localhost:5000',
  BASE_FRONTEND_URL: process.env.BASE_URL || 'http://localhost:3000',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017',
  DATABASE_NAME: process.env.DATABASE_NAME || 'coinflip_game',
  DB_COLLECTION_NAME: process.env.DB_COLLECTION_NAME || 'users',
};