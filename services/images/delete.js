const db = require('../../model/connection');
const Images = db.images;

const destroy = async(where) => {
    try {
        let ticketData = await Images.destroy({
            where
        })
        let response = {
            status: 200,
            message: 'Image deleted successfully',
            data: null,
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

module.exports = destroy;