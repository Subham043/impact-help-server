const { Sequelize, DataTypes } = require("sequelize");

// const sequelize = new Sequelize('impact_help', 'root', '', {
//     host: 'localhost',
//     dialect: 'mysql',
//     logging: false, //sql query logging in console
//     pool: { max: 5, min: 0, idle: 10000 }
// })

const sequelize = new Sequelize('impact_app', 'root', 'impact',{
    host:'127.0.0.1',
    port: '4306',
    dialect: 'mysql',
    logging: false, //sql query logging in console
    pool:{max:5,min:0,idle:10000}
})


sequelize.authenticate()
    .then(() => {
        console.log("database connected");
    })
    .catch((err) => {
        console.log('error: ', err);
    })

const db = {};
db.sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize.sync({ force: false })
    .then(() => {
        console.log("synced")
    })
    .catch((err) => {
        console.log('error: ', err);
    })

//usermodel
const User = require('./users')(sequelize, DataTypes);
db.users = User;

const Ticket = require('./tickets')(sequelize, DataTypes);
db.tickets = Ticket;

const Images = require('./images')(sequelize, DataTypes);
db.images = Images;

const ticketUpdates = require('./ticketUpdates')(sequelize, DataTypes);
db.ticketUpdates = ticketUpdates;

const Notifications = require('./notification')(sequelize, DataTypes);
db.notification = Notifications;

//user-ticket
User.hasMany(Ticket, { as: "ticket" });
Ticket.belongsTo(User, {
    foreignKey: "userId",
});

//ticket-images
Ticket.hasMany(Images, { as: "images" });
Images.belongsTo(Ticket, {
    foreignKey: "ticketId",
});

//ticket-updates
Ticket.hasMany(ticketUpdates, { as: "upadates" });
ticketUpdates.belongsTo(Ticket, {
    foreignKey: "ticketId",
});

//user-updates
User.hasMany(ticketUpdates, { as: "upadate" });
ticketUpdates.belongsTo(User, {
    foreignKey: "userId",
});

//ticket-notifications
Ticket.hasMany(Notifications, { as: "notifications" });
Notifications.belongsTo(Ticket, {
    foreignKey: "ticketId",
});

//user-updates
User.hasMany(Notifications, { as: "notification" });
Notifications.belongsTo(User, {
    foreignKey: "userId",
});



module.exports = db;
