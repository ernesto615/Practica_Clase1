require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");

app.get("/", (_req, res) => {
  res.json({
    message: "UMG Web Application",
    resources: {
      clientes: "/api/customer",
      proveedores: "/api/proveedores",
      productos: "/api/productos"
    }
  });
});

require("./app/routes/cliente.route")(app);
require("./app/routes/proveedor.route")(app);
require("./app/routes/producto.route")(app);

app.use((_req, res) => {
  res.status(404).send({ message: "Endpoint no encontrado." });
});

const PORT = process.env.PORT || 8081;

const startServer = async () => {
  try {
    console.log("Conectando con PostgreSQL...");
    await db.sequelize.authenticate();
    console.log("Conexión con PostgreSQL establecida correctamente.");

    await db.sequelize.sync();
    console.log("Modelos sincronizados correctamente.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("No fue posible iniciar el servidor.");
    console.error("Tipo:", error.name);
    console.error("Mensaje:", error.message);
    process.exit(1);
  }
};

startServer();
