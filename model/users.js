module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define(
      "users",
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        phone: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        otp: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        verified: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue:0
        },
        userType: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue:2
        },
        changePassword: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue:0
        },
        created_at: {
          type: "TIMESTAMP",
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
          allowNull: false,
        },
        updated_at: {
          type: "TIMESTAMP",
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
          allowNull: false,
        },
      },
      {
        timestamps: false,
      }
    );
    return Users;
  };