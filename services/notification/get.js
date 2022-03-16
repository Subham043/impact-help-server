const db = require('../../model/connection');
const Notification = db.notification;

const getAll = async (where) =>{
    try {
        let userData = await Notification.findAll({
            where,
            order: [
                ['id', 'DESC'],
            ],
        })
        let response = {
            status: 200,
            message: 'Notification recieved successfully',
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

module.exports = getAll;