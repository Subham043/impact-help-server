const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../helper/jwt');
const verifyAdmin  = require('../middleware/admin');
const { body, check, validationResult } = require('express-validator');
const { textValidation, IDValidation } = require('../helper/validation');
const { getAll:getAllTickets, get } = require('../services/tickets/get')
const create = require('../services/notification/create')
const update = require('../services/notification/update')
const getAll = require('../services/notification/get')


// create notification.
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
    //custom validation for title
    body('type').custom(async (value) => IDValidation((value).toString(), 'type')),
    body('seenByUser').custom(async (value) => IDValidation((value).toString(), 'seenByUser')),
    body('seenByAdmin').custom(async (value) => IDValidation((value).toString(), 'seenByAdmin')),
    body('message').custom(async (value) => textValidation(value, 'message')),
    

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { type, seenByUser, seenByAdmin, message } = req.body;
            let data = await getAll({
                userId:req.payload.id,
                ticketId:req.params.ticketId,
                type
            })
            let notificationData;
            if(data.data.length > 0){
                notificationData = await update({userId:req.payload.id, ticketId:req.params.ticketId}, {type, seenByUser, seenByAdmin, message})
            }else{
                notificationData = await create(type, seenByUser, seenByAdmin, message, req.payload.id, req.params.ticketId)
            }
            
            return res.status(notificationData.status).json({
                message: notificationData.message,
            });


        }

    })

    // get all notification.
router.get('/view',
verifyAccessToken,

async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {
        let data = await getAll({
            userId:req.payload.id,
            seenByUser:0,
        })
        
        return res.status(data.status).json({
            message: data.message,
            data: data.data,
        });


    }

})


    //admin routes
    // create notification.
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
//custom validation for title
body('type').custom(async (value) => IDValidation((value).toString(), 'type')),
body('seenByUser').custom(async (value) => IDValidation((value).toString(), 'seenByUser')),
body('seenByAdmin').custom(async (value) => IDValidation((value).toString(), 'seenByAdmin')),
body('message').custom(async (value) => textValidation(value, 'message')),


async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {
        let { type, seenByUser, seenByAdmin, message } = req.body;
        let data = await getAll({
            ticketId:req.params.ticketId,
            type
        })
        let ticket = await get({
            id: req.params.ticketId,
        })
        let notificationData;
        if(data.data.length > 0){
            notificationData = await update({userId:ticket.data.userId, ticketId:req.params.ticketId}, {type, seenByUser, seenByAdmin, message})
        }else{
            notificationData = await create(type, seenByUser, seenByAdmin, message, ticket.data.userId, req.params.ticketId)
        }
        
        return res.status(notificationData.status).json({
            message: notificationData.message,
        });


    }

})

   // get all notification.
   router.get('/admin/view',
   verifyAccessToken,
   verifyAdmin,
   async function (req, res) {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.status(400).json({
               errors: errors.mapped(),
           });
       } else {
           let data = await getAll({
               seenByAdmin:0,
           })
           
           return res.status(data.status).json({
               message: data.message,
               data: data.data,
           });
   
   
       }
   
   })


module.exports = router;