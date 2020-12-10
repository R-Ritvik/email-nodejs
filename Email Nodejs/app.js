const mysql = require('mysql')
const express = require('express');
const nodemailer = require("nodemailer");
const fs = require('fs');
const app = express();
const port = 3000;

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'emailapp'
})

app.use(express.urlencoded({
	extended: true
}))

app.get('/', (req, res) => {
    fs.readFile(__dirname + '/views/index.html', 'utf8', (err, text) => {
        res.send(text);
    });
})

app.post('/send', (req, res) => {
	var from = req.body.from;
	var to = req.body.to;
	var subject = req.body.subject;
	var text = req.body.text;
	
	console.log("Request to send mail...")
	console.log("From:" + from);
	console.log("To:" + to);
	console.log("Subject:" + subject);
	console.log("Text:" + text);
	
	send(from, to, subject, text);
	
	let stmt = `INSERT INTO emails(\`from\`,\`to\`,\`subject\`,\`message\`) VALUES(?,?,?,?);`;
	let values = [from,to, subject, text];
	
	/* Inserting into database */
	
	connection.query(stmt, values, function (err, rows, fields) {
	  if (err) {
	      console.log('Unable to connect to database' + err);
	  }

	  //console.log('Successfully inserted in database. Row ID:' + rows.insertId);
	});
	
	
	res.sendStatus(200);
});

async function send(from, to, subject, text) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
  });

  console.log("Message sent: %s", info.messageId);

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//to start the server
