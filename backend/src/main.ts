import * as express from 'express'
import * as http from 'http'

var Redis = require('ioredis')

var redisConfig = {
    host: 'pubsub',
    port: 6379,
    detect_buffers: true,
    retryStrategy: function (times: number) {
        var delay = Math.min(times * 20, 1000)
        return delay
    },
    reconnectOnError: function (err: any) {
        console.error(err.message)
        return true
    }
}
var redisclient = new Redis(redisConfig)

const app = express()
const server = http.createServer(app)
const wss = require('socket.io')(server)
wss.set('origins', '*:*')
const redisAdapter = require('socket.io-redis')
wss.adapter(redisAdapter({  pubClient: new Redis(redisConfig),
                            subClient: new Redis(redisConfig) }))

wss.on('connection', (ws: any) => {

    ws.on('room', (room: string) => {
        ws.join(room)
        redisclient.get(room).then((text: string) => {
            if (text === null) {
                text = ""
            }
            ws.emit('get', text)
        }).catch((err: any) => {
            console.error(err.message)
        })
        ws.emit('room', 'joined')
    })
    
    ws.on('updateText', (data: any) => {
        let rooms = Object.keys(wss.sockets.adapter.sids[ws.id])
        // console.log(rooms)
        let room = rooms[rooms.length-1]
        redisclient.set(room, data.text, 'EX', 60*60*24*30)
        wss.to(room).emit('updateText', data)
    })
})

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT} :)`);
})