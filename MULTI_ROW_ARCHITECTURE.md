# 👥 Multi Row - Architecture & Flow

## 🎯 Çalışma Mantığı

### Genel Akış
```
1. CREATE/JOIN → 2. LOBBY → 3. ACTIVE WORKOUT → 4. RESULTS
```

---

## 📱 Frontend Akışı

### 1. JOIN/CREATE Screen

**Host (Antrenör/Oluşturan):**
```typescript
1. İsim girer: "Coach John"
2. CREATE SESSION tıklar
3. Backend API: POST /api/multi-row/create
4. Session code alır: "ABC123"
5. Socket.IO: multi-row:join("ABC123") emit eder
6. LOBBY'ye geçer
```

**Participant (Sporcu):**
```typescript
1. İsim girer: "Alice"
2. Code girer: "ABC123"
3. JOIN SESSION tıklar
4. Backend API: POST /api/multi-row/join
5. Socket.IO: multi-row:join("ABC123") emit eder
6. LOBBY'ye geçer
```

### 2. LOBBY (Waiting Room)

**Host:**
```typescript
1. Katılımcıları görür (real-time)
2. Workout type seçer: Just Row veya Interval
   → Socket.IO: multi-row:select-workout emit
   → Tüm katılımcılara broadcast
3. START FOR EVERYONE tıklar
   → Backend API: POST /api/multi-row/start
   → Socket.IO: multi-row:start-workout emit
   → Herkes ACTIVE'e geçer (synchronized)
```

**Participants:**
```typescript
1. Katılımcıları görür (real-time)
2. Host'un seçtiği workout'u görür
3. "Waiting for host..." mesajı
4. Socket.IO listener: multi-row:workout-started
   → Otomatik ACTIVE'e geçer
```

### 3. ACTIVE WORKOUT

**Her Katılımcı:**

```typescript
// GPS Tracking (Her 5m)
useEffect(() => {
  Geolocation.watchPosition((position) => {
    distance += calculateDistance(...)
    split = (time / distance) * 500
    
    // Sync to all
    syncMyStats(distance, strokes, spm, split)
  })
}, [])

// Stroke Tap
handleStroke() {
  strokes++
  spm = 60 / timeDiff
  
  // Sync to all
  syncMyStats(distance, strokes, spm, split)
}

// Sync Function
syncMyStats(distance, strokes, spm, split) {
  // 1. Update local state
  setSession(prev => updateMyParticipant(...))
  
  // 2. Send to server via Socket.IO
  socket.emit('multi-row:update-stats', {
    sessionCode,
    userId,
    stats: { distance, strokes, spm, split }
  })
  
  // 3. Server broadcasts to all
  // 4. All clients receive 'multi-row:stats-updated'
  // 5. All update their leaderboards
}
```

**Real-time Updates:**
```typescript
socketService.onStatsUpdated((data) => {
  // data = { userId, stats, timestamp }
  
  setSession(prev => ({
    ...prev,
    participants: prev.participants.map(p =>
      p.userId === data.userId 
        ? { ...p, ...data.stats }  // Update specific participant
        : p
    )
  }))
  
  // Leaderboard otomatik re-sort
  // Rank'lar otomatik güncellenir
  // Team average otomatik hesaplanır
})
```

---

## 🔄 Backend Akışı

### Socket.IO Event Handling

```typescript
// Client joins session
socket.on('multi-row:join', async (sessionCode) => {
  // 1. Join Socket.IO room
  socket.join(`session-${sessionCode}`)
  
  // 2. Send current state to new joiner
  const session = await MultiRowSession.findOne({ code })
  socket.emit('multi-row:session-state', { session })
  
  // 3. Notify others
  socket.to(`session-${sessionCode}`)
    .emit('multi-row:participant-joined', { ... })
})

// Client updates stats
socket.on('multi-row:update-stats', async (data) => {
  const { sessionCode, userId, stats } = data
  
  // 1. Update database
  await MultiRowSession.updateOne(
    { code: sessionCode, 'participants.userId': userId },
    { $set: { 'participants.$': stats } }
  )
  
  // 2. Broadcast to ALL (including sender)
  io.to(`session-${sessionCode}`)
    .emit('multi-row:stats-updated', {
      userId,
      stats,
      timestamp: Date.now()
    })
})

// Host starts workout
socket.on('multi-row:start-workout', async (sessionCode) => {
  // 1. Update session status
  await MultiRowSession.updateOne(
    { code: sessionCode },
    { status: 'active', startedAt: new Date() }
  )
  
  // 2. Broadcast start to ALL
  io.to(`session-${sessionCode}`)
    .emit('multi-row:workout-started', {
      startTime: Date.now()
    })
})
```

### REST API Endpoints

```typescript
POST /api/multi-row/create
- Generate unique 6-digit code
- Create session in MongoDB
- Add host as first participant
- Return session data

POST /api/multi-row/join
- Validate session code
- Check session not started
- Add participant to session
- Return updated session

PUT /api/multi-row/stats
- Find session & participant
- Update participant stats
- Save to MongoDB
- Return updated session

GET /api/multi-row/:code
- Fetch session from MongoDB
- Return all participants & stats
- Used for polling/refresh
```

---

## 📊 Data Flow Example

### Scenario: 3 kişi beraber antrenman

```
Time: T0 (Başlangıç)
─────────────────────────────
Host: "Coach" creates session → ABC123
Participant1: "Alice" joins → ABC123
Participant2: "Bob" joins → ABC123

MongoDB:
{
  code: "ABC123",
  participants: [
    { userId: "1", name: "Coach", isHost: true, distance: 0 },
    { userId: "2", name: "Alice", isHost: false, distance: 0 },
    { userId: "3", name: "Bob", isHost: false, distance: 0 }
  ],
  status: "waiting"
}
```

```
Time: T1 (Host workout seçer)
─────────────────────────────
Host: Selects "Just Row"
  ↓
Socket: multi-row:select-workout
  ↓
Backend: Updates session.workoutType = "just-row"
  ↓
Socket Broadcast: multi-row:workout-selected
  ↓
All clients: Workout görür
```

```
Time: T2 (Start)
─────────────────────────────
Host: START FOR EVERYONE
  ↓
Backend API: POST /api/multi-row/start
  ↓
Backend: session.status = "active", startedAt = now
  ↓
Socket Broadcast: multi-row:workout-started { startTime: 1234567890 }
  ↓
All clients: Sync start → setPhase('active'), setStartTime(1234567890)
  ↓
Hepsi aynı anda başlar!
```

```
Time: T3 (Alice'in ilk stroke'u)
─────────────────────────────
Alice: STROKE tıklar
  ↓
Local: strokes = 1, spm = 0 (ilk)
  ↓
Socket: multi-row:update-stats {
  sessionCode: "ABC123",
  userId: "2",
  stats: { distance: 0, strokes: 1, spm: 0, split: 0 }
}
  ↓
Backend: MongoDB güncelle + Broadcast
  ↓
All clients receive: multi-row:stats-updated { userId: "2", stats: {...} }
  ↓
Coach sees: Alice - 0m, 1 stroke, 0 SPM
Bob sees: Alice - 0m, 1 stroke, 0 SPM
Alice sees: Kendi stats güncel
```

```
Time: T4 (10 saniye sonra, herkes aktif)
─────────────────────────────
GPS updates (her 5m hareket):

Alice: 
  GPS: +10m → distance = 10m
  Strokes: 5 → spm = 30
  Split: (10s / 10m) * 500 = 500s = 8:20/500m
  Socket emit → Broadcast

Bob:
  GPS: +15m → distance = 15m
  Strokes: 7 → spm = 28
  Split: (10s / 15m) * 500 = 333s = 5:33/500m
  Socket emit → Broadcast

Coach:
  GPS: +12m → distance = 12m
  Strokes: 6 → spm = 29
  Split: (10s / 12m) * 500 = 416s = 6:56/500m
  Socket emit → Broadcast

Leaderboard (herkesin ekranında):
🥇 Bob    15m  28.0 SPM  5:33
🥈 Coach  12m  29.0 SPM  6:56
🥉 Alice  10m  30.0 SPM  8:20

Team Average:
  Avg Distance: 12.3m
  Avg SPM: 29.0
```

```
Time: T5 (Alice finish)
─────────────────────────────
Alice: FINISH tıklar
  ↓
Socket: multi-row:finish { sessionCode, userId: "2" }
  ↓
Backend: Alice.status = "finished"
  ↓
Broadcast: multi-row:participant-finished { userId: "2" }
  ↓
Others see: Alice finished! (graye out veya badge)
```

```
Time: T6 (Herkes finish)
─────────────────────────────
Last person finishes
  ↓
Backend: All participants.status = "finished"
  ↓
Backend: session.status = "completed"
  ↓
Broadcast: multi-row:session-completed
  ↓
All clients: setPhase('results')
  ↓
Results screen with final leaderboard
```

---

## 🔐 Güvenlik & Validations

### Session Code
```typescript
- 6 characters
- Uppercase only
- No confusing chars (0/O, 1/I, etc.)
- Unique check in DB
- Example: "ABC123", "XY7K9P"
```

### Permissions
```typescript
- Only HOST can:
  ✓ Select workout type
  ✓ Start workout
  ✓ (Future: Kick participants)

- All participants can:
  ✓ View stats
  ✓ Update own stats
  ✓ Pause/Resume own workout
  ✓ Finish own workout
```

### Session Lifecycle
```typescript
- Created: 24h expiry
- Waiting: Can join
- Active: No new joins
- Completed: Read-only
- Auto-delete: After 24h
```

---

## 📡 Synchronization Strategy

### Primary: Socket.IO (Real-time)
```
Latency: ~50-200ms
Use for: Stats updates, start/finish events
Advantage: Instant updates
```

### Backup: REST API Polling (Fallback)
```
Interval: Every 5 seconds
Use for: When socket disconnects
Advantage: Reliability
```

### Hybrid Approach:
```typescript
// Send via Socket.IO
socketService.updateStats(...)

// Also update local state immediately (optimistic)
setMyDistance(newDistance)

// Periodic GET /api/multi-row/:code (every 5s)
// Resolves conflicts, ensures consistency
```

---

## 🎨 UI/UX Features

### Real-time Feedback
```
✅ Live leaderboard (updates every stroke)
✅ Rank changes (smooth animations)
✅ Team average (updates live)
✅ Connection status badge
✅ GPS status indicator
✅ Pause state sync
```

### Visual Hierarchy
```
Your Stats Card (Top, highlighted)
  → Mavi border
  → Rank badge
  → Large numbers

Leaderboard (Middle)
  → 🥇🥈🥉 for top 3
  → "You" indicator
  → Distance + SPM + Split

Team Average (Bottom)
  → Yeşil border
  → Motivation badge for leader
```

### Animations
```
✅ Stroke button scale
✅ Number pulse on update
✅ Rank change transitions
✅ Connection status pulse
✅ Live indicator blink
```

---

## 🔧 Error Handling

### Connection Lost
```typescript
if (!socket.connected) {
  // Show warning badge
  // Switch to polling mode
  // Retry connection every 3s
}
```

### Participant Drops
```typescript
// Socket disconnect event
socket.on('disconnect') {
  // Mark as "disconnected" in UI
  // Keep stats visible
  // Can rejoin with same code
}
```

### Backend Down
```typescript
// API calls fail
try {
  await apiService.createSession(...)
} catch {
  Alert.alert('Server Error', 'Please try again')
  // Stay in join screen
}
```

---

## 📊 Stats Calculations

### Distance
```typescript
GPS-based (Haversine formula)
Update frequency: Every 5 meters
Accumulation: distance += newDistance
```

### SPM (Strokes Per Minute)
```typescript
Formula: 60 / (currentStrokeTime - lastStrokeTime)
Update: Every stroke
Example: 2.5s between strokes → 24 SPM
```

### Split (/500m)
```typescript
Formula: (elapsedTime / distance) * 500
Update: Every GPS update
Example: 120s / 100m = 1.2s/m * 500 = 600s = 10:00/500m
```

### Team Average
```typescript
Avg Distance = sum(all.distance) / participantCount
Avg SPM = sum(all.spm) / participantCount
Update: Every stats update
```

### Ranking
```typescript
Sort by: distance (descending)
Ties: SPM (higher better)
Update: Every stats broadcast
Display: 🥇🥈🥉 #4 #5...
```

---

## 🚀 Performance Optimizations

### Throttling
```typescript
// Don't send every GPS update
let lastSyncTime = 0
if (Date.now() - lastSyncTime > 1000) { // Max 1/second
  syncMyStats(...)
  lastSyncTime = Date.now()
}
```

### Debouncing
```typescript
// Batch multiple stroke updates
const statsBuffer = []
setInterval(() => {
  if (statsBuffer.length > 0) {
    socketService.updateStats(latestStats)
    statsBuffer = []
  }
}, 500)
```

### Efficient Re-renders
```typescript
// Only update changed participants
React.memo(ParticipantCard, (prev, next) => {
  return prev.distance === next.distance &&
         prev.spm === next.spm
})
```

---

## 📝 Database Schema

```typescript
MultiRowSession {
  code: String (unique, 6 chars)
  hostId: String
  workoutType: 'just-row' | 'interval' | null
  participants: [
    {
      userId: String
      name: String
      isHost: Boolean
      distance: Number (meters)
      strokes: Number
      spm: Number
      split: Number (seconds/500m)
      status: 'ready' | 'active' | 'finished'
      joinedAt: Date
    }
  ]
  status: 'waiting' | 'active' | 'completed'
  startedAt: Date
  finishedAt: Date
  createdAt: Date
  expiresAt: Date (TTL index, auto-delete after 24h)
}
```

---

## 🎯 Future Enhancements

### Interval Sync
```typescript
// All participants same interval
currentInterval: 3/8
Target: 500m @ r20
Progress bar synced
```

### Coach View
```typescript
// Antrenör tüm sporcuları görür
// Target rate verebilir
// Feedback gönderebilir
// Pause/Resume edebilir (herkes için)
```

### Audio Cues
```typescript
// Geçildiğinde ses: "You passed Alice!"
// Geçildiğinde: "Bob passed you!"
// Finish: "Alice finished!"
```

### Video Feed (Gelecek)
```typescript
// WebRTC ile video chat
// Thumbnail view
// Full screen option
```

---

## 🧪 Test Scenarios

### Test 1: Basic Flow
```
1. User A creates session
2. User B joins with code
3. User A selects Just Row
4. User A starts
5. Both tap STROKE
6. Both see each other's stats live
7. Both finish
✅ Success
```

### Test 2: GPS Tracking
```
1. Create session
2. Start workout
3. Walk/run outside
4. Distance increases automatically
5. Split calculated correctly
6. Other participants see updates
✅ Success
```

### Test 3: Disconnection
```
1. Start workout
2. Disable WiFi
3. Re-enable WiFi
4. Socket reconnects
5. Stats still synced
6. No data loss
✅ Success
```

---

## 📈 Monitoring

### Metrics to Track
```
- Active sessions count
- Participants per session (avg)
- Session duration (avg)
- Socket connection uptime
- API response times
- Error rates
```

### Logs
```
✅ Session create/join
✅ Stats update frequency
✅ Socket connect/disconnect
✅ Error events
✅ Participant finish times
```

---

## 🎮 Kullanım Örneği

### Antrenör + 5 Sporcu

**Setup:**
```
1. Antrenör: CREATE SESSION → Code: "ROW123"
2. WhatsApp'ta code paylaş
3. Sporcular: JOIN SESSION → "ROW123" girer
4. Antrenör lobby'de 6 kişi görür
5. Antrenör: "Interval" seçer
6. Antrenör: START FOR EVERYONE
```

**Workout:**
```
7. Herkes aynı anda başlar (synced timer)
8. Her stroke'ta STROKE tap
9. GPS mesafe tracker
10. Live leaderboard:
    🥇 Sporcu1  520m  24 SPM  1:58
    🥈 Sporcu2  510m  26 SPM  2:01
    🥉 Antrenör 505m  22 SPM  2:03
    #4 Sporcu3  495m  25 SPM  2:05
    #5 Sporcu4  490m  23 SPM  2:07
    #6 Sporcu5  480m  27 SPM  2:10

11. Team Average: 500m, 24.5 SPM
12. Herkes finish
```

**Results:**
```
13. Final leaderboard
14. Stats kaydedilir
15. Antrenör yayınlayabilir (publish)
```

---

## ✅ Completed Features

```
✅ Session create/join with code
✅ Real-time Socket.IO sync
✅ GPS distance tracking
✅ SPM calculation
✅ Split time calculation
✅ Live leaderboard
✅ Team averages
✅ Rank badges (🥇🥈🥉)
✅ Host controls
✅ Participant waiting room
✅ Connection status
✅ Pause/Resume individual
✅ Finish detection
✅ Auto session cleanup (24h)
✅ Polling backup
✅ Error handling
```

---

## 🔜 Next Steps

```
⏳ Results screen with sharing
⏳ Workout history save
⏳ Publish to community
⏳ Interval program sync
⏳ Audio cues
⏳ Chat messaging
⏳ Coach feedback system
⏳ Performance graphs
⏳ Export CSV data
```

Artık Multi Row tam profesyonel bir collaborative training sistemi! 🏆


