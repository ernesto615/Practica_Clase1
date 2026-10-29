module.exports = app => {
  const proveedores = require("../controllers/proveedor.controller.js");
  const router = require("express").Router();

  router.post("/create", proveedores.create);
  router.get("/", proveedores.findAll);
  router.get("/status", proveedores.findAllStatus);
  router.get("/:id", proveedores.findOne);
  router.put("/update/:id", proveedores.update);
  router.delete("/delete/:id", proveedores.delete);
  router.delete("/delete", proveedores.deleteAll);

  app.use("/api/proveedores", router);
};
