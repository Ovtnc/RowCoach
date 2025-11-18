# 👥 Multi Row Feature Guide

## Overview
Multi Row is a real-time multiplayer rowing feature that allows multiple athletes to train together synchronously, compare their performance, and track team averages.

## Features

### ✨ Core Features
- **Real-time Synchronization**: All participants see each other's stats live
- **Session-based**: Join with a 6-digit code
- **Leaderboard**: Live ranking based on distance
- **Team Averages**: See team average distance and SPM
- **Flexible Workouts**: Support for Just Row and Interval training
- **Program Repeats**: Complete entire workout programs multiple times

### 🏗️ Architecture

#### Frontend
- React Native screens
- Socket.IO client for real-time updates
- Local state management with sync

#### Backend
- Express REST API for session management
- Socket.IO for real-time data sync
- MongoDB for session storage
- Auto-expiring sessions (24 hours)

## User Flow

### 1. Create or Join Session

**Host Creates Session:**
```
1. Open Multi Row
2. Enter your name
3. Tap "CREATE SESSION"
4. Get 6-digit code (e.g., ABC123)
5. Share code with friends
```

**Participant Joins:**
```
1. Open Multi Row
2. Enter your name
3. Enter session code
4. Tap "JOIN SESSION"
```

### 2. Waiting Room (Lobby)

**Host View:**
- See all participants
- Select workout type (Just Row or Interval)
- Start workout for everyone

**Participant View:**
- See all participants
- See selected workout type
- Wait for host to start

### 3. Active Workout

**All Participants:**
- Tap STROKE button for each rowing stroke
- See your own stats (distance, SPM, split)
- See live leaderboard with rankings
- See team averages
- Pause/Resume individually
- Finish when done

**Real-time Updates:**
- Distance updates via GPS (for distance-based intervals)
- SPM calculation based on stroke timing
- Split time (/500m) calculation
- Live ranking updates
- Team average calculations

### 4. Data Display

**Your Stats Card:**
```
Your Stats              #2
─────────────────────────
Distance  │  SPM  │ Split
  450m    │ 22.5  │ 2:05
```

**Leaderboard:**
```
🥇 #1  Alice    500m  22.5 SPM  2:03
🥈 #2  Bob      450m  23.1 SPM  2:05  (You)
🥉 #3  Charlie  420m  21.8 SPM  2:10
```

**Team Average:**
```
Team Average
────────────
Avg Distance: 456m
Avg SPM: 22.5
```

## Workout Types

### Just Row
- Free rowing session
- GPS-based distance tracking
- Real-time comparison
- No structure, row at your own pace

### Interval
- Structured interval program
- Set up intervals before starting
- Synchronized interval progression
- All participants do same intervals
- Target rate guidance

## Technical Implementation

### Socket.IO Events

**Client → Server:**
- `multi-row:join` - Join session room
- `multi-row:update-stats` - Update participant stats
- `multi-row:select-workout` - Host selects workout type
- `multi-row:start-workout` - Host starts workout
- `multi-row:finish` - Participant finishes
- `multi-row:leave` - Leave session

**Server → Client:**
- `multi-row:participant-joined` - New participant joined
- `multi-row:participant-left` - Participant left
- `multi-row:stats-updated` - Participant stats updated
- `multi-row:workout-selected` - Workout type selected
- `multi-row:workout-started` - Workout started
- `multi-row:participant-finished` - Participant finished

### REST API Endpoints

```
POST   /api/multi-row/create          - Create session
POST   /api/multi-row/join            - Join session
PUT    /api/multi-row/workout-type    - Update workout type
POST   /api/multi-row/start           - Start session
PUT    /api/multi-row/stats           - Update stats
GET    /api/multi-row/:code           - Get session
POST   /api/multi-row/finish          - Finish session
```

### Data Models

**Session:**
```typescript
{
  code: string;              // 6-digit code
  hostId: string;            // Host user ID
  workoutType: string | null;
  participants: Participant[];
  status: 'waiting' | 'active' | 'completed';
  startedAt: Date | null;
  finishedAt: Date | null;
  expiresAt: Date;           // Auto-delete after 24h
}
```

**Participant:**
```typescript
{
  userId: string;
  name: string;
  isHost: boolean;
  distance: number;          // meters
  strokes: number;
  spm: number;               // strokes per minute
  split: number;             // seconds per 500m
  status: 'ready' | 'active' | 'finished';
}
```

## GPS Tracking

- Distance automatically tracked via GPS
- Real-time split calculation
- 5-meter update interval
- High accuracy mode
- Haversine formula for distance calculation

## Stats Calculations

**SPM (Strokes Per Minute):**
```
SPM = 60 / (time between strokes)
```

**Split Time (/500m):**
```
Split = (elapsed time / distance) × 500
```

**Team Average:**
```
Avg Distance = sum(all distances) / participant count
Avg SPM = sum(all SPMs) / participant count
```

## Future Enhancements

- [ ] Chat messaging
- [ ] Voice commands
- [ ] Coach mode (trainer can see all athletes)
- [ ] Workout history sharing
- [ ] Team challenges
- [ ] Audio cues when passed/being passed
- [ ] Performance graphs
- [ ] Export session data

## Notes

- Sessions expire after 24 hours
- Requires location permission for GPS tracking
- Best used outdoors for accurate GPS
- Backend must be running for real-time sync
- Max recommended participants: 10


