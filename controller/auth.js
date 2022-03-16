const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { nameValidation, phoneValidation, emailValidation, passwordValidation, cpasswordValidation, otpValidation } = require('../helper/validation');
const create = require('../services/users/create')
const destroy = require('../services/users/delete')
const update = require('../services/users/update')
const { getAllByEmail, getAll, get, getWithPassword } = require('../services/users/get')
const { syncMail, asyncMail } = require('../helper/mail');
const { encrypt, decrypt } = require('../helper/crypt');
const bcrypt = require('bcryptjs')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helper/jwt');
const { verifyAccessToken } = require('../helper/jwt');



// registration page route.
router.post('/register',
    //custom validation for name
    body('name').custom(async (value) => nameValidation(value)),
    //custom validation for phone
    body('phone').custom(async (value) => phoneValidation((value).toString())),
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),
    body('email').custom(async (value) => {
        let user = await getAllByEmail(value)
        if (user.data.length > 0) {
            return Promise.reject('E-mail already in use');
        }
    }),
    //custom validation for password
    body('password').custom(async (value) => passwordValidation(value)),
    // password must be at least 5 chars long
    body('cpassword').custom((value, { req }) => cpasswordValidation(value, { req })),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { name, email, phone, password } = req.body;
            let userData = await create(name, email, phone, password )
            if(userData.error==true) {
                return res.status(userData.status).json({
                    message: userData.message,
                });
            }
            
            try {
                await asyncMail(userData.data.email, 'Email Verification', `<h3>Your otp is ${userData.data.otp}</h3><br>`);
                return res.status(200).json({
                    message: 'Kindly check your email for verification process',
                    id: encrypt(userData.data.id)
                });
            } catch (error) {
                console.log(error);
                await destroy(userData.data.id)
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })


// email verification.
router.post('/verify/:userId',
//custom validation for phone
body('otp').custom(async (value) => otpValidation((value).toString())),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {
        let id = ""
        try {
            id = await decrypt(req.params.userId);
        } catch (error) {
            return res.status(400).json({
                message: 'Invalid user id',
            });
        }
        let data = await getAll({id: id,verified: 0})
        if (data.data.length == 0) {
            return res.status(400).json({
                message: 'Invalid user id',
            });
        }
        let { otp } = req.body;
        let updateData = await getAll({id: id,verified: 0, otp})
        if (updateData.data.length > 0) {
            const otp = (Math.floor(100000 + Math.random() * 900000));
            let userData = await update({id: id}, { otp, verified: 1, })
            if(userData.error==true) {
                return res.status(userData.status).json({
                    message: userData.message,
                });
            }
            
            return res.status(200).json({
                message: 'Email verified',
            });
        } else {
            return res.status(400).json({
                message: 'Invalid OTP',
            });
        }
    }

})


// forgot password
router.post('/forgot-password',
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),

    body('email').custom(async (value) => {
        let user = await getAll({email: value, verified: 1})
        
        if (user.data.length < 1) {
            return Promise.reject('E-mail does not exist!!');
        }
    }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { email } = req.body;
            let data = await get( {
                email,
                verified: 1,
            })
            const otp = (Math.floor(100000 + Math.random() * 900000));
            let userData = await  update({email, verified: 1}, { otp, changePassword: 1, })
            
            syncMail(email, 'Reset Password', `<h3>Your otp is ${otp}</h3><br>`);
            return res.status(200).json({
                message: 'Kindly check your email in order to reset your password',
                id: encrypt(data.data.id)
            });
        }

    })


    // reset password.
router.post('/reset-password/:userId',
//custom validation for otp
body('otp').custom(async (value) => otpValidation((value).toString())),
//custom validation for name
body('password').custom(async (value) => passwordValidation(value)),
// password must be at least 5 chars long
body('cpassword').custom((value, { req }) => cpasswordValidation(value, { req })),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {
        let id = ""
        try {
            id = await decrypt(req.params.userId);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid user id',
            });
        }
        let data = await getAll({
            id: id,
            verified: 1,
            changePassword: 1
        })
        if (data.data.length == 0) {
            return res.status(400).json({
                error: 'Invalid user id',
            });
        }
        let { otp, password } = req.body;
        let updateData = await getAll({
            id: id,
            verified: 1,
            changePassword: 1,
            otp
        })
        
        if (updateData.data.length > 0) {
            const otp = (Math.floor(100000 + Math.random() * 900000));
            await update({id: id},{ otp, changePassword: 0, password: bcrypt.hashSync(password, 10) })
            return res.status(200).json({
                message: 'Password Reset Successful',
            });
        } else {
            return res.status(400).json({
                message: 'Invalid OTP',
            });
        }
    }

})



// login page route.
router.post('/login',
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),

    body('email').custom(async (value) => {
        let user = await getAll({
            email: value,
            verified: 1, 
        });
        if (user.data.length < 1) {
            return Promise.reject('E-mail does not exist');
        }
    }),
    //custom validation for password
    body('password').custom(async (value) => passwordValidation(value)),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { email, password } = req.body;
            let userDet = await get({
                email: email,
                verified: 1,
            })

            let user = await getWithPassword({
                email: email,
                verified: 1,
            })
            
            if (bcrypt.compareSync(password, user.data.password)) {
                let accessToken = await signAccessToken(user.data.id)
                let refreshToken = await signRefreshToken(user.data.id)
                res.cookie('refreshToken',refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite:'None', secure: true});
                return res.status(200).json({
                    message: 'Logged In Successfully',
                    user:userDet.data,
                    accessToken,
                    refreshToken
                });
            } else {
                return res.status(400).json({
                    message: 'Invalid Password',
                });
            }
        }

    })


    // refresh token route.
router.get('/refresh-token',
async function (req, res) {
    try {
        // if (!req.headers['refreshtoken']) {
        //     return res.status(200).json({
        //         message: 'Unauthorised',
        //     });
        // }
        // const rToken = req.headers['refreshtoken'];
        const cookies = req.cookies;
        if(!cookies?.refreshToken){
            return res.status(401).json({
                message: 'Unauthorised',
            });
        }
        const rToken = cookies.refreshToken;
        let id = await verifyRefreshToken(rToken)
        let accessToken = await signAccessToken(id)
        let user = await get({
            id,
            verified: 1,
        })
        // let refreshToken = await signRefreshToken(id)
        // res.cookie('refreshToken', refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        return res.status(200).json({
            user:user.data,
            accessToken
        });
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            message: 'Unauthorised',
        });
    }

})


    // logout token route.
    router.get('/logout',
    async function (req, res) {
        try {
            const cookies = req.cookies;
            if(!cookies?.refreshToken){
                
                return res.status(401).json({
                    message: 'Unauthorised',
                });
            }
            const rToken = cookies.refreshToken;
            let id = await verifyRefreshToken(rToken)
            res.clearCookie('refreshToken', { httpOnly: true, sameSite:'None', secure: true });
            return res.status(200).json({
                message:'Logged out successfully',
            });
        } catch (error) {
            console.log(error)
            return res.status(401).json({
                message: 'Unauthorised',
            });
        }
    
    })


    // change password route.
router.post('/change-password',
verifyAccessToken,
//custom validation for password
body('oldPassword').custom(async (value) => passwordValidation(value)),
body('oldPassword').custom(async (value, { req }) => {
    let user = await getWithPassword({
        id: req.payload.id,
        verified: 1,
    })
    if (!bcrypt.compareSync(value, user.data.password)) {
        return Promise.reject('Invalid Old Password');
    }
}),
body('password').custom(async (value) => passwordValidation(value)),
    // password must be at least 5 chars long
body('cpassword').custom((value, { req }) => cpasswordValidation(value, { req })),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {
        let { password } = req.body;
        let userDet = await update({id: req.payload.id},{ password: bcrypt.hashSync(password, 10) })
        return res.status(userDet.status).json({
            message: userDet.message,
        });
    }

})


// user detail route.
router.get('/view-profile',
verifyAccessToken,
async function (req, res) {
    let userDet = await get({id: req.payload.id})
    return res.status(userDet.status).json({
        message: userDet.message,
        data: userDet.data,
    });

})

    // change user detail route.
    router.post('/update-profile',
    verifyAccessToken,
    //custom validation for password
    body('name').custom(async (value) => nameValidation(value)),
    //custom validation for phone
    body('phone').custom(async (value) => phoneValidation((value).toString())),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { name, phone } = req.body;
            let userDet = await update({id: req.payload.id},{ name, phone })
            return res.status(userDet.status).json({
                message: userDet.message,
            });
        }
    
    })



module.exports = router;