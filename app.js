const morgan = require('morgan');
const winston = require('./config/winston');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const express = require('express');
const app = express();

const webSocket = require('./socket.js');

app.set('port', process.env.PORT || 8080);

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

const sessOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    },
};

if (process.env.NODE_ENV == 'production') {
    console.log('production');
    app.enable('trust proxy');
    sessOptions.proxy = true;
    sessOptions.cookie.secure = true;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('wsExample'));
app.use(session(sessOptions));
// app.use(session({
//     resave: false,
//     saveUninitialized: false,
//     secret: 'wsExample',
//     cookie: {
//         httpOnly: true,
//         secure: false
//     }
// }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 해당 주소가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production'? err : {};
    res.status(err.status || 500);
    res.send('error Occurred');
})

const port = app.get('port');
const server = app.listen(port, () => {
    //console.log(app.get('port'), '번 포트에서 서버 실행 중 ..')
    winston.info(`App is running on port ${port}`);
});

webSocket(server);