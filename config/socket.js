import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

let io;
const activeImports = new Map(); // Track active import sessions

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await db.User.findByPk(decoded.id);
      
      if (!user) return next(new Error('User not found'));
      
      socket.user = user;
      // Also fetch staff role if needed, but user.role is main
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.role})`);
    
    // Join a room based on role
    // Room name: `role:${role}`
    // e.g. `role:kitchen_staff`, `role:admin`
    if (socket.user.role) {
      socket.join(`role:${socket.user.role}`);
      
      // Also join individual room
      socket.join(`user:${socket.user.id}`);

      // If user is super_admin/admin, maybe they listen to everything?
      // Or we just emit to `role:super_admin` etc.
    }

    // Handle inventory import monitoring
    socket.on('join_import_session', (sessionId) => {
      if (activeImports.has(sessionId)) {
        socket.join(`import_${sessionId}`);
        socket.emit('import_session_joined', { sessionId });
        
        // Send current status if import is in progress
        const currentStatus = activeImports.get(sessionId);
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
      console.log('User disconnected');
    });
  });

  return io;
};

// Inventory monitoring functions
export const startImportSession = (sessionId, userId, itemCount) => {
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

  activeImports.set(sessionId, sessionData);
  broadcastImportProgress(sessionId, sessionData);

  return sessionId;
};

export const updateImportProgress = (sessionId, updates) => {
  const session = activeImports.get(sessionId);
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

  broadcastImportProgress(sessionId, session);
};

export const addImportError = (sessionId, error) => {
  const session = activeImports.get(sessionId);
  if (!session) return;

  session.errors.push({
    ...error,
    timestamp: new Date().toISOString()
  });

  session.errorCount++;
  broadcastImportProgress(sessionId, session);
};

export const addImportWarning = (sessionId, warning) => {
  const session = activeImports.get(sessionId);
  if (!session) return;

  session.warnings.push({
    ...warning,
    timestamp: new Date().toISOString()
  });

  broadcastImportProgress(sessionId, session);
};

export const completeImportSession = (sessionId, results) => {
  const session = activeImports.get(sessionId);
  if (!session) return;

  session.status = 'completed';
  session.endTime = Date.now();
  session.totalTime = session.endTime - session.startTime;
  session.progress = 100;
  session.results = results;

  broadcastImportProgress(sessionId, session);

  // Clean up session after 5 minutes
  setTimeout(() => {
    activeImports.delete(sessionId);
  }, 5 * 60 * 1000);
};

export const broadcastImportProgress = (sessionId, sessionData) => {
  if (!io) return;
  
  io.to(`import_${sessionId}`).emit('import_progress', {
    sessionId,
    ...sessionData,
    timestamp: new Date().toISOString()
  });
};

export const broadcastInventoryUpdate = (update) => {
  if (!io) return;
  
  io.to('inventory_updates').emit('inventory_update', {
    ...update,
    timestamp: new Date().toISOString()
  });
};

export const sendNotificationToUser = (userId, notification) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });
};

export const sendNotificationToRole = (role, notification) => {
  if (!io) return;
  
  io.to(`role:${role}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });
};

export const generateSessionId = () => {
  return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
