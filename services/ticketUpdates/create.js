const db = require('../../model/connection');
const ticketUpdates = db.ticketUpdates;
const User = db.users;

const create = async(message, ticketId, userId) => {
    try {
        let userData = await ticketUpdates.create({ message, ticketId, userId })
        let TicketUpdateData = await ticketUpdates.findOne({
            where: { ticketId, userId,id:userData.dataValues.id},
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: {exclude: ['password', 'changePassword','created_at','otp','updated_at','verified']},
                },
            ],
            order: [
                ['id', 'ASC'],
            ],
        })
        let response = {
            status: 201,
            message: 'Ticket Update created successfully',
            data: TicketUpdateData,
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