const nodeMailer = require("nodemailer");

const sendEmailg = async (options) => {
    // const transporter = nodeMailer.createTransport({
    //     host: process.env.SMPT_HOST,
    //     port: process.env.SMPT_PORT,
    //     service: process.env.SMPT_SERVICE,
    //     auth: {
    //         user: process.env.SMPT_MAIL,
    //         pass: process.env.SMPT_PASSWORD,
    //     },
    // });

    const transporter = nodeMailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    });

    const mailOptions = {
        from: 'g94516356@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmailg;


// const sgMail = require('@sendgrid/mail');

// const sendEmail = async (options) => {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//     const mailOptions = {
//         to: options.email,
//         from: process.env.SENDGRID_FROM_EMAIL,
//         subject: options.subject,
//         text: options.message,
//     };

//     await sgMail.send(mailOptions);
// };

// module.exports = sendEmail;
