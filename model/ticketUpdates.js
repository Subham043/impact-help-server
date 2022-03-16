module.exports = (sequelize, DataTypes) => {
    const ticketUpdates = sequelize.define(
      "ticketUpdates",
      {
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        ticketId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
    return ticketUpdates;
  };