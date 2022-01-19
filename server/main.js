
const express		= require("express");		// web framework
const path			= require("path");			// resources path handler
const cors			= require("cors")			// allow cross origin access

const urlModule		= require("url");			// url sections handler
const statusCodes	= require("../json/statusCodes.json");	// status codes collection
const publicPath	= path.resolve(__dirname, "../public");	// public/static folder path

const multer  		= require('multer');		// used to upload files and process any multipart POST request like multipart/form-data
const formData 		= multer();					//{ dest: 'uploads/' }); // https://www.npmjs.com/package/multer

const app			= express();				// middlewares handler
const port			= process.env.PORT || 3000;	// listening port

app.use(express.static(publicPath));			// Sends static files from the publicPath directory
app.use(cors());								// allowing cross origins access
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// used for POST request like application/x-www-form-urlencoded

// database MongoDB
const mongoDB		= require('mongodb');
const MongoClient	= mongoDB.MongoClient;
const ObjectID		= mongoDB.ObjectID;
const uri			= 'mongodb+srv://fa1033:Ulakulik.3977@shopnow.kzvkn.mongodb.net/main?retryWrites=true&w=majority';
const client		= new MongoClient(uri);
var db;

// Connect to MongoDB
client.connect((err, client) => db = client.db('main'));



/**
 * Checking whether astring is a json or not
 * @param	{any} data
 * @returns {boolean} true or false
 */
function isJSON(data){
    try  { JSON.parse(data); }
    catch(e) { return false; }  
    return true;
}


// requestes monitor
app.use(function(request,response,next) {
    console.log("Request IP: "		+ request.ip );
	console.log("Request URL: "		+ request.url);
    console.log("Request date: "	+ new Date() );
    next(); // computing the next middleware here below
});



// Set param for the MongoDB collection names
app.param("mongoCollection", (req, res, next, collectionName) => {
	req["collection"] = db.collection(collectionName);
	return next();
})







app.get('/mongoDB/:mongoCollection/:mongoOperation?', async (req, res, next) => {
	const request	= isJSON(req.query.ajax)? JSON.parse(req.query.ajax): req.query.ajax;
	const method	= req.params.mongoOperation;

	switch(method){
		case "aggregate": case "countDocuments": case "distinct": case "findOne":
			req.collection[method](request, (err,result) => {res.send(JSON.stringify(result)); console.log(result)});
			break;
		case "find": req.collection[method](request).toArray((e, results) => {res.send(JSON.stringify(results)); console.log(results)});
		case "bulkWrite":
			const result = await req.collection[method](request);
			res.send(JSON.stringify(result));
			console.log(result);
			break;
		default: res.status(statusCodes.clientError.badRequest).end(); 
	}
	
	/* req.collection[method](request).toArray((e, results) => {
		if (e) return next(e);
		res.send(results);
		console.log(results);
	}); */
});

app.post('/mongoDB/:mongoCollection/:mongoOperation?', formData.none(), async (req, res, next) => {
	const request	= isJSON(req.body.ajax)? JSON.parse(req.body.ajax): req.body.ajax;
	const method	= req.params.mongoOperation;

	switch(method){
		case "insertOne": case "insertMany": case "bulkWrite":
			try {
				const result = await req.collection[method](request);
				res.send(JSON.stringify(result));
				console.log(result);
			} catch (e) { res.status(statusCodes.clientError.badRequest).end(); }
			break;
		default: res.status(statusCodes.clientError.badRequest).end();
	}
});

// testing delete request
app.delete("/mongoDB/:mongoCollection/:mongoOperation/:ajax", async function(req, res, next) {
	const request	= isJSON(req.params.ajax)? JSON.parse(req.params.ajax).ajax: req.params.ajax.ajax;
	const method	= req.params.mongoOperation;

	switch(method){
		case "deleteOne": case "deleteMany": case "remove": case "findOneAndDelete": case "bulkWrite":
			const result = await req.collection[method](request);
			res.send(JSON.stringify(result));
			console.log(result);
			break;
		default: res.status(statusCodes.clientError.badRequest).end(); 
	}
});

// testing put request (replace)
app.put("/mongoDB/:mongoCollection/:mongoOperation/ajax", async function(req, res, next) {
	const request	= isJSON(req.body.ajax)? JSON.parse(req.body.ajax): req.body.ajax;
	const method	= req.params.mongoOperation;
	let result;

	switch(method){
		case "replaceOne": case "findOneAndReplace":
			if		(Array.isArray(request) && request.length === 2) result = await req.collection[method](request[0], request[1]);
			else if	(Array.isArray(request) && request.length	> 2) result = await req.collection[method](request[0], request[1], request[2]);
			else res.status(statusCodes.clientError.badRequest).end();
			break;
		case "bulkWrite":	result = await req.collection[method](request);
			break;
		default:			res.status(statusCodes.clientError.badRequest).end();
	}
	res.send(JSON.stringify(result));
	console.log(result);
});

// testing patch request (update)
app.patch("/mongoDB/:mongoCollection/:mongoOperation/ajax", async function(req, res, next) {
	const request	= isJSON(req.body.ajax)? JSON.parse(req.body.ajax): req.body.ajax;
	const method	= req.params.mongoOperation;
	let result;

	//bulkWrite() to be fixed!
	switch(method){
		case "updateOne": case "updateMany": case "findOneAndUpdate": case "bulkWrite":
			if		(Array.isArray(request) && request.length === 2) result = await req.collection[method](request[0], request[1]);
			else if	(Array.isArray(request) && request.length	> 2) result = await req.collection[method](request[0], request[1], request[2]);
			else res.status(statusCodes.clientError.badRequest).end();
			break;
		case "bulkWrite":	result = await req.collection[method](request);
			break;
		default:			res.status(statusCodes.clientError.badRequest).end();
	}
	res.send(JSON.stringify(result));
	console.log(result);
});











// lessons page
app.get("/lessons", function(request, response) {
	switch(request.query.ajax){
		case "list":	response.sendFile(path.join(__dirname+'/../json/lessons.json'));
			break;
		case "amount":	response.send(require("../json/lessons.json").lessons.length.toString());
			break;
		default:		response.status(statusCodes.clientError.badRequest).end();
	}
});
    
// User page
app.get("/user"	 , function(request, response) {
    // response.render
    if (request.query.ajax === "user"	)	response.sendFile(path.join(__dirname+'/../json/user.json'));
    else                                    response.status(statusCodes.clientError.badRequest).end();
});

function reqToObj(req){
	return {
		headers: req.headers,
		method: req.method,
		url: req.url,
		httpVersion: req.httpVersion,
		body: req.body,
		cookies: req.cookies,
		path: req.path,
		protocol: req.protocol,
		query: req.query,
		hostname: req.hostname,
		ip: req.ip,
		originalUrl: req.originalUrl,
		params: req.params,
  };	
}

// testing post requestes (x-www-form-urlencoded, multipart/form-data and GrapQL)
/* app.post("/test", formData.none(), function(request, response) {
	response.send(request.body);
	console.log(reqToObj(request));
});

// testing put requests
app.put("/test/ajax", function(request, response) {
	response.send(request.body);
	console.log(reqToObj(request));
});

// testing patch requests
app.patch("/test/ajax", function(request, response) {
	response.send(request.body);
	console.log(reqToObj(request));
});

// testing delete request
app.delete("/test/:ajax", function(request, response) {
	response.send(request.params.ajax);
	console.log(reqToObj(request));
}); */

// page 404
app.use(function(request, response) {
    response.status(statusCodes.clientError.notFound);
    response.sendFile(path.join(__dirname+'/../client/404.html'));
});


// Starts the app on port 3000 and display a message when it’s started
app.listen(port, console.log("App started on port 3000"));
