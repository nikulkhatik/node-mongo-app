const path = require("path")
const nodemailer = require("nodemailer")
const hbs = require("nodemailer-express-handlebars")

// async..await is not allowed in global scope, must use a wrapper
const send = async (address, subject, templates) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    })

    transporter.use(
      "compile",
      hbs({
        extName: ".hbs",
        viewPath: path.join(__dirname,'../views/emails'),
        viewEngine: {
          extName: ".hbs",
          defaultLayout: 'layout.hbs',
          layoutsDir: path.join(__dirname,'../views/emails'),
        }
      })
    )

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" ${process.env.MAIL_FROM}`,
      to: address.toString(),
      subject: subject,
      template: templates,
      context: {
        name: "Name",
      },
    })

    console.log("Message sent: %s", info.messageId)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
};

module.exports = send
