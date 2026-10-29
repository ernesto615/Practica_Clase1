const Joi = require("joi");
const db = require("../models");

const Proveedor = db.proveedores;
const Producto = db.productos;
const Op = db.Sequelize.Op;

const telefonoPattern = /^[0-9+()\-\s]{8,20}$/;

const proveedorCreateSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required(),
  contacto: Joi.string().trim().max(120).allow("", null),
  correo: Joi.string().trim().lowercase().email().max(150).required(),
  telefono: Joi.string()
    .trim()
    .pattern(telefonoPattern)
    .allow("", null)
    .messages({
      "string.pattern.base": "El teléfono debe contener entre 8 y 20 caracteres válidos."
    }),
  direccion: Joi.string().trim().max(200).allow("", null),
  status: Joi.boolean().default(true)
});

const proveedorUpdateSchema = proveedorCreateSchema
  .fork(["nombre", "correo"], schema => schema.optional())
  .min(1);

const sendDatabaseError = (res, error, defaultMessage) => {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).send({
      message: "Ya existe un proveedor con el correo proporcionado."
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).send({
      message: "No se puede eliminar el proveedor porque tiene productos asociados."
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

exports.create = async (req, res) => {
  const { error, value } = proveedorCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).send({
      message: "Datos de proveedor inválidos.",
      errors: error.details.map(detail => detail.message)
    });
  }

  try {
    const proveedor = await Proveedor.create(value);
    return res.status(201).send(proveedor);
  } catch (databaseError) {
    return sendDatabaseError(
      res,
      databaseError,
      "Ocurrió un error al crear el proveedor."
    );
  }
};

exports.findAll = async (req, res) => {
  try {
    const nombre = req.query.nombre?.trim();
    const condition = nombre
      ? { nombre: { [Op.iLike]: `%${nombre}%` } }
      : undefined;

    const proveedores = await Proveedor.findAll({
      where: condition,
      order: [["id", "ASC"]]
    });

    return res.send(proveedores);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al consultar los proveedores."
    );
  }
};

exports.findOne = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id, {
      include: [
        {
          model: Producto,
          as: "productos"
        }
      ]
    });

    if (!proveedor) {
      return res.status(404).send({
        message: `No se encontró el proveedor con id=${req.params.id}.`
      });
    }

    return res.send(proveedor);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      `Ocurrió un error al consultar el proveedor con id=${req.params.id}.`
    );
  }
};

exports.update = async (req, res) => {
  const { error, value } = proveedorUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    noDefaults: true
  });

  if (error) {
    return res.status(400).send({
      message: "Datos de proveedor inválidos.",
      errors: error.details.map(detail => detail.message)
    });
  }

  try {
    const [updatedRows] = await Proveedor.update(value, {
      where: { id: req.params.id }
    });

    if (updatedRows !== 1) {
      return res.status(404).send({
        message: `No se encontró el proveedor con id=${req.params.id}.`
      });
    }

    const proveedorActualizado = await Proveedor.findByPk(req.params.id);
    return res.send({
      message: "Proveedor actualizado correctamente.",
      data: proveedorActualizado
    });
  } catch (databaseError) {
    return sendDatabaseError(
      res,
      databaseError,
      `Ocurrió un error al actualizar el proveedor con id=${req.params.id}.`
    );
  }
};

exports.delete = async (req, res) => {
  try {
    const deletedRows = await Proveedor.destroy({
      where: { id: req.params.id }
    });

    if (deletedRows !== 1) {
      return res.status(404).send({
        message: `No se encontró el proveedor con id=${req.params.id}.`
      });
    }

    return res.send({ message: "Proveedor eliminado correctamente." });
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      `Ocurrió un error al eliminar el proveedor con id=${req.params.id}.`
    );
  }
};

exports.deleteAll = async (_req, res) => {
  try {
    const deletedRows = await Proveedor.destroy({
      where: {},
      truncate: false
    });

    return res.send({
      message: `${deletedRows} proveedor(es) fueron eliminados correctamente.`
    });
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al eliminar los proveedores."
    );
  }
};

exports.findAllStatus = async (_req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: { status: true },
      order: [["id", "ASC"]]
    });

    return res.send(proveedores);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al consultar los proveedores activos."
    );
  }
};
