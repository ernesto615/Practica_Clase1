module.exports = (sequelize, Sequelize) => {
  const Producto = sequelize.define(
    "producto",
    {
      codigo: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      proveedorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "proveedores",
          key: "id"
        }
      }
    },
    {
      tableName: "productos"
    }
  );

  return Producto;
};
