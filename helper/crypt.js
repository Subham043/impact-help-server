//encryption
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPTRSECURITYKEY);

module.exports = {
    encrypt: (value) =>{
        return cryptr.encrypt((value).toString());
    },

    decrypt: (value) =>{
        return new Promise((resolve, reject)=>{
            try {
                resolve(cryptr.decrypt((value).toString()))
            } catch (error) {
                console.log(error)
                reject('Invalid value')
            }
        })
    },
}