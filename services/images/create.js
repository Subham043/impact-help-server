const db = require('../../model/connection');
const Images = db.images;

const create = async(name, ticketId, userId) => {
    try {
        let userData = await Images.create({ name, ticketId, userId })
        let response = {
            status: 201,
            message: 'Image stored successfully',
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