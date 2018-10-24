let fs = require("fs"), obj;
const Sequelize = require('sequelize');
const sequelize  = new Sequelize('d40a119bn47te2', 'pfrtaayoliuraa', '999045f60ccfb8693b1478a9e22655317f8fa2975c7ada81450763ca0a64b03f', {
    host: 'ec2-54-163-235-56.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});
sequelize.authenticate().then(() => 
    {
    console.log("Connected to database")
    }).catch(()=>
    {console.log("FAiled to connect to database");}
    );
    // Creating Data Models
const Employees = sequelize.define('Employee',{   
    employeeNum:{  
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    matritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
    }, 
    {
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
    }
);
const Departments = sequelize.define('Department',{
    departmentId:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
    }, {
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt    
    }
);
function search(entity,matchObj){
	return new Promise((resolve,reject)=>{
		sequelize.sync()
			.then( (data)=>{
				entity.findAll(
					(matchObj!=undefined) ? {where:matchObj} : {} 
				)
					.then( (data)=>
						{ 
							console.log("Log: output type " + typeof data + " with length of " + data.length); 
							if(data.length){
								resolve(data);
							}
							reject(new Error("No results found"));
						} 
					)
					.catch( (err)=>
						{ 
							console.log("Err: findAll() problem: "+err); 
							reject(new Error("No results found"));
						} 
					);
			})
			.catch( (err)=>{reject("Err: unable to sync the database");} )
		;
	});
}
function formatEnforce(dataObj){
	/* convert blanks to the value NULL */
	for (i in dataObj) 
		if(dataObj[i] == "" ) { dataObj[i] = null; }

	/* convert 1 0 to true false as needed */
	if( dataObj.isManager ) dataObj.isManager = (dataObj.isManager)?true:false;
}
function delete_from ( entity , whereObj ){

	return new Promise(
		(resolve,reject) => {
			sequelize.sync()
				.then( (data)=>{
					entity.destroy( { where : whereObj } )
						.then( (data) => { resolve("Delete Success"); } )
						.catch( (err) => { reject("Error: .destroy() reports following - " + err.message); } )
					;
				}
				)
				.catch( (err)=>{reject("Err: unable to sync the database");} )
			;
		})
	;
}
function insert_into ( entity, valueObj ){
	return new Promise(
		(resolve,reject)=>{

			/* error checking */
			//			if( typeof(valueObj) != object )  reject("wierd input type: " + typeof(valueObj) );

			/* enforce formatting */
			formatEnforce(valueObj);

			/* insert into */
			sequelize.sync()
				.then( (data)=>{
					entity.create(valueObj)
						.then( (data)=>{ resolve(data); } )
						.catch( (err)=>{ reject("Error: .create() reports the following: " + err.message); })
					;
				}
				)
				.catch( (err)=>{reject("Err: unable to sync the database");} )
			;
		})
	;
}
function update ( entity, valueObj, whereObj ){

	if (arguments.length != 3) reject("Error: incorrect number of arguments");

	formatEnforce(valueObj);
	formatEnforce(whereObj);

	return new Promise(
		(resolve,reject)=>{
			sequelize.sync()
				.then( (data)=>{
					entity.update(
						valueObj
						, { where: whereObj }
					)
						.then( (data)=>{ resolve(data); })
						.catch( (err)=>{ reject("Error: .update() reports the following - " + err.message); } )
					;
				}
				)
				.catch( (err)=>{reject("Err: unable to sync the database");} )
			;
		})
	;
}
module.exports.initialize = () => {    
    return new Promise((resolve, reject) => {
        sequelize.sync().then((Employees) => {
            resolve();
        }).then((Departments) => {
            resolve();
        }).catch((err) => {
        reject("unable to sync the database");
        })
    });    
}    
module.exports.getAllEmployees = () => {   
    return search(Employees);
}
module.exports.getEmployeesByStatus = (status) => {
        return search(Employees, {"status" : status});
}
module.exports.getEmployeesByDepartment = (department) => {
    return search(Employees, {"department" : department});
}
module.exports.getEmployeesByManager = (manager) => {
    return search(Employees, {"employeeManagerNum": manager});
}
module.exports.getEmployeeByNum = (num) => {
    return search(Employees, {"employeeNum" : num});
}
module.exports.getManagers = () => {
        return search(Employees, {"isManager" : true});
}    
module.exports.getAllDepartments = () => {
        return search(Departments);
}
module.exports.addEmployee = (employeeData) => {
    console.log("data type: " + typeof(employeeData));
	return insert_into( Employees, employeeData );
}
module.exports.updateEmployee = (employeeData) => {
    return update ( Employees , employeeData , { employeeNum : employeeData.employeeNum } );
}
module.exports.addDepartment = (departmentData) => {
    console.log("data type: " + typeof(departmentData));
	return insert_into( Department, departmentData );
}
module.exports.updateDepartment = (departmentData) => {
        return update ( Departments , departmentData , { departmentId : departmentData.departmentId } );
}
module.exports.getDepartmentById = (id) => {
    return search(Departments, {"departmentId" : id});
}
module.exports.deleteDepartmentById = function(depId){
	return delete_from ( Departments, { departmentId : depId } );
}
module.exports.deleteEmployeeByNum = function(empNum){
	return delete_from ( Employees , { employeeNum : empNum } );
}