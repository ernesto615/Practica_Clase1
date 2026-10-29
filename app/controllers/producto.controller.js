const Joi = require("joi");
const db = require("../models");

const Producto = db.productos;
const Proveedor = db.proveedores;
const Op = db.Sequelize.Op;

const productoCreateSchema = Joi.object({
  codigo: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]{2,40}$/)
    .required()
    .messages({
      "string.pattern.base":
        "El código solo puede contener letras, números, guion y guion bajo."
    }),
  nombre: Joi.string().trim().min(2).max(120).required(),
  descripcion: Joi.string().trim().max(300).allow("", null),
  precio: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).default(0),
  status: Joi.boolean().default(true),
  proveedorId: Joi.number().integer().positive().required()
});

const productoUpdateSchema = productoCreateSchema
  .fork(["codigo", "nombre", "precio", "proveedorId"], schema =>
    schema.optional()
  )
  .min(1);

const sendDatabaseError = (res, error, defaultMessage) => {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).send({
      message: "Ya existe un producto con el código proporcionado."
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).send({
      message: "El proveedor indicado no existe."
    });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).send({
      message: error.errors.map(item => item.message).join(", ")
    });
  }

  return res.status(500).send({
    message: error.message || defaultMessage
  });
};

const proveedorExiste = async proveedorId => {
  const proveedor = await Proveedor.findByPk(proveedorId);
  return Boolean(proveedor);
};

exports.create = async (req, res) => {
  const { error, value } = productoCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).send({
      message: "Datos de producto inválidos.",
      errors: error.details.map(detail => detail.message)
    });
  }

  try {
    if (!(await proveedorExiste(value.proveedorId))) {
      return res.status(400).send({
        message: `El proveedor con id=${value.proveedorId} no existe.`
      });
    }

    const producto = await Producto.create(value);
    const productoCreado = await Producto.findByPk(producto.id, {
      include: [{ model: Proveedor, as: "proveedor" }]
    });

    return res.status(201).send(productoCreado);
  } catch (databaseError) {
    return sendDatabaseError(
      res,
      databaseError,
      "Ocurrió un error al crear el producto."
    );
  }
};

exports.findAll = async (req, res) => {
  try {
    const search = req.query.nombre?.trim() || req.query.codigo?.trim();
    const condition = search
      ? {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${search}%` } },
            { codigo: { [Op.iLike]: `%${search}%` } }
          ]
        }
      : undefined;

    const productos = await Producto.findAll({
      where: condition,
      include: [{ model: Proveedor, as: "proveedor" }],
      order: [["id", "ASC"]]
    });

    return res.send(productos);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al consultar los productos."
    );
  }
};

exports.findOne = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [{ model: Proveedor, as: "proveedor" }]
    });

    if (!producto) {
      return res.status(404).send({
        message: `No se encontró el producto con id=${req.params.id}.`
      });
    }

    return res.send(producto);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      `Ocurrió un error al consultar el producto con id=${req.params.id}.`
    );
  }
};

exports.update = async (req, res) => {
  const { error, value } = productoUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    noDefaults: true
  });

  if (error) {
    return res.status(400).send({
      message: "Datos de producto inválidos.",
      errors: error.details.map(detail => detail.message)
    });
  }

  try {
    if (
      value.proveedorId !== undefined &&
      !(await proveedorExiste(value.proveedorId))
    ) {
      return res.status(400).send({
        message: `El proveedor con id=${value.proveedorId} no existe.`
      });
    }

    const [updatedRows] = await Producto.update(value, {
      where: { id: req.params.id }
    });

    if (updatedRows !== 1) {
      return res.status(404).send({
        message: `No se encontró el producto con id=${req.params.id}.`
      });
    }

    const productoActualizado = await Producto.findByPk(req.params.id, {
      include: [{ model: Proveedor, as: "proveedor" }]
    });

    return res.send({
      message: "Producto actualizado correctamente.",
      data: productoActualizado
    });
  } catch (databaseError) {
    return sendDatabaseError(
      res,
      databaseError,
      `Ocurrió un error al actualizar el producto con id=${req.params.id}.`
    );
  }
};

exports.delete = async (req, res) => {
  try {
    const deletedRows = await Producto.destroy({
      where: { id: req.params.id }
    });

    if (deletedRows !== 1) {
      return res.status(404).send({
        message: `No se encontró el producto con id=${req.params.id}.`
      });
    }

    return res.send({ message: "Producto eliminado correctamente." });
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      `Ocurrió un error al eliminar el producto con id=${req.params.id}.`
    );
  }
};

exports.deleteAll = async (_req, res) => {
  try {
    const deletedRows = await Producto.destroy({
      where: {},
      truncate: false
    });

    return res.send({
      message: `${deletedRows} producto(s) fueron eliminados correctamente.`
    });
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al eliminar los productos."
    );
  }
};

exports.findAllStatus = async (_req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { status: true },
      include: [{ model: Proveedor, as: "proveedor" }],
      order: [["id", "ASC"]]
    });

    return res.send(productos);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al consultar los productos activos."
    );
  }
};
