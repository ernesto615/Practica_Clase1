module.exports = app => {
  const productos = require("../controllers/producto.controller.js");
  const router = require("express").Router();

  router.post("/create", productos.create);
  router.get("/", productos.findAll);
  router.get("/status", productos.findAllStatus);
  router.get("/:id", productos.findOne);
  router.put("/update/:id", productos.update);
  router.delete("/delete/:id", productos.delete);
  router.delete("/delete", productos.deleteAll);

  app.use("/api/productos", router);
};
