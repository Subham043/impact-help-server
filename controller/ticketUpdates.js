const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../helper/jwt');
const { body, check, validationResult } = require('express-validator');
const { getAll:getAllTickets } = require('../services/tickets/get')
const { textValidation, IDValidation } = require('../helper/validation');
const create = require('../services/ticketUpdates/create')
const {getAll} = require('../services/ticketUpdates/get')
const verifyAdmin  = require('../middleware/admin');

// create ticket update.
router.post('/create/:ticketId',
    verifyAccessToken,
    check('ticketId').custom(async (value) => IDValidation(value, 'ticket id')),
    check('ticketId').custom(async (value, { req }) => {
        let ticket = await getAllTickets({
            id: value,
            userId: req.payload.id,
        })
        if (ticket.data.length == 0) {
            return Promise.reject('Invalid ticket id');
        }
    }),
    body('message').custom(async (value) => textValidation(value, 'message')),
    

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { message } = req.body;
            let ticketData = await create(message, req.params.ticketId, req.payload.id)
            
            return res.status(ticketData.status).json({
                message: ticketData.message,
                data: ticketData.data
            });


        }

    })

    // read all ticket updates.
router.get('/view/:ticketId',
verifyAccessToken,
check('ticketId').custom(async (value) => IDValidation(value, 'ticket id')),
check('ticketId').custom(async (value, { req }) => {
    let ticket = await getAllTickets({
        id: value,
        userId: req.payload.id,
    })
    if (ticket.data.length == 0) {
        return Promise.reject('Invalid ticket id');
    }
}),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    }
    let ticketData = await getAll({
        ticketId:req.params.ticketId,
    })
    return res.status(ticketData.status).json({
        message: ticketData.message,
        data: ticketData.data
    });

})


// create admin ticket update.
router.post('/admin/create/:ticketId',
    verifyAccessToken,
    verifyAdmin,
    check('ticketId').custom(async (value) => IDValidation(value, 'ticket id')),
    check('ticketId').custom(async (value, { req }) => {
        let ticket = await getAllTickets({
            id: value,
        })
        if (ticket.data.length == 0) {
            return Promise.reject('Invalid ticket id');
        }
    }),
    body('message').custom(async (value) => textValidation(value, 'message')),
    

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { message } = req.body;
            let ticketData = await create(message, req.params.ticketId, req.payload.id)
            
            return res.status(ticketData.status).json({
                message: ticketData.message,
                data: ticketData.data
            });


        }

    })

    // read all ticket.
router.get('/admin/view/:ticketId',
verifyAccessToken,
verifyAdmin,
check('ticketId').custom(async (value) => IDValidation(value, 'ticket id')),
check('ticketId').custom(async (value, { req }) => {
    let ticket = await getAllTickets({
        id: value,
    })
    if (ticket.data.length == 0) {
        return Promise.reject('Invalid ticket id');
    }
}),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    }
    let ticketData = await getAll({
        ticketId:req.params.ticketId,
    })
    return res.status(ticketData.status).json({
        message: ticketData.message,
        data: ticketData.data
    });

})



module.exports = router;