/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Aria Moradpour Student ID: 113193163 Date:Augest 11, 2018
*
*  Online (Heroku) Link:  https://powerful-savannah-51546.herokuapp.com/
*
********************************************************************************/ 
// Importing Data_Service
const data_service = require('./data-service');
const dataServiceAuth = require("./data-service-auth");
// Installing Path
const path = require("path");
// Installing Express.js
const express = require('express');
// Installing Multer (used for image uploading)
const multer = require('multer');
// Instaling fs
const fs = require('fs');
// Generating an express()
const app = express();
// Installing body-parser
const bodyParser = require('body-parser');
// Installing express-handlebars
const exphbs = require('express-handlebars');
// installing client-sessions
const client_sessions = require("client-sessions");
// setting up the port
const HTTP_PORT = process.env.PORT || 8080;
app.use(
	client_sessions(
		{
			cookieName: "session",
			secret: "assign6_web322",
			duration: 2 * 60 * 1000,
			activeDuration: 1000 * 60
		}
	)
);
// Ensures that the user is logged in 
function ensureLogin(req, res, next)
{
    if(!req.session.user)
        res.redirect("/login");
    else
        next();
}
const storage = multer.diskStorage({

    destination: "./public/images/uploaded",

    filename: function (req, file, cb) {

        cb(null, Date.now() + path.extname(file.originalname));

    }});
//  upload constant
const upload = multer({ storage: storage });
function onhttpstart() {
    console.log("Express http server listening on " + HTTP_PORT);  }
app.engine('.hbs', exphbs({ extname: '.hbs',    
                    defaultLayout: 'main',
                    helpers :{
                        navLink : function(url, options){
                            return "<li" + 	((url	==	app.locals.activeRoute)	?	'	class="active"	'	:	'') + '><a href="' +	url	+ '">' + options.fn(this) +	'</a></li>';	
                        },
                        equal:function(lvalue,rvalue,options){
                            if(arguments.length < 3)
                                throw new Error("Handlebars Helper equal needs 2 parameters");
                            if(lvalue != rvalue){
                                return options.inverse(this);
                            }else{
                                return options.fn(this);
                            }
                        },
                        image : function (options)
                        {
                            
                            return "<img src = '/images/uploaded/" + options.fn(this).trim() +
                                     "' class = 'img-responsive	img-thumbnail'/> "  
                        }, 
                        employees : function(options)
                        {
                            let tr = "<tr>";
                            let emplNum  = options.fn(this.employeeNum).trim();
                            let FullName = options.fn(this.firstName).concat(' ', options.fn(this.lastName));
                            let email    = options.fn(this.email).trim();
                            let address  = options.fn(this.addressStreet).concat(' ', options.fn(this.addressCity), 
                                                    ' ', options.fn(this.addressState), ' ', options.fn(this.addressPostal)).trim();
                            let manager  = options.fn(this.employeeManagerNum).trim();
                            let status   = options.fn(this.status).trim();
                            let depart   = options.fn(this.department).trim();
                            let hiredOn  = options.fn(this.hireDate).trim();
                            tr += createPlainTd(emplNum) + creaateLinkedTd(FullName, "/employee/" + emplNum)
                                + createMailTd(email) + createPlainTd(address)
                                + creaateLinkedTd(manager, "/employees?manager=" + manager)
                                + creaateLinkedTd(status, "/employees?status=" + status)
                                + creaateLinkedTd(depart, "/employees?department=" + depart)
                                + createPlainTd(hiredOn);
                            tr += "</td>";
                            tr += ' <td><a class="btn btn-danger" href="employee/delete/' + emplNum + '">remove</a></td>'
                            return tr;
                        },
                        departments : function(options)
                        {
                            let tr = "<tr>"
                            let depName = options.fn(this.departmentName).trim();
                            let depNum = options.fn(this.departmentId);
                            tr += creaateLinkedTd(depNum, "/department/" + depNum)
                                + creaateLinkedTd(depName, "/department/" + depNum);
                            tr += "</tr>"
                            tr += "</td>";
                            tr += ' <td><a class="btn btn-danger" href="department/delete/' + depNum + '">remove</a></td>'
                            return tr;
                        }
                    }}));
let createPlainTd = function(value){
    return "<td>" + value + "</td>"}
let creaateLinkedTd = function(value, link){
    return "<td> <a href = '" + link +"'>" + value + "</a></td>";}
let createMailTd = function(value){
    return creaateLinkedTd(value, 'mailto:' + value); }





// Setting up The engle to handleBars
app.set('view engine', '.hbs')
// ======================
// seeting up the middlewares
// ======================
// setting up active routes in main.layout
app.use(function(req,res,next){					
    let	route	=	req.baseUrl	+	req.path;
    app.locals.activeRoute	=	(route	==	"/")	?	"/"	:	route.replace(/\/$/,	"");
    next();	});

// Sending public folder to Server to enable CSS and Images folder
app.use(express.static('./public/'));
// Setting  BodyParse 
app.use(bodyParser.urlencoded({ extended: true }));
// setting up the session middlewate
app.use((req, res, next) =>
            {
                res.locals.session = req.session
                next();
            });
// ======================
// ROUTES
// ======================
// route to listen on /
app.get("/", function(req,res) {
    res.render("home");});
// route to listen on /home (it wasn't in the instructions)
app.get("/home", function(req,res) {
    res.render("home")});
// route to listen on /about
app.get("/about", function(req,res) {

    res.render("about");});
// route to /employees - returns a JSON formatted string containing all of the employees within the employees.json file
app.get("/employees", ensureLogin,function(req,res) {

    if (req.query.status) {

        data_service.getEmployeesByStatus(req.query.status).then((data) => {
            if(data.length == 0)
                res.render("employees",{ message: "no results" });
            else
               res.render('employees', {employee : data });

        }).catch((err) => {

            res.render('employees', {message : err });

        });

    } else if (req.query.department) {

        data_service.getEmployeesByDepartment(req.query.department).then((data) => {

            if(data.length == 0)
                res.render("employees",{ message: "no results" });
            else             
                res.render('employees', {employee : data });

        }).catch((err) => {

            res.render('employees', {message : err });

        });

    } else if (req.query.manager) {

        data_service.getEmployeesByManager(req.query.manager).then((data) => {

            if(data.length == 0)
                res.render("employees",{ message: "no results" });             
            else             
                res.render('employees', {employee : data });

        }).catch((err) => {

            res.render('employees', {message : err });

        });

    } else {

        data_service.getAllEmployees().then((data) => {

            if(data.length == 0)                 
                res.render("employees",{ message: "no results" });             
            else             
                res.render('employees', {employee : data });

        }).catch((err) => {

            res.render('employees', {message : err });

        });

    }});
// route to /employee/value
app.get("/employee/:empid", ensureLogin,(req,res) => {
	let viewData = {};

	data_service.getEmployeeByNum(req.params.empid)
		.then((data)=>{
			viewData.data = data[0];
		})
		.catch((err)=>{
			viewData.data = null;
		})
		.then(data_service.getAllDepartments)
		.then((data)=>{
			viewData.departments = data;

			for(let i = 0 ; i < viewData.departments.length ; i++){
				console.log("comparing : " + viewData.departments[i].departmentId + " and " + viewData.data.department);
				if(viewData.departments[i].departmentId == viewData.data.department){
					console.log("if statement: " +viewData.departments[i].departmentId);
					viewData.departments[i].selected = true ;
				}
			}
		})
		.catch( ()=>{
			viewData.departments=[];
		})
		.then( ()=>{
			if(viewData.data == null) {
				res.status(404).send("Employee Not Found");
			}else{
				res.render("employee",{"viewData":viewData});
			}
		})
	;
}
);
// Get route the login oage 
app.get("/login", (req,res) => {
	res.render("login");
}
);
// Get route to the regestir page 
app.get("/register", (req,res) => {
	res.render("register");
}
);
// Get route to the logOut Pgae
app.get("/logout", (req,res) => {
	req.session.reset();
	res.redirect('/');
}
);
// Post route for the register -> gets the information about a user in thre request 
// Usses DataServiceAuth.registeruser(req.body) to create a new user
app.post("/register", (req,res) => {
	dataServiceAuth.registerUser(req.body)
		.then( (data)=>{ res.render("register",{successMessage:"User created"}) } )
		.catch( (err)=>{ res.render("register",{errorMessage: err, username:req.body.user} ) } )
	;
}
);
// Get route for the userHistory page. a user must be logged in and have a session to acces this page
app.get("/userHistory", ensureLogin,(req, res) => {
    let userInfo = dataServiceAuth.getUser(req.session.user.username).then((userInfo) => 
            res.render("userHistory", {user : userInfo}));
}
);
// Post route coming from the login oage, ensures the user exists, sets up a session for the user 
app.post("/login", (req,res) => {
	const username = req.body.username;
	const password = req.body.password;

    if(username === "" || password === "") 
        return res.sender("login", {errorMessage: "Missing credentials."} );

	dataServiceAuth.checkUser(req.body)
		.then( 
			(data)=>{ 
				console.log("-----");
				console.log("req.session: ", req.session);
				console.log("-----");
				req.session.user = { username: req.body.user }; 
				res.redirect("/employees"); 
			} 
		)
		.catch( (err)=>{
			console.log("Error: login failed: ", err);res.render("login",{errorMessage: err, username:req.body.user}); 
		});
});
// Get route for the relsquest to delete a department specified in :depId
app.get("/department/delete/:depId", ensureLogin,(req,res) => {
	data_service.deleteDepartmentById(req.params.depId)
		.then( (data)=>{
			res.redirect("/departments");
		})
		.catch( (err)=>{
			res.status(500).send("Error: Unable to remove department - " + err );
		})
	;
});
// route to /departments - returns a JSON formatted string containing all of the departments within the departments.json file
app.get("/departments", ensureLogin,function(req,res) {

    // This route will return a JSON formatted string containing all of the departments within the departments.json file

    data_service.getAllDepartments().then((data) => {
        if(data.length == 0)
            res.render('departments', {message : 'No Results'});
        else
            res.render('departments', {department : data });

    }).catch((error) => {
        res.render('departments', {message : 'No Results'});
    });});
// route to /employees/add
app.get("/employees/add", ensureLogin,function(req,res) {
    data_service.getAllDepartments()
		.then((data)=>{res.render("addEmployee",{departments:data});})
        .catch((err)=>{res.render("addEmployee",{departments:[]});});
});
// route to /image/add (fat arrow)
app.get("/images/add", ensureLogin,(req,res) => {
    res.render("addImage");});
// post route to upload images
app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    // redirect to "/images" defined below
    res.redirect("/images");});
// get route utilizing fs module
app.get("/images", ensureLogin, (req,res) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        res.render("images", { data : items});
    });});
// post rpoute to add an employee to data base
app.post("/employees/add", ensureLogin, (req,res) => {
    data_service.addEmployee(req.body).then(() => (
    res.redirect("/employees"))).catch((err) => console.log("failed to add employee"));
});
// Anything else will be considered 404 or page not found
app.post("/employee/update", ensureLogin, (req, res) => {
    data_service.updateEmployee(req.body).then( () =>
    {
        res.redirect("/employees");
    }).catch((err )=>
    {
        console.log(err);
        res.send(err);
    })})
// Post method to update a department the new department info is recived in the req.body
app.post("/department/update", ensureLogin, (req, res) => {
        data_service.updateDepartment(req.body).then( () =>
        {
            res.redirect("/department");
        }).catch((err )=>
        {
            console.log(err);
            res.send(err);
        })})

app.get("/department/add", ensureLogin, (req, res) =>
{
        res.render('addDepartment');
});
app.post("/department/add", ensureLogin,(req, res) =>
{
    data_service.addDepartment(req.body).then(() =>
    res.redirect("/departments")).catch((err) => console.log("Failed to add department due to =>" + err));
})
app.get("/department/:depid", ensureLogin,(req,res) => {
	data_service.getDepartmentById(req.params.depid)
		.then( (data)=>{res.render("department",{data:data[0]});})
		.catch( (err)=>{res.status(404).send("Department Not Found");} );
}
);
app.get("/employee/delete/:empNum", ensureLogin, (req,res) => {
	data_service.deleteEmployeeByNum(req.params.empNum)
		.then( (data)=>{
			res.redirect("/employees");
		})
		.catch( (err)=>{
			res.status(500).send("Unable to Remove Employee / Employee not found" + err);
		})
	;
}
);

// ================================
// Listening on the port 8080
// ================================
data_service.initialize()
    //.then(dataServiceComments.initialize)
	.then(dataServiceAuth.initialize)
	.then((msg)=>{console.log(msg);app.listen(HTTP_PORT,onhttpstart);})
	.catch((err)=>{console.log(err);})
;

// setting up the 404 age not found middleware
app.use((req,res) => {
    res.status(404).sendFile(path.join(__dirname + "/views/pageNotFound.html"));});

