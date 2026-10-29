const Joi = require("joi");
const db = require("../models");

const Cliente = db.clientes;
const Op = db.Sequelize.Op;

const telefonoPattern = /^[0-9+()\-\s]{8,20}$/;

const clienteCreateSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).required(),
  apellido: Joi.string().trim().min(2).max(100).required(),
  direccion: Joi.string().trim().max(200).allow("", null),
  correo: Joi.string().trim().lowercase().email().max(150).required(),
  telefono: Joi.string()
    .trim()
    .pattern(telefonoPattern)
    .allow("", null)
    .messages({
      "string.pattern.base": "El teléfono debe contener entre 8 y 20 caracteres válidos."
    }),
  ingreso: Joi.date().iso().optional(),
  status: Joi.boolean().default(false)
});

const clienteUpdateSchema = clienteCreateSchema
  .fork(["nombre", "apellido", "correo"], schema => schema.optional())
  .min(1);

const sendDatabaseError = (res, error, defaultMessage) => {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).send({
      message: "Ya existe un cliente con el correo proporcionado."
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
  const { error, value } = clienteCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).send({
      message: "Datos de cliente inválidos.",
      errors: error.details.map(detail => detail.message)
    });
  }

  try {
    const cliente = await Cliente.create(value);
    return res.status(201).send(cliente);
  } catch (databaseError) {
    return sendDatabaseError(
      res,
      databaseError,
      "Ocurrió un error al crear el cliente."
    );
  }
};

exports.findAll = async (req, res) => {
  try {
    const nombre = req.query.nombre?.trim();
    const condition = nombre
      ? { nombre: { [Op.iLike]: `%${nombre}%` } }
      : undefined;

    const clientes = await Cliente.findAll({
      where: condition,
      order: [["id", "ASC"]]
    });

    return res.send(clientes);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al consultar los clientes."
    );
  }
};

exports.findOne = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).send({
        message: `No se encontró el cliente con id=${req.params.id}.`
      });
    }

    return res.send(cliente);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      `Ocurrió un error al consultar el cliente con id=${req.params.id}.`
    );
  }
};

exports.update = async (req, res) => {
  const { error, value } = clienteUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    noDefaults: true
  });

  if (error) {
    return res.status(400).send({
      message: "Datos de cliente inválidos.",
      errors: error.details.map(detail => detail.message)
    });
  }

  try {
    const [updatedRows] = await Cliente.update(value, {
      where: { id: req.params.id }
    });

    if (updatedRows !== 1) {
      return res.status(404).send({
        message: `No se encontró el cliente con id=${req.params.id}.`
      });
    }

    const clienteActualizado = await Cliente.findByPk(req.params.id);
    return res.send({
      message: "Cliente actualizado correctamente.",
      data: clienteActualizado
    });
  } catch (databaseError) {
    return sendDatabaseError(
      res,
      databaseError,
      `Ocurrió un error al actualizar el cliente con id=${req.params.id}.`
    );
  }
};

exports.delete = async (req, res) => {
  try {
    const deletedRows = await Cliente.destroy({
      where: { id: req.params.id }
    });

    if (deletedRows !== 1) {
      return res.status(404).send({
        message: `No se encontró el cliente con id=${req.params.id}.`
      });
    }

    return res.send({ message: "Cliente eliminado correctamente." });
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      `Ocurrió un error al eliminar el cliente con id=${req.params.id}.`
    );
  }
};

exports.deleteAll = async (_req, res) => {
  try {
    const deletedRows = await Cliente.destroy({
      where: {},
      truncate: false
    });

    return res.send({
      message: `${deletedRows} cliente(s) fueron eliminados correctamente.`
    });
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al eliminar los clientes."
    );
  }
};

exports.findAllStatus = async (_req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { status: true },
      order: [["id", "ASC"]]
    });

    return res.send(clientes);
  } catch (error) {
    return sendDatabaseError(
      res,
      error,
      "Ocurrió un error al consultar los clientes activos."
    );
  }
};
