const db = require('../../model/connection');
const Notification = db.notification;

const create = async(type, seenByUser, seenByAdmin, message, userId, ticketId) => {
    try {
        let userData = await Notification.create({ type, seenByUser, seenByAdmin, message, userId, ticketId })
        let response = {
            status: 201,
            message: 'Notification created successfully',
            data: userData.dataValues,
            error: false
        }
        return response;
        
    } catch (error) {
        let response = {
            status: 400,
            message: 'Oops! Something went wrong. Please try again',
            data: null,
            error: true
        }
        return response;
    }
}

module.exports = create