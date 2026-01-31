# Events Contract: [FEATURE NAME]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]

---

## Overview

This document defines all **real-time events** (WebSocket, Server-Sent Events, Message Queue) for the feature.

### Transport

| Protocol | Endpoint | Authentication |
|----------|----------|----------------|
| WebSocket | `wss://api.example.com/ws` | Bearer token in query param |
| SSE | `https://api.example.com/events` | Bearer token in header |

---

## Client → Server Events

### Event: `[event.name]`

> **Trigger**: [When client sends this event]
> **User Story**: US001

**Payload**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Event type: `"[event.name]"` |
| `payload.field1` | string | Yes | [Description] |
| `payload.field2` | number | No | [Description] |

**Example**:

```json
{
  "type": "[event.name]",
  "payload": {
    "field1": "value",
    "field2": 123
  }
}
```

**Validation Rules**:
- `field1`: Max 500 characters
- `field2`: Range 1-1000

**Server Response**: `[event.name].ack` or `[event.name].error`

---

### Event: `[event.name2]`

> **Trigger**: [When client sends this event]

[Same structure as above]

---

## Server → Client Events

### Event: `[event.created]`

> **Trigger**: [When server sends this event]
> **Subscribers**: [Who receives this - all, room members, specific user]

**Payload**:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Event type: `"[event.created]"` |
| `payload.id` | UUID | Resource ID |
| `payload.data` | object | Full resource object |
| `timestamp` | ISO8601 | Event timestamp |

**Example**:

```json
{
  "type": "[event.created]",
  "payload": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "field1": "value"
    }
  },
  "timestamp": "2026-01-31T10:00:00Z"
}
```

---

### Event: `[event.updated]`

> **Trigger**: Resource was modified

**Payload**:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `"[event.updated]"` |
| `payload.id` | UUID | Resource ID |
| `payload.changes` | object | Only changed fields |
| `payload.version` | number | Optimistic locking version |

---

### Event: `[event.deleted]`

> **Trigger**: Resource was removed

**Payload**:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `"[event.deleted]"` |
| `payload.id` | UUID | Deleted resource ID |

---

## System Events

### Event: `connection.established`

> **Trigger**: WebSocket connection successful

**Payload**:

```json
{
  "type": "connection.established",
  "payload": {
    "connectionId": "abc123",
    "serverTime": "2026-01-31T10:00:00Z"
  }
}
```

---

### Event: `error`

> **Trigger**: Server-side error occurred

**Payload**:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `"error"` |
| `payload.code` | string | Error code |
| `payload.message` | string | Human-readable message |
| `payload.originalEvent` | string | Event that caused error |

**Error Codes**:

| Code | Description | Client Action |
|------|-------------|---------------|
| `INVALID_PAYLOAD` | Malformed event data | Fix and retry |
| `UNAUTHORIZED` | Token expired/invalid | Re-authenticate |
| `RATE_LIMITED` | Too many events | Back off, retry later |
| `NOT_FOUND` | Resource doesn't exist | Refresh state |
| `CONFLICT` | Version conflict | Fetch latest, merge |

---

### Event: `ping` / `pong`

> **Purpose**: Keep-alive mechanism

**Interval**: Every 30 seconds
**Timeout**: 60 seconds without pong = disconnect

---

## Rooms / Channels

### Room: `[room-pattern]`

> **Pattern**: `resource:{resourceId}`
> **Example**: `conversation:550e8400-e29b-41d4-a716-446655440000`

**Join**:
```json
{
  "type": "room.join",
  "payload": {
    "room": "conversation:550e8400..."
  }
}
```

**Leave**:
```json
{
  "type": "room.leave",
  "payload": {
    "room": "conversation:550e8400..."
  }
}
```

**Events Received**: `[event.created]`, `[event.updated]`, `[event.deleted]`

---

## Event Flow Diagrams

### [Scenario Name]

```text
Client A                Server                Client B
   │                       │                      │
   │─── [event.send] ─────▶│                      │
   │                       │                      │
   │◀── [event.ack] ───────│                      │
   │                       │                      │
   │                       │─── [event.new] ─────▶│
   │                       │                      │
```

---

## Reconnection Strategy

| Scenario | Client Action |
|----------|---------------|
| Clean disconnect | Reconnect immediately |
| Network error | Exponential backoff (1s, 2s, 4s, max 30s) |
| Auth error | Refresh token, then reconnect |
| Server restart | Wait for `connection.established`, resync state |

### State Resync on Reconnect

1. Send `sync.request` with last known event timestamp
2. Server sends missed events in order
3. Client applies events to local state

---

## Rate Limits

| Event Type | Limit | Window |
|------------|-------|--------|
| `[event.name]` | 10 | per second |
| `room.join` | 5 | per minute |
| Total events | 100 | per minute |

---

## TypeScript Definitions

```typescript
// Event types (for client SDK)

interface BaseEvent<T extends string, P = unknown> {
  type: T;
  payload: P;
  timestamp?: string;
}

// Client → Server
type SendEvent = BaseEvent<'[event.name]', {
  field1: string;
  field2?: number;
}>;

// Server → Client  
type CreatedEvent = BaseEvent<'[event.created]', {
  id: string;
  data: Resource;
}>;

type ServerEvent = 
  | CreatedEvent 
  | UpdatedEvent 
  | DeletedEvent 
  | ErrorEvent;
```

---

## Checklist

### Completeness
- [ ] All user interactions have corresponding events
- [ ] All state changes broadcast to relevant clients
- [ ] Error events defined for all failure modes

### Consistency
- [ ] Event names follow convention (`resource.action`)
- [ ] Payload structures are consistent
- [ ] Timestamps in ISO8601 format

### Testability
- [ ] Each event can be triggered in isolation
- [ ] Mock events documented for testing
