const JWT  = require('jsonwebtoken');
module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userId,
            }
            const secret = process.env.JWTRSECURITYKEYACCESS;
            const options = {
                expiresIn: "15m",
                // expiresIn: "30s",
                issuer: "impact-school.com",
                // audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if(err){
                    reject(err);
                }
                resolve(token);
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization']){
            return res.status(403).json({
                message: 'Unauthorised',
            });
        }
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
        JWT.verify(token,process.env.JWTRSECURITYKEYACCESS,(err,payload) => {
            if(err) {
                return res.status(403).json({
                    error: 'Unauthorised',
                });
            }
            req.payload = payload;
            next();
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userId,
            }
            const secret = process.env.JWTRSECURITYKEYREFRESH;
            const options = {
                expiresIn: "24h",
                issuer: "impact-school.com",
                // audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if(err){
                    reject(err);
                }
                resolve(token);
            })
        })
    },
    verifyRefreshToken: (refreshtoken) => {
        return new Promise((resolve, reject) => {
            if(!refreshtoken){
                reject('Unauthorised')
            }
            const token = refreshtoken;
            JWT.verify(token,process.env.JWTRSECURITYKEYREFRESH,(err,payload) => {
                if(err) {
                    reject('Unauthorised')
                }
                resolve(payload.id);
            })
        })
    },
}