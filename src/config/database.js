const dotenv = require('dotenv')
const pg = require('pg')
dotenv.config()

module.exports = {
  dialect: 'postgres',
  dialectModule: pg,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  define: {
    timestamps: true, // corrigido de 'timespamps'
    underscored: true,
    underscoredAll: true,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // se certificado não for válido ou autoassinado
    },
  },
}