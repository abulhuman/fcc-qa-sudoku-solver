const CustomError = require('../errors/custom-error.js');


const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        let { message, status, info } = err;
        if (message?.length > 0)
            status = 400;
        return res.status(status).json({
            error: message,
            ...info
        });
    }

    return res.status(500).json({
        error: 'Something went wrong, try again later'
    });
};

module.exports = errorHandler;