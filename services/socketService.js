import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class SocketService {
  constructor() {
    this.io = null;
    this.activeImports = new Map(); // Track active import sessions
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    this.setupEventHandlers();
    console.log('✅ Socket.io server initialized for real-time monitoring');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.user.email} (${socket.user.role})`);

      // Join role-based rooms
      socket.join(`role_${socket.user.role}`);
      socket.join(`user_${socket.user.id}`);

      // Handle inventory import monitoring
      socket.on('join_import_session', (sessionId) => {
        if (this.activeImports.has(sessionId)) {
          socket.join(`import_${sessionId}`);
          socket.emit('import_session_joined', { sessionId });
          
          // Send current status if import is in progress
          const currentStatus = this.activeImports.get(sessionId);
          if (currentStatus && currentStatus.status !== 'completed') {
            socket.emit('import_progress', currentStatus);
          }
        } else {
          socket.emit('error', { message: 'Import session not found' });
        }
      });

      socket.on('leave_import_session', (sessionId) => {
        socket.leave(`import_${sessionId}`);
        socket.emit('import_session_left', { sessionId });
      });

      // Handle general inventory updates
      socket.on('subscribe_inventory_updates', () => {
        socket.join('inventory_updates');
        socket.emit('subscribed', { channel: 'inventory_updates' });
      });

      socket.on('unsubscribe_inventory_updates', () => {
        socket.leave('inventory_updates');
        socket.emit('unsubscribed', { channel: 'inventory_updates' });
      });

      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.user.email}`);
      });
    });
  }

  // Start tracking a new import session
  startImportSession(sessionId, userId, itemCount) {
    const sessionData = {
      sessionId,
      userId,
      startTime: Date.now(),
      itemCount,
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      skipCount: 0,
      status: 'initializing',
      currentPhase: 'validation',
      progress: 0,
      errors: [],
      warnings: [],
      estimatedTimeRemaining: null
    };

    this.activeImports.set(sessionId, sessionData);
    this.broadcastImportProgress(sessionId, sessionData);

    return sessionId;
  }

  // Update import progress
  updateImportProgress(sessionId, updates) {
    const session = this.activeImports.get(sessionId);
    if (!session) return;

    // Update session data
    Object.assign(session, updates);

    // Calculate progress percentage
    if (session.itemCount > 0) {
      session.progress = Math.round((session.processedCount / session.itemCount) * 100);
    }

    // Estimate remaining time
    if (session.processedCount > 0 && session.status !== 'completed') {
      const elapsed = Date.now() - session.startTime;
      const avgTimePerItem = elapsed / session.processedCount;
      const remainingItems = session.itemCount - session.processedCount;
      session.estimatedTimeRemaining = Math.round(avgTimePerItem * remainingItems);
    }

    this.broadcastImportProgress(sessionId, session);
  }

  // Add error to import session
  addImportError(sessionId, error) {
    const session = this.activeImports.get(sessionId);
    if (!session) return;

    session.errors.push({
      ...error,
      timestamp: new Date().toISOString()
    });

    session.errorCount++;
    this.broadcastImportProgress(sessionId, session);
  }

  // Add warning to import session
  addImportWarning(sessionId, warning) {
    const session = this.activeImports.get(sessionId);
    if (!session) return;

    session.warnings.push({
      ...warning,
      timestamp: new Date().toISOString()
    });

    this.broadcastImportProgress(sessionId, session);
  }

  // Complete import session
  completeImportSession(sessionId, results) {
    const session = this.activeImports.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    session.endTime = Date.now();
    session.totalTime = session.endTime - session.startTime;
    session.progress = 100;
    session.results = results;

    this.broadcastImportProgress(sessionId, session);

    // Clean up session after 5 minutes
    setTimeout(() => {
      this.activeImports.delete(sessionId);
    }, 5 * 60 * 1000);
  }

  // Broadcast progress to all clients in the import session
  broadcastImportProgress(sessionId, sessionData) {
    this.io.to(`import_${sessionId}`).emit('import_progress', {
      sessionId,
      ...sessionData,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast inventory updates to all subscribers
  broadcastInventoryUpdate(update) {
    this.io.to('inventory_updates').emit('inventory_update', {
      ...update,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to role
  sendNotificationToRole(role, notification) {
    this.io.to(`role_${role}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Get active import sessions for a user
  getUserActiveImports(userId) {
    const userSessions = [];
    for (const [sessionId, session] of this.activeImports.entries()) {
      if (session.userId === userId) {
        userSessions.push(session);
      }
    }
    return userSessions;
  }

  // Get all active import sessions (for admins)
  getAllActiveImports() {
    return Array.from(this.activeImports.values());
  }

  // Generate unique session ID
  generateSessionId() {
    return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
