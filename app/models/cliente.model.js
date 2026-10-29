module.exports = (sequelize, Sequelize) => {
  const Cliente = sequelize.define(
    "cliente",
    {
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING(200),
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
      ingreso: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: "clientes"
    }
  );

  return Cliente;
};
