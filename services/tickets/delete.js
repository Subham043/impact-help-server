const db = require('../../model/connection');
const Tickets = db.tickets;

const destroy = async(where) => {
    try {
        let ticketData = await Tickets.destroy({
            where
        })
        let response = {
            status: 200,
            message: 'Ticket deleted successfully',
            data: null,
            error: false
        }
        return response;
        
    } catch (error) {
        console.log(error)
        let response = {
            status: 400,
            message: 'Oops! Something went wrong. Please try again',
            data: null,
            error: true
        }
        return response;
    }
}

module.exports = destroy;