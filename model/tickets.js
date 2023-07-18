module.exports = (sequelize, DataTypes) => {
    const Tickets = sequelize.define(
      "tickets",
      {
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        priority: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue:1
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue:1
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
    return Tickets;
  };