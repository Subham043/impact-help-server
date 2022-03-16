const db = require('../../model/connection');
const Tickets = db.tickets;
const Images = db.images;
const User = db.users;

const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };


  const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: tickets } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
  
    return { totalItems, tickets, totalPages, currentPage };
  };

const getAndFindAll = async (where,page,size) =>{
    const { limit, offset } = getPagination(page, size);
    try {
        let userData = await Tickets.findAndCountAll({
            where,
            order: [
                ['id', 'DESC'],
            ],
            limit,
            offset,
        })
        let data = getPagingData(userData, page, limit);
        let response = {
            status: 200,
            message: 'Ticket recieved successfully',
            data: data,
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
        let userData = await Tickets.findAll({
            where,
            order: [
                ['id', 'DESC'],
            ],
        })
        let response = {
            status: 200,
            message: 'Ticket recieved successfully',
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
        let userData = await Tickets.findOne({
            where,
            include: [
                {
                    model: Images,
                    as: "images",
                },
            ],
        })
        let response = {
            status: 200,
            message: 'Ticket recieved successfully',
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

const getTicketUser = async (where) =>{
    try {
        let userData = await Tickets.findOne({
            where,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ['id','name','email','phone','userType']
                },
            ],
        })
        let response = {
            status: 200,
            message: 'Ticket recieved successfully',
            data: userData.dataValues,
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

const getCount = async (where) =>{
    try {
        let userData = await Tickets.count({
            where,
        })
        let response = {
            status: 200,
            message: 'Count recieved successfully',
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

module.exports = {getAll, get, getAndFindAll, getCount, getTicketUser}