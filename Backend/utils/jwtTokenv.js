// Create Token and saving in cookie

const sendTokenv = (vendor, statusCode, res) => {
    const token1 = vendor.getJWTToken();

    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.status(statusCode).cookie("token1", token1, options).json({
        success: true,
        token1,
        vendor,
    });
};

module.exports = sendTokenv;