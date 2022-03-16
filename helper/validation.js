//string is Empty
function isEmpty(str) {
    return (!str || str.length === 0);
}

module.exports={
    nameValidation: (value)=>{
        if (isEmpty(value)) {
            return Promise.reject('Please enter a valid name');
        }
        if (!value.match(/^[a-zA-Z\s]*$/)) {
            return Promise.reject('Please enter a valid name');
        }
    },

    phoneValidation: (value)=>{
        if (isEmpty(value)) {
            return Promise.reject('Please enter a valid phone number');
        }
        if (!value.match(/^[0-9\s]*$/)) {
            return Promise.reject('Please enter a valid phone number');
        }
        if (value.length < 10 || value.length > 10) {
            return Promise.reject('Please enter a valid phone number');
        }
    },

    emailValidation: (value)=>{
        if (isEmpty(value)) {
            return Promise.reject('Please enter a valid email');
        }
        if (!value.match(/^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]\@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$/)) {
            return Promise.reject('Please enter a valid email');
        }
    },

    passwordValidation: (value)=>{
        if (isEmpty(value)) {
            return Promise.reject('Please enter a valid password');
        }
        if (!value.match(/^[a-z 0-9~%.:_\@\-\/\&+=,]+$/i)) {
            return Promise.reject('Please enter a valid password');
        }
    },

    cpasswordValidation: (value, {req})=>{
        if (isEmpty(value)) {
            return Promise.reject('Please enter a valid confirm password');
        }
        if (value !== req.body.password) {
            return Promise.reject('Password confirmation does not match password');
        }
        return true;
    },

    otpValidation: (value)=>{
        if (isEmpty(value)) {
            return Promise.reject('Please enter a valid otp');
        }
        if (!value.match(/^[0-9\s]*$/)) {
            return Promise.reject('Please enter a valid otp');
        }
        if (value.length < 6 || value.length > 6) {
            return Promise.reject('Please enter a valid otp');
        }
    },

    textValidation: (value, field)=>{
        if (isEmpty(value)) {
            return Promise.reject(`Please enter a valid ${field}`);
        }
        if (!value.match(/^[a-z 0-9~%.:_\@\-\/\(\)\\\#\;\[\]\{\}\$\!\&+=,]+$/i)) {
            return Promise.reject(`Please enter a valid ${field}`);
        }
    },

    emptyTextValidation: (value, field)=>{
        if (!isEmpty(value)) {
        if (!value.match(/^[a-z 0-9~%.:_\@\-\/\(\)\\\#\;\[\]\{\}\$\!\&\<\>+=,]+$/i)) {
            return Promise.reject(`Please enter a valid ${field}`);
        }
    }
    },

    IDValidation: (value, field)=>{
        if (isEmpty(value)) {
            return Promise.reject(`Please enter a valid ${field}`);
        }
        if (!value.match(/^[0-9\s]*$/)) {
            return Promise.reject(`Please enter a valid ${field}`);
        }
    },
}