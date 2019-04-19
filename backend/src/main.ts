import * as express from 'express'
import * as http from 'http'
import * as Redis from 'ioredis'
const app = express()
const server = http.createServer(app)
const wss = require('socket.io')(server)
const redisAdapter = require('socket.io-redis')
const path = require('path')
const history = require('connect-history-api-fallback')
const compression = require('compression')
const helmet = require('helmet');

const staticFileMiddleware = express.static(path.join('/','app','html'))

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

wss.adapter(redisAdapter({  pubClient: new Redis(redisConfig),
                            subClient: new Redis(redisConfig) }))

app.use(helmet())
app.use(compression())
app.use(express.json())

async function api_middleware(req: any, res: any, next: any) {
    let room = getRoomName(req.originalUrl.split("?").shift())
    let root_room = getRootRoomName(room)

    if (req.method=='GET') {
        if (req.query.files!==undefined) {
            let files = await getFilesTree(root_room)
            res.format({
                'text/plain': function(){
                    res.send(files.join("\n"))
                },
                'application/json': function(){
                    res.send(files)
                },
                'default': function() {
                    res.send(files.join("\n"))
                }
            })
        }
        else if (req.query.text!==undefined){
            let roomData = await getRoomData(room)
            let text = roomData.text===undefined?"":roomData.text
            res.format({
                'text/plain': function(){
                    res.send(text)
                },
                'application/json': function(){
                    res.send(roomData)
                },
                'default': function() {
                    res.send(text)
                }
            })
        }
        else {
            next()
        }
    }
    else if (req.method=='POST') {
        let roomData: RoomData = {}
        if (req.body.text!==undefined)
            roomData.text = req.body.text
        if (req.body.mode!==undefined)
            roomData.mode = req.body.mode
        if (Object.keys(roomData).length==0) {
            res.status(400).json({ error: "wrong format" })
            return
        }
        redisclient.hmset(room, roomData).catch(err => console.error(err))
        broadcastRoomDataToClient(wss, room, roomData)
        res.send({'status': 'updated'})
        if (roomData.text)
            addToFileTree(wss, room)
        else
            removeFileFromTree(room)
    }
    else {
        next()
    }
}

app.use(api_middleware)

app.use(staticFileMiddleware)
app.use(history({disableDotRule: true}))
app.use(staticFileMiddleware)

// ROOM_POSITIONS is defined by the order of ws.join is called
// self_con is used to talk to 1 client
// root is used to handle changes on the file tree
// page is used to handle changes of a page
const ROOM_POSITIONS: {[id: string]: number} = {'self_con': 0, 'root': 1, 'page': 2}

// Convert hmset and hgetall from list to obect
function convertObjectToArray (obj: any) {
    var result = []
    var keys = Object.keys(obj)

    for (var i = 0, l = keys.length; i < l; i++) {
        if (keys[i][0]==='_')
            continue
        result.push(keys[i], obj[keys[i]])
    }
    return result
}
Redis.Command.setArgumentTransformer('hmset', function (args: any) {
    if (args.length === 2) {
        if ( typeof args[1] === 'object' && args[1] !== null) {
        return [args[0]].concat(convertObjectToArray(args[1]));
        }
    }
    return args
})
Redis.Command.setReplyTransformer('hgetall', function (result: any) {
    if (Array.isArray(result)) {
        var obj: any = {}
        for (var i = 0; i < result.length; i += 2) {
        obj[result[i]] = result[i + 1]
        }
        return obj
    }
    return result
})

function getRoom(wss: any, ws: any, name: string) {
    let rooms = Object.keys(wss.sockets.adapter.sids[ws.id])
    return rooms[ROOM_POSITIONS[name]]
}
function getRoomName(url: string) {
    // Make sure the room name doesn't start or end with slashes
    return url.toLowerCase().replace(/(^[\/\s]+)|([\/\s]+$)/g,'')
}
function getRootRoomName(room: string) {
    return '//'+room.split('/')[0]
}
async function getFilesTree(root_room: string) {
    let files = await redisclient.smembers(root_room)
    console.log("FILES",root_room, files)
    return files
}

// Update filesList and emit the event
function addToFileTree(wss: any, room: string) {
    let root_room = getRootRoomName(room)
    redisclient.pipeline()
        .sadd(root_room, room)
        .smembers(root_room)
        .exec().then((results: any) => {
            let files = results[1][1]
            if (DEBUGMODE) {
                console.log("EMIT filesList:", files)
            }
            wss.to(root_room).emit('filesList', files)
    })
}
function getRoomData(room: string) {
    return redisclient.hgetall(room)
}
function sendRoomDataToClient(ws: any, room: string) {
    getRoomData(room).then((roomData: RoomData) => {
        roomData = roomData===undefined?{}:roomData
        if (DEBUGMODE) {
            console.log(ws.id, "updateRoomData:", roomData)
        }
        roomData._id = "0"
        if (roomData.mode===undefined) {
            roomData.mode = "markdown"
        }
        if (roomData.text===undefined) {
            roomData.text = ""
        }
        ws.emit('updateRoomData', roomData)
    }).catch((err: Error) => {
        console.error(err.message)
    })
}
function broadcastRoomDataToClient(wss: any, room: string, roomData: RoomData) {
    if (DEBUGMODE) {
        console.log("updateRoomData:", roomData)
    }
    wss.to(room).emit('updateRoomData', roomData)
}
// Removes the file from the tree if there is no client and text
function removeFileFromTree(room: string) {
    if (room === undefined) {
        return
    }
    let root_room = getRootRoomName(room)
    // Count clients in the room
    let clientNumber = 1
    if (wss.sockets.adapter.rooms[room]) {
        clientNumber = wss.sockets.adapter.rooms[room].length
    }
    // Remove room from filesList if there is no other client and no text
    if (clientNumber <= 1) {
        getRoomData(room).then((roomData: RoomData) => {
            if (!roomData.text) {
                redisclient .pipeline()
                    .srem(root_room, room)
                    .smembers(root_room)
                    .exec().then((results: any) => {
                        let files = results[1][1]
                        console.log("DISCONNECTING FILES LIST:", files)
                        wss.to(root_room).emit('filesList', files)
                    })
            }
        })
    }
}

interface RoomData {
    _id?: string // ID of the cliend
    text?: string // Text
    mode?: string // Mode for syntax highlight
}

wss.on('connection', (ws: any) => {

    ws.on('room', (room: string) => {
        if (room===null) {
            console.log(ws.id, "ROOM IS NULL")
            return
        }
        room = getRoomName(room)
        let root_room = getRootRoomName(room)

        // Join rooms
        ws.join(root_room) // ROOM_POSITIONS = root
        console.log(ws.id, "JOIN ROOM:", root_room)
        ws.join(room)      // ROOM_POSITIONS = page
        console.log(ws.id, "JOIN ROOM:", room)

        addToFileTree(wss, room)
        sendRoomDataToClient(ws, room)

        ws.emit('room', 'joined')
    })
    ws.on('updateRoomData', (roomData: RoomData) => {
        let room = getRoom(wss, ws, 'page')
        redisclient.hmset(room, roomData).catch(err => console.error(err))
        broadcastRoomDataToClient(wss, room, roomData)
    })
    ws.on('disconnecting', () => {
        let room = getRoom(wss, ws, 'page')
        let root_room = getRoom(wss, ws, 'root')
        if (DEBUGMODE) {
            console.log(ws.id, "DISCONNECTING:", room, root_room)
        }
        removeFileFromTree(room)
    })
})

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
})