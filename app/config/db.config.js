require("dotenv").config();

const sslEnabled = process.env.DB_SSL !== "false";

module.exports = {
  URL: process.env.DATABASE_URL,

  // Variables alternativas por separado, útiles para PostgreSQL local.
  HOST: process.env.DB_HOST,
  PORT: Number(process.env.DB_PORT || 5432),
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,

  dialect: "postgres",
  dialectOptions: sslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},

  pool: {
    max: Number(process.env.DB_POOL_MAX || 5),
    min: Number(process.env.DB_POOL_MIN || 0),
    acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
    idle: Number(process.env.DB_POOL_IDLE || 10000)
  }
};
