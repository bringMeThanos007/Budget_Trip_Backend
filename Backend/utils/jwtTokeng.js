// Create Token and saving in cookie

const sendTokeng = (guide, statusCode, res) => {
    const token2 = guide.getJWTToken();

    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.status(statusCode).cookie("token2", token2, options).json({
        success: true,
        guide,
        token2,
    });
};

module.exports = sendTokeng;