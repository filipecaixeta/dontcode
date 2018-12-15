import * as express from 'express'
import * as http from 'http'

var redis = require("redis");
var redisclient = redis.createClient({host: 'pubsub', port: 6379, detect_buffers: true});


const app = express()
const server = http.createServer(app)
const wss = require('socket.io')(server)
wss.set('origins', '*:*')
const redisAdapter = require('socket.io-redis')
wss.adapter(redisAdapter({ host: 'pubsub', port: 6379 }))

wss.on('connection', (ws: any) => {

    ws.on('room', (room: string) => {
        ws.join(room)
        redisclient.get(room, function(err: any, text: string) {
            if (text === null) {
                text = ""
            }
            wss.emit('get', text)
        })
        wss.emit('room', 'joined')
    });
    ws.on('updateText', (data: any) => {
        let rooms = Object.keys(wss.sockets.adapter.sids[ws.id])
        let room = rooms[rooms.length-1]
        redisclient.set(room, data.text, 'EX', 60*60*24*30)
        wss.to(room).emit('updateText', data)
    });
})

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT} :)`);
})