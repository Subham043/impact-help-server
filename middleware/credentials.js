const whitelist = ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://impact-server-api.herokuapp.com', 'https://impact-help-frontend.vercel.app/']

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
//     if (whitelist.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Expose-Headers', 'Content-Length');
        res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
//     }
    next();
}

module.exports = credentials
