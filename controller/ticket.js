const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../helper/jwt');
const { body, check, validationResult } = require('express-validator');
const { emailValidation, emptyTextValidation, textValidation, IDValidation } = require('../helper/validation');
const imageCreate = require('../services/images/create')
const imageDestroy = require('../services/images/delete')
const { getAll: getAllImages, getAllRaw, get:getImage } = require('../services/images/get')
const create = require('../services/tickets/create')
const destroy = require('../services/tickets/delete')
const update = require('../services/tickets/update')
const { getAll, get, getAndFindAll, getCount, getTicketUser } = require('../services/tickets/get')
const uuid4 = require('uuid4');
const fs = require('fs');
const path = require('path');
const verifyAdmin  = require('../middleware/admin');
const {initiationTicketMail, closeTicketMail, waitTicketMail} = require('../helper/mailTemplate')
const {syncMail} = require('../helper/mail')

// create ticket.
router.post('/create',
    verifyAccessToken,
    //custom validation for title
    body('title').custom(async (value) => textValidation(value, 'title')),
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),
    //custom validation for password
    body('type').custom(async (value) => IDValidation(value, 'type')),
    body('priority').custom(async (value) => IDValidation(value, 'priority')),
    body('course').custom(async (value) => textValidation(value, 'course')),
    body('description').custom(async (value) => emptyTextValidation(value, 'description')),
    body('upload').custom(async (value, { req }) => {
        if (req?.files) {

            const file = req.files.upload;
            if (Array.isArray(file)) {

                for (let i = 0; i < file.length; i++) {
                    if (!req.files.upload[i] || Object.keys(req.files.upload[i]).length === 0) {
                        return Promise.reject('Please select a file');
                    }
                    switch (req.files.upload[i].mimetype) {
                        case 'image/png':
                        case 'image/jpg':
                        case 'image/jpeg':
                            return true
                            break;

                        default:
                            return Promise.reject('Invalid image type');
                            break;
                    }
                }
            } else {

                if (!req.files || Object.keys(req.files).length === 0) {
                    return Promise.reject('Please select a file');
                }
                switch (req.files.upload.mimetype) {
                    case 'image/png':
                    case 'image/jpg':
                    case 'image/jpeg':
                        return true
                        break;

                    default:
                        return Promise.reject('Invalid image type');
                        break;
                }

            }
        }

    }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { title, email, type, course, description, priority } = req.body;
            let ticketData = await create(title, email, type, course, description, priority, req.payload.id)
            if (ticketData.error == false && req?.files) {
                const file = req.files.upload;
                if (Array.isArray(file)) {

                    for (let i = 0; i < file.length; i++) {

                        try {
                            let sampleFile = req.files.upload[i];
                            let newFileName = `${uuid4()}-${sampleFile.name}`;
                            let uploadPath = 'public/uploads/' + newFileName;

                            // Use the mv() method to place the file somewhere on your server
                            sampleFile.mv(uploadPath, async function (err) {
                                if (err) { }
                                await imageCreate(newFileName, ticketData.data.id, req.payload.id)
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }

                } else {
                    try {
                        let sampleFile = req.files.upload;
                        let newFileName = `${uuid4()}-${sampleFile.name}`;
                        let uploadPath = 'public/uploads/' + newFileName;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(uploadPath, async function (err) {
                            if (err) { }
                            await imageCreate(newFileName, ticketData.data.id, req.payload.id)
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }

            }
            if(ticketData.error===false){
                let ticketMailData = await getTicketUser({
                    userId: req.payload.id,
                    id: ticketData.data.id
                })
                // console.log(initiationTicketMail(ticketMailData.data));
                let msg = await initiationTicketMail(ticketMailData.data)
                await syncMail(ticketMailData.data.user.dataValues.email,"Impact School Help Desk #"+ticketMailData.data.id,msg)
            }
            return res.status(ticketData.status).json({
                message: ticketData.message,
            });


        }

    })

// delete ticket.
router.delete('/delete/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'ticket id')),
    check('id').custom(async (value, { req }) => {
        let ticket = await getAll({
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
        } else {

            let ticketData = await destroy({id:req.params.id, userId:req.payload.id})

            let images = await getAllRaw({
                ticketId: req.params.id,
                userId: req.payload.id,
            })

            if (images.error == false) {
                if (images.data.length > 0) {
                    const dirPath = path.join(__dirname, '../public/uploads/');
                    images.data.map((item) => {
                        try {
                            fs.unlink(`${dirPath}${item.name}`, async (err) => {
                                if (err) { }
                                await imageDestroy({id:item.id, userId:req.payload.id})
                            });

                        } catch (error) {
                            console.log(error);
                        }
                    })

                }

            }
            return res.status(ticketData.status).json({
                message: ticketData.message,
            });
        }
        
    })


// delete multiple ticket.
router.post('/delete-multiple',
    verifyAccessToken,
    //custom validations
    body('ids').custom(async (value, { req }) => {
        if (value.length == 0) {
            return Promise.reject('Please select atleast one ticket id');
        }
    }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {

            const dirPath = path.join(__dirname, '../public/uploads/');

            req.body?.ids?.map(async(item) => {
                let ticketData = await destroy({id:item, userId:req.payload.id})
    
                let images = await getAllRaw({
                    ticketId: item,
                    userId: req.payload.id,
                })
    
                if (images.error == false) {
                    if (images.data.length > 0) {
    
                        images.data.map(async (item) => {
                            try {
                                fs.unlink(`${dirPath}${item.name}`, async (err) => {
                                    if (err) { }
                                    await imageDestroy({id:item.id, userId:req.payload.id})
                                });
    
                            } catch (error) {
                                console.log(error);
                            }
                        })
    
                    }
    
                }
            })
            
            return res.status(200).json({
                message: "Tickets deleted successfully",
            });
        }
        
    })


// edit ticket.
router.post('/edit/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'ticket id')),
    check('id').custom(async (value, { req }) => {
        let ticket = await getAll({
            id: value,
            userId: req.payload.id,
        })
        if (ticket.data.length == 0) {
            return Promise.reject('Invalid ticket id');
        }
    }),
    body('title').custom(async (value) => textValidation(value, 'title')),
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),
    //custom validation for password
    body('type').custom(async (value) => IDValidation(value, 'type')),
    body('priority').custom(async (value) => IDValidation(value, 'priority')),
    body('course').custom(async (value) => textValidation(value, 'course')),
    body('description').custom(async (value) => emptyTextValidation(value, 'description')),
    body('upload').custom(async (value, { req }) => {
        if (req?.files) {

            const file = req.files.upload;
            if (Array.isArray(file)) {

                for (let i = 0; i < file.length; i++) {
                    if (!req.files.upload[i] || Object.keys(req.files.upload[i]).length === 0) {
                        return Promise.reject('Please select a file');
                    }
                    switch (req.files.upload[i].mimetype) {
                        case 'image/png':
                        case 'image/jpg':
                        case 'image/jpeg':
                            return true
                            break;

                        default:
                            return Promise.reject('Invalid image type');
                            break;
                    }
                }
            } else {

                if (!req.files || Object.keys(req.files).length === 0) {
                    return Promise.reject('Please select a file');
                }
                switch (req.files.upload.mimetype) {
                    case 'image/png':
                    case 'image/jpg':
                    case 'image/jpeg':
                        return true
                        break;

                    default:
                        return Promise.reject('Invalid image type');
                        break;
                }

            }
        }

    }),


    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { title, email, type, course, description, priority } = req.body;
            let updateData = await update({ id: req.params.id, userId: req.payload.id }, { title, email, type, course, description, priority })
            if (updateData.error == false && req?.files) {
                const file = req.files.upload;
                if (Array.isArray(file)) {

                    for (let i = 0; i < file.length; i++) {

                        try {
                            let sampleFile = req.files.upload[i];
                            let newFileName = `${uuid4()}-${sampleFile.name}`;
                            let uploadPath = 'public/uploads/' + newFileName;

                            // Use the mv() method to place the file somewhere on your server
                            sampleFile.mv(uploadPath, async function (err) {
                                if (err) { }
                                await imageCreate(newFileName, req.params.id, req.payload.id)
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }

                } else {
                    try {
                        let sampleFile = req.files.upload;
                        let newFileName = `${uuid4()}-${sampleFile.name}`;
                        let uploadPath = 'public/uploads/' + newFileName;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(uploadPath, async function (err) {
                            if (err) { }
                            await imageCreate(newFileName, req.params.id, req.payload.id)
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }

            }
            return res.status(updateData.status).json({
                message: updateData.message,
            });

        }

    })


// read all ticket.
router.get('/view',
    verifyAccessToken,
    async function (req, res) {
        const { page, size } = req.query;
        let ticket = await getAndFindAll({
            userId: req.payload.id
        }, page, size)
        return res.status(ticket.status).json({
            message: ticket.message,
            data: ticket.data
        });

    })



// read ticket.
router.get('/view/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'ticket id')),
    check('id').custom(async (value, { req }) => {
        let ticket = await getAll({
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
        let ticket = await get({
            userId: req.payload.id,
            id: req.params.id
        })

        return res.status(ticket.status).json({
            message: ticket.message,
            data: ticket.data
        });

    })

// delete ticket-images.
router.delete('/delete-image/:id',
verifyAccessToken,
//custom validations
check('id').custom(async (value) => IDValidation(value, 'image id')),
check('id').custom(async (value, { req }) => {
    let image = await getAllImages({
        id: value,
        userId: req.payload.id,
    })
    if (image.data.length == 0) {
        return Promise.reject('Invalid image id');
    }
}),

async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {

        let imageData = await getImage({
            userId: req.payload.id,
            id: req.params.id
        })

        const dirPath = path.join(__dirname, '../public/uploads/');

        try {
            fs.unlink(`${dirPath}${imageData.data.name}`, async (err) => {
                if (err) {
                    console.log(err);
                 }
                let imageDelData = await imageDestroy({id:imageData.data.id, userId:req.payload.id})
                return res.status(imageDelData.status).json({
                    message: imageDelData.message,
                });
            });

        } catch (error) {
            console.log(error);
            return res.status(400).json({
                message: "Oops! Something went wrong. Please try again.",
            });
        }
    }

})


// read all ticket.
router.get('/get-status-counter',
    verifyAccessToken,
    async function (req, res) {
        let pending = await getCount({
            userId: req.payload.id,
            status:1
        })
        let progress = await getCount({
            userId: req.payload.id,
            status:2
        })
        let completed = await getCount({
            userId: req.payload.id,
            status:3
        })
        const response = [
            {
            name: 'pending',
            value:pending.data,
            color:'#E5285F'
            },
            {
            name: 'progress',
            value:progress.data,
            color:'#5959F7'
            },
            {
            name: 'completed',
            value:completed.data,
            color:'#0EE04E'
            },
        ]
        return res.status(200).json({
            message: 'Count recieved successfully',
            data: response
        });

    })


//admin routes

// read all ticket.
router.get('/admin/view',
    verifyAccessToken,
    verifyAdmin,
    async function (req, res) {
        const { page, size } = req.query;
        let ticket = await getAndFindAll({}, page, size)
        return res.status(ticket.status).json({
            message: ticket.message,
            data: ticket.data
        });

    })

    // read ticket.
router.get('/admin/view/:id',
verifyAccessToken,
verifyAdmin,
//custom validations
check('id').custom(async (value) => IDValidation(value, 'ticket id')),
check('id').custom(async (value, { req }) => {
    let ticket = await getAll({
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
    let ticket = await get({
        id: req.params.id
    })

    return res.status(ticket.status).json({
        message: ticket.message,
        data: ticket.data
    });

})

// delete ticket.
router.delete('/admin/delete/:id',
    verifyAccessToken,
    verifyAdmin,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'ticket id')),
    check('id').custom(async (value, { req }) => {
        let ticket = await getAll({
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
        } else {

            let ticketData = await destroy({id:req.params.id})

            let images = await getAllRaw({
                ticketId: req.params.id,
            })

            if (images.error == false) {
                if (images.data.length > 0) {
                    const dirPath = path.join(__dirname, '../public/uploads/');
                    images.data.map((item) => {
                        try {
                            fs.unlink(`${dirPath}${item.name}`, async (err) => {
                                if (err) { }
                                await imageDestroy({id:item.id})
                            });

                        } catch (error) {
                            console.log(error);
                        }
                    })

                }

            }
            return res.status(ticketData.status).json({
                message: ticketData.message,
            });
        }
        
    })

    // delete multiple ticket.
router.post('/admin/delete-multiple',
verifyAccessToken,
verifyAdmin,
//custom validations
body('ids').custom(async (value, { req }) => {
    if (value.length == 0) {
        return Promise.reject('Please select atleast one ticket id');
    }
}),

async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {

        const dirPath = path.join(__dirname, '../public/uploads/');

        req.body?.ids?.map(async(item) => {
            let ticketData = await destroy({id:item})

            let images = await getAllRaw({
                ticketId: item,
            })

            if (images.error == false) {
                if (images.data.length > 0) {

                    images.data.map(async (item) => {
                        try {
                            fs.unlink(`${dirPath}${item.name}`, async (err) => {
                                if (err) { }
                                await imageDestroy({id:item.id})
                            });

                        } catch (error) {
                            console.log(error);
                        }
                    })

                }

            }
        })
        
        return res.status(200).json({
            message: "Tickets deleted successfully",
        });
    }
    
})

// read all ticket.
router.get('/admin/get-status-counter',
    verifyAccessToken,
    verifyAdmin,
    async function (req, res) {
        let pending = await getCount({
            status:1
        })
        let progress = await getCount({
            status:2
        })
        let completed = await getCount({
            status:3
        })
        const response = [
            {
            name: 'pending',
            value:pending.data,
            color:'#E5285F'
            },
            {
            name: 'progress',
            value:progress.data,
            color:'#5959F7'
            },
            {
            name: 'completed',
            value:completed.data,
            color:'#0EE04E'
            },
        ]
        return res.status(200).json({
            message: 'Count recieved successfully',
            data: response
        });

    })


    // edit ticket.
router.post('/admin/edit/:id',
verifyAccessToken,
verifyAdmin,
//custom validations
check('id').custom(async (value) => IDValidation(value, 'ticket id')),
check('id').custom(async (value, { req }) => {
    let ticket = await getAll({
        id: value,
    })
    if (ticket.data.length == 0) {
        return Promise.reject('Invalid ticket id');
    }
}),
body('title').custom(async (value) => textValidation(value, 'title')),
//custom validation for email
body('email').custom(async (value) => emailValidation(value)),
//custom validation for password
body('type').custom(async (value) => IDValidation(value, 'type')),
body('priority').custom(async (value) => IDValidation(value, 'priority')),
body('course').custom(async (value) => textValidation(value, 'course')),
body('description').custom(async (value) => emptyTextValidation(value, 'description')),
body('upload').custom(async (value, { req }) => {
    if (req?.files) {

        const file = req.files.upload;
        if (Array.isArray(file)) {

            for (let i = 0; i < file.length; i++) {
                if (!req.files.upload[i] || Object.keys(req.files.upload[i]).length === 0) {
                    return Promise.reject('Please select a file');
                }
                switch (req.files.upload[i].mimetype) {
                    case 'image/png':
                    case 'image/jpg':
                    case 'image/jpeg':
                        return true
                        break;

                    default:
                        return Promise.reject('Invalid image type');
                        break;
                }
            }
        } else {

            if (!req.files || Object.keys(req.files).length === 0) {
                return Promise.reject('Please select a file');
            }
            switch (req.files.upload.mimetype) {
                case 'image/png':
                case 'image/jpg':
                case 'image/jpeg':
                    return true
                    break;

                default:
                    return Promise.reject('Invalid image type');
                    break;
            }

        }
    }

}),


async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {
        let { userId, title, email, type, course, description, priority, status } = req.body;
        let updateData = await update({ id: req.params.id }, { title, email, type, course, description, priority, status })
        if (updateData.error == false && req?.files) {
            const file = req.files.upload;
            if (Array.isArray(file)) {

                for (let i = 0; i < file.length; i++) {

                    try {
                        let sampleFile = req.files.upload[i];
                        let newFileName = `${uuid4()}-${sampleFile.name}`;
                        let uploadPath = 'public/uploads/' + newFileName;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(uploadPath, async function (err) {
                            if (err) { }
                            await imageCreate(newFileName, req.params.id, userId)
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }

            } else {
                try {
                    let sampleFile = req.files.upload;
                    let newFileName = `${uuid4()}-${sampleFile.name}`;
                    let uploadPath = 'public/uploads/' + newFileName;

                    // Use the mv() method to place the file somewhere on your server
                    sampleFile.mv(uploadPath, async function (err) {
                        if (err) { }
                        await imageCreate(newFileName, req.params.id, userId)
                    });
                } catch (error) {
                    console.log(error);
                }
            }

        }
        return res.status(updateData.status).json({
            message: updateData.message,
        });

    }

})

// delete ticket-images.
router.delete('/admin/delete-image/:id',
verifyAccessToken,
verifyAdmin,
//custom validations
check('id').custom(async (value) => IDValidation(value, 'image id')),
check('id').custom(async (value, { req }) => {
    let image = await getAllImages({
        id: value,
    })
    if (image.data.length == 0) {
        return Promise.reject('Invalid image id');
    }
}),

async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {

        let imageData = await getImage({
            id: req.params.id
        })

        const dirPath = path.join(__dirname, '../public/uploads/');

        try {
            fs.unlink(`${dirPath}${imageData.data.name}`, async (err) => {
                if (err) {
                    console.log(err);
                 }
                let imageDelData = await imageDestroy({id:imageData.data.id})
                return res.status(imageDelData.status).json({
                    message: imageDelData.message,
                });
            });

        } catch (error) {
            console.log(error);
            return res.status(400).json({
                message: "Oops! Something went wrong. Please try again.",
            });
        }
    }

})

// edit ticket.
router.post('/admin/status/:id',
    verifyAccessToken,
    verifyAdmin,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'ticket id')),
    check('id').custom(async (value, { req }) => {
        let ticket = await getAll({
            id: value,
        })
        if (ticket.data.length == 0) {
            return Promise.reject('Invalid ticket id');
        }
    }),
    body('status').custom(async (value) => IDValidation(value, 'status')),
    
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { status } = req.body;
            let updateData = await update({ id: req.params.id }, { status })

            if(updateData.error===false && status==3){
                let ticketMailData = await getTicketUser({
                    id: req.params.id
                })
                let msg = await waitTicketMail(ticketMailData.data)
                await syncMail(ticketMailData.data.user.dataValues.email,"Impact School Help Desk #"+ticketMailData.data.id,msg)
            }

            if(updateData.error===false && status==4){
                let ticketMailData = await getTicketUser({
                    id: req.params.id
                })
                let msg = await closeTicketMail(ticketMailData.data)
                await syncMail(ticketMailData.data.user.dataValues.email,"Impact School Help Desk #"+ticketMailData.data.id,msg)
            }
            
            return res.status(updateData.status).json({
                message: updateData.message,
            });

        }

    })






module.exports = router;