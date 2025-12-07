import socketio

# Define allowed origins matching FastAPI config
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=origins
)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, room_id):
    print(f"Client {sid} joined room {room_id}")
    sio.enter_room(sid, room_id)
    # Notify others in the room
    await sio.emit('user_joined', {'sid': sid}, room=room_id, skip_sid=sid)

@sio.event
async def offer(sid, data):
    # data: { target: target_sid, sdp: ... }
    await sio.emit('offer', {'sdp': data['sdp'], 'caller': sid}, room=data['target'])

@sio.event
async def answer(sid, data):
    # data: { target: target_sid, sdp: ... }
    await sio.emit('answer', {'sdp': data['sdp'], 'responder': sid}, room=data['target'])

@sio.event
async def ice_candidate(sid, data):
    # data: { target: target_sid, candidate: ... }
    await sio.emit('ice_candidate', {'candidate': data['candidate'], 'sender': sid}, room=data['target'])
