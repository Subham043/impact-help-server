const db = require('../../model/connection');
const Users = db.users;

const getAllByEmail = async (email) =>{
    try {
        let userData = await Users.findAll({
            attributes: ['email'],
            where: {
                email,
            }
        })
        let response = {
            status: 200,
            message: 'User recieved successfully',
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

const getAll = async (where) =>{
    try {
        let userData = await Users.findAll({
            where,
        })
        let response = {
            status: 200,
            message: 'User recieved successfully',
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
        let userData = await Users.findOne({
            where,
            attributes: ['id','name','email','phone','userType']
        })
        let response = {
            status: 200,
            message: 'User recieved successfully',
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

const getWithPassword = async (where) =>{
    try {
        let userData = await Users.findOne({
            where,
        })
        let response = {
            status: 200,
            message: 'User recieved successfully',
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

module.exports = {getAllByEmail, getAll, get, getWithPassword}