
const express		= require("express");		// web framework
const path			= require("path");			// resources path handler
const cors			= require("cors")			// allow cross origin access

const urlModule		= require("url");			// url sections handler
const statusCodes	= require("../json/statusCodes.json");	// status codes collection
const publicPath	= path.resolve(__dirname, "../public");	// public/static folder path

const multer  		= require('multer');		// used to upload files and process any multipart POST request like multipart/form-data
const formData 		= multer();					//{ dest: 'uploads/' }); // https://www.npmjs.com/package/multer

const app			= express();				// middlewares handler
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));			// Sends static files from the publicPath directory
app.use(cors());								// allowing cross origins access
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// used for POST request like application/x-www-form-urlencoded


// requestes monitor
app.use(function(request,response,next) {
    console.log("Request IP: "		+ request.ip );
	console.log("Request URL: "		+ request.url);
    console.log("Request date: "	+ new Date() );
    next(); // computing the next middleware here below
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
app.post("/test", formData.none(), function(request, response) {
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
});

// page 404
app.use(function(request, response) {
    response.status(statusCodes.clientError.notFound);
    response.sendFile(path.join(__dirname+'/../client/404.html'));
});


// Starts the app on port 3000 and display a message when it’s started
app.listen(port, console.log("App started on port 3000"));
