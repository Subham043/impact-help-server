const db = require('../../model/connection');
const ticketUpdates = db.ticketUpdates;
const User = db.users;

const getAll = async (where) =>{
    try {
        let userData = await ticketUpdates.findAll({
            where,
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
            status: 200,
            message: 'Ticket Updates recieved successfully',
            data: userData,
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

const get = async (where) =>{
    try {
        let userData = await ticketUpdates.findOne({
            where,
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
            status: 200,
            message: 'Ticket Updates recieved successfully',
            data: userData,
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


module.exports = {getAll, get}