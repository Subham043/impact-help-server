const db = require('../../model/connection');
const Users = db.users;

const update = async(where, data) => {
    try {
        let userData = await Users.update(data, {
            where
        })
        let response = {
            status: 200,
            message: 'User updated successfully',
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

module.exports = update;