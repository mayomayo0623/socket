const SocketIO = require("socket.io");
const winston = require('./config/winston');

module.exports = (server) => {
    const io = SocketIO(server, { path: "/socket.io" });

    io.on("connection", (socket) => {
        const req = socket.request;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        //console.log('New Client : ${ip}, socket.id : ${socket.id}');
        winston.info(`New Client : ${ip}, socket.id : ${socket.id}`);

        socket.on("disconnect", () => {
            //console.log('Client Out : ${ip}, socket.id : ${socket.id}');
            winston.info(`Client Out : ${ip}, socket.id : ${socket.id}`);
            clearInterval(socket.interval);
        });

        socket.on("error", (error) => {});

        socket.on("from client", (data) => {
            //console.log(data);
            winston.info(data);
        });

        socket.interval = setInterval(() => {
            socket.emit("from server", "Message From Server");
        }, 3000);
    });
};