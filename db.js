const dbConn = {
  production: {
    database: process.env.MONGO_URL,
  },
};

export default dbConn;
