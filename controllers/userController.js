exports.getAllUsers = (request, response) => {
    console.log('this doesnt get run for some reason');
    
    //500 error code means it is an 'internal server error
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
};

exports.getUser = (request, response) => {
    //500 error code means it is an 'internal server error
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
};

exports.createUser = (request, response) => {
    //500 error code means it is an 'internal server error
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
};

exports.updateUser = (request, response) => {
    //500 error code means it is an 'internal server error
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
};

exports.deleteUser = (request, response) => {
    //500 error code means it is an 'internal server error
    response.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
};