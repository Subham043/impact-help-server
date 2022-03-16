const db = require('../../model/connection');
const Images = db.images;

const getAll = async (where) =>{
    try {
        let userData = await Images.findAll({
            where,
            order: [
                ['id', 'DESC'],
            ],
        })
        let response = {
            status: 200,
            message: 'Images recieved successfully',
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

const getAllRaw = async (where) =>{
    try {
        let userData = await Images.findAll({
            where,
            order: [
                ['id', 'DESC'],
            ],
            raw: true
        })
        let response = {
            status: 200,
            message: 'Images recieved successfully',
            data: userData,
            error: false
        }
        return response;
        
    } catch (error) {
        console.log(error);
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
        let userData = await Images.findOne({
            where,
        })
        let response = {
            status: 200,
            message: 'Image recieved successfully',
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

module.exports = {getAll, get, getAllRaw}