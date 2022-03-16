const bcrypt = require('bcryptjs')
const db = require('../../model/connection');
const Users = db.users;

const create = async(name, email, phone, password) => {
    const hashPassword = bcrypt.hashSync(password, 10);
    const otp = (Math.floor(100000 + Math.random() * 900000));
    try {
        let userData = await Users.create({ name, phone, email, password: hashPassword, otp })
        let response = {
            status: 201,
            message: 'User registered successfully',
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