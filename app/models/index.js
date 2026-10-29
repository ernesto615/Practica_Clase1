const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const commonOptions = {
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  pool: dbConfig.pool,
  logging: false
};

let sequelize;

if (dbConfig.URL) {
  // La URL completa se pasa como primer argumento; nunca debe colocarse en host.
  sequelize = new Sequelize(dbConfig.URL, commonOptions);
} else {
  const requiredVariables = {
    DB_HOST: dbConfig.HOST,
    DB_USER: dbConfig.USER,
    DB_PASSWORD: dbConfig.PASSWORD,
    DB_NAME: dbConfig.DB
  };

  const missingVariables = Object.entries(requiredVariables)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVariables.length > 0) {
    throw new Error(
      `Faltan variables de conexión: ${missingVariables.join(", ")}. ` +
        "Configura DATABASE_URL o las variables DB_* en el archivo .env."
    );
  }

  sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    ...commonOptions,
    host: dbConfig.HOST,
    port: dbConfig.PORT
  });
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.clientes = require("./cliente.model.js")(sequelize, Sequelize);
db.proveedores = require("./proveedor.model.js")(sequelize, Sequelize);
db.productos = require("./producto.model.js")(sequelize, Sequelize);

// Un proveedor puede suministrar varios productos.
db.proveedores.hasMany(db.productos, {
  foreignKey: "proveedorId",
  as: "productos",
  onUpdate: "CASCADE",
  onDelete: "RESTRICT"
});

db.productos.belongsTo(db.proveedores, {
  foreignKey: "proveedorId",
  as: "proveedor",
  onUpdate: "CASCADE",
  onDelete: "RESTRICT"
});

module.exports = db;
