// require express
var express = require('express')
var app = express();


// require body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// create view.
app.use(express.static('public'));
// app.set('view engine', 'ejs');
// app.get('/', function (req, res) {
//     res.render('index');
// });

var counter = 1;
var cron = require('node-cron');

// var reviewSchedular = cron.schedule('47 12 * * *', () => {
//     console.log('Runing a review job ');
// });
//
// reviewSchedular.start();

var schedulerService = require('./services/scheduler.service.server');
var eventGenerartorService = require('./services/event-creator.service.server');

var reviewSchedular = cron.schedule('*/2 * * * *', () => {
    console.log('Runing a review job ', counter);
    schedulerService.fetchAllData().then((data) => {
        if (data != undefined && data.length > 0)
            eventGenerartorService.generateEvent(data);
        //console.log(data);
    });
    counter++;
    if (counter > 2) {
        //criticalSchedular.stop();
        reviewSchedular.stop();
    }
});


// var criticalSchedular = cron.schedule('*/20 * * * * *', () => {
//     console.log('Runing a critical job ', counter);
//
// });

if (counter < 1) {
    //criticalSchedular.start();
    reviewSchedular.start();
}

// require mongoose

// for local connection string
var connectionString = 'mongodb://127.0.0.1:27017/topic';

// check if running remotely
if (process.env.MONGODB_URI) {
    connectionString = process.env.MONGODB_URI;
}

// create connection to mongodb
var mongoose = require('mongoose');
var global = mongoose.connect(connectionString, {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connected with mongoose');
});

// configure the rest access.
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin",
        req.headers.origin);
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});


var topicService = require('./services/topic.service.server');
topicService(app);


app.listen(process.env.PORT || 5500, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});