const { get } = require('../services/users/get')
const verifyAdmin = async(req, res, next) => {
    // console.log(req.payload.id);
    let userDet = await get({
        id: req.payload.id,
        verified: 1,
        userType: 1
    })
    if(userDet.error==false && userDet.data!=null) {
        next();
    }else{
        return res.status(403).json({
            message: 'Unauthorised',
        });
    }
}

module.exports = verifyAdmin