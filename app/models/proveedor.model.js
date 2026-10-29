module.exports = (sequelize, Sequelize) => {
  const Proveedor = sequelize.define(
    "proveedor",
    {
      nombre: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      contacto: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      correo: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      direccion: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: "proveedores"
    }
  );

  return Proveedor;
};
