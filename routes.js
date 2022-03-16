
const authController = require('./controller/auth');
const ticketController = require('./controller/ticket');
const ticketUpdatesController = require('./controller/ticketUpdates');
const notificationController = require('./controller/notification');


const routes = [
    { path: '/auth', controller: authController },
    { path: '/ticket', controller: ticketController },
    { path: '/ticket-updates', controller: ticketUpdatesController },
    { path: '/notification', controller: notificationController },
];

module.exports = routes;