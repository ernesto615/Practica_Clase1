module.exports = app => {
  const clientes = require("../controllers/cliente.controller.js");
  const router = require("express").Router();

  router.post("/create", clientes.create);
  router.get("/", clientes.findAll);
  router.get("/status", clientes.findAllStatus);
  router.get("/:id", clientes.findOne);
  router.put("/update/:id", clientes.update);
  router.delete("/delete/:id", clientes.delete);
  router.delete("/delete", clientes.deleteAll);

  app.use("/api/customer", router);
};
