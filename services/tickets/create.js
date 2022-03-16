const db = require('../../model/connection');
const Tickets = db.tickets;

const create = async(title, email, type, course, description, priority, userId) => {
    try {
        let userData = await Tickets.create({ title, email, type, course, description, priority, userId })
        let response = {
            status: 201,
            message: 'Ticket created successfully',
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