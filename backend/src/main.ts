import * as express from 'express'
import * as http from 'http'
import * as Redis from 'ioredis'

const DEBUGMODE: boolean = true

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
const ROOM_POSITIONS: {[id: string]: number} = {'self_con': 0, 'root': 1, 'page': 2}

function getRoom(ws: any, name: string) {
    let rooms = Object.keys(wss.sockets.adapter.sids[ws.id])
    return rooms[ROOM_POSITIONS[name]]
}

function emitFilesList(ws: any, root_room: string|null = null) {
    if (!root_room) {
        root_room = getRoom(ws, 'root')
    }
    redisclient.smembers('//'+root_room).then((files: any) => {
        wss.to(root_room).emit('filesList', files)
    })
}

wss.on('connection', (ws: any) => {

    ws.on('room', (room: string) => {
        if (room===null) {
            if (DEBUGMODE) {
                console.log(ws.id, "ROOM IS NULL")
            }
            return
        }
        let root_room = '//'+room.split('/')[0]
        if (!root_room) {
            if (DEBUGMODE) {
                console.log(ws.id, "ROOT ROOM IS NULL")
            }
            return
        }
        // Join rooms
        ws.join(root_room) // ROOM_POSITIONS = root
        if (DEBUGMODE) {
            console.log(ws.id, "JOIN ROOM:", root_room)
        }
        ws.join(room)      // ROOM_POSITIONS = page
        if (DEBUGMODE) {
            console.log(ws.id, "JOIN ROOM:", room)
        }
        // Update filesList and emit the event
        redisclient.pipeline()
            .sadd(root_room, room)
            .smembers(root_room)
            .exec().then((results: any) => {
                let files = results[1][1]
                if (DEBUGMODE) {
                    console.log(ws.id, "EMIT filesList:", files)
                }
                wss.to(root_room).emit('filesList', files)
        })
        // Broadcast the text to the clients in the room
        redisclient.get(room).then((text: string|null) => {
            if (text === null) {
                if (DEBUGMODE) {
                    console.log(ws.id, "TEXT IS NULL")
                }
                text = ""
            }
            if (DEBUGMODE) {
                console.log(ws.id, "EMIT:", text)
            }
            ws.emit('get', text)
        }).catch((err: Error) => {
            console.error(err.message)
        })
        ws.emit('room', 'joined')
    })
    ws.on('updateText', (data: any) => {
        let room = getRoom(ws, 'page')
        redisclient.set(room, data.text, 'EX', 60*60*24*30)
        if (DEBUGMODE) {
            console.log(ws.id, "UPDATE:", data)
        }
        wss.to(room).emit('updateText', data)
    })
    ws.on('disconnecting', () => {
        let room = getRoom(ws, 'page')
        let root_room = getRoom(ws, 'root')
        if (DEBUGMODE) {
            console.log(ws.id, "DISCONNECTING:", room, root_room)
        }
        let clientNumber = 1
        if (wss.sockets.adapter.rooms[room]) {
            clientNumber = wss.sockets.adapter.rooms[room].length
            if (DEBUGMODE) {
                console.log(ws.id, "DISCONNECTING CLIENTS:", clientNumber)
            }
        }
        // Remove room from filesList if there is no other client and no text
        if (clientNumber <= 1) {
            redisclient.get(room).then((text: string|null) => {
                if (!text) {
                    redisclient .pipeline()
                        .srem(root_room, room)
                        .smembers(root_room)
                        .exec().then((results: any) => {
                            let files = results[1][1]
                            console.log(ws.id, "DISCONNECTING FILES LIST:", files)
                            wss.to(root_room).emit('filesList', files)
                        })
                }
            })
        }
    })
    
})

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT} :)`);
})