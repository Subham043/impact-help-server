module.exports = (sequelize, DataTypes) => {
    const Notifications = sequelize.define(
      "notifications",
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
        type: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        seenByUser: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        seenByAdmin: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
    return Notifications;
  };