import * as express from 'express'
import * as http from 'http'
import * as Redis from 'ioredis'
// var Redis = require('ioredis')

const DEBUGMODE: boolean = false

const redisConfig = {
    host: 'pubsub',
    port: 6379,
    detect_buffers: true,
    retryStrategy: function (times: number) {
        var delay = Math.min(times * 20, 1000)
        return delay
    },
    reconnectOnError: function (err: Error) {
        console.error(err.message)
        return true
    }
}
const redisclient = new Redis(redisConfig)

const app = express()
const server = http.createServer(app)
const wss = require('socket.io')(server)
const redisAdapter = require('socket.io-redis')
wss.set('origins', '*:*')
wss.adapter(redisAdapter({  pubClient: new Redis(redisConfig),
                            subClient: new Redis(redisConfig) }))

wss.on('connection', (ws: any) => {

    ws.on('room', (room: string) => {
        ws.join(room)
        redisclient.get(room).then((text: string|null) => {
            if (text === null) {
                text = ""
            }
            if (DEBUGMODE) {
                console.log("EMIT:", text)
            }
            ws.emit('get', text)
        }).catch((err: Error) => {
            console.error(err.message)
        })
        ws.emit('room', 'joined')
    })
    ws.on('updateText', (data: any) => {
        let rooms = Object.keys(wss.sockets.adapter.sids[ws.id])
        let room = rooms[rooms.length-1]
        redisclient.set(room, data.text, 'EX', 60*60*24*30)
        if (DEBUGMODE) {
            console.log("UPDATE:", data)
        }
        wss.to(room).emit('updateText', data)
    })
})

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT} :)`);
})