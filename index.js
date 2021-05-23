import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use('/', express.static('static'))

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  socket.on('sender', (e) => {
    console.log('note', e.toString())
    io.emit('midi', e)
  })

  socket.on('midi loaded', (e) => {
    console.log('midi')
    io.emit('midi loaded', e)
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
