# 🚀 React + Tailwind CSS Socket.io Inventory Monitor

A complete real-time inventory batch import monitoring system built with React, Tailwind CSS, and Socket.io.

## 📋 Features

- ✅ **Real-time Socket.io Connection** - Live monitoring of batch imports
- ✅ **Phase-based Progress Tracking** - Validation, duplicate check, creation phases
- ✅ **Beautiful UI with Tailwind CSS** - Modern, responsive design
- ✅ **File Upload Support** - CSV and JSON file formats
- ✅ **Error & Warning Display** - Real-time error reporting
- ✅ **Session Management** - Multiple concurrent import sessions
- ✅ **Authentication** - JWT-based secure connections
- ✅ **Auto-reconnection** - Robust connection handling

## 🛠️ Installation

### Prerequisites

- Node.js 16+
- React 18+
- Socket.io server running on port 3000

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
```

## 🔌 Socket.io Integration

### Connection Setup

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "your-jwt-token" },
  transports: ["websocket", "polling"],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

### Event Handlers

```javascript
// Connection events
socket.on("connect", () => {
  console.log("✅ Connected to Socket.io");
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected:", reason);
});

// Import monitoring events
socket.on("import_progress", (progress) => {
  console.log("📊 Progress:", progress);
});

socket.on("import_session_joined", (data) => {
  console.log("🎯 Joined session:", data.sessionId);
});
```

## 📤 File Upload Process

### Step 1: File Selection

```javascript
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  setSelectedFile(file);
};
```

### Step 2: File Parsing

```javascript
const parseFile = async (file) => {
  const text = await file.text();

  if (file.name.endsWith(".json")) {
    return JSON.parse(text);
  } else if (file.name.endsWith(".csv")) {
    // Parse CSV logic
    return parseCSV(text);
  }
};
```

### Step 3: Upload & Monitor

```javascript
const startUpload = async () => {
  // Parse file
  const items = await parseFile(selectedFile);

  // Start batch upload
  const response = await fetch("/api/inventory/items/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  const result = await response.json();

  // Start monitoring
  if (result.meta?.sessionId) {
    socket.emit("join_import_session", result.meta.sessionId);
  }
};
```

## 📊 Progress Monitoring

### Progress Data Structure

```javascript
{
  sessionId: 'import_1704067200000_abc123def456',
  status: 'processing',           // idle, processing, completed, error
  currentPhase: 'validation',     // validation, duplicate_check, creation
  progress: 45,                  // 0-100 percentage
  processedCount: 45,
  successCount: 40,
  errorCount: 3,
  skipCount: 2,
  itemCount: 100,
  estimatedTimeRemaining: 5000,   // milliseconds
  errors: [
    {
      index: 12,
      error: 'Missing required fields: name, category, sku',
      type: 'validation',
      timestamp: '2024-12-31T12:30:30.000Z'
    }
  ],
  warnings: [
    {
      index: 8,
      error: 'Item with name "Premium Towels" already exists',
      type: 'duplicate',
      timestamp: '2024-12-31T12:30:25.000Z'
    }
  ]
}
```

### UI Components

```jsx
// Progress Bar
<div className="w-full bg-gray-200 rounded-full h-3">
  <div
    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
    style={{ width: `${progress.progress}%` }}
  />
</div>

// Status Badge
<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(progress.status)}`}>
  {progress.status}
</span>

// Stats Grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="bg-blue-50 p-4 rounded-lg">
    <div className="text-2xl font-bold text-blue-600">{progress.processedCount}</div>
    <div className="text-sm text-blue-800">Processed</div>
  </div>
  {/* More stat cards... */}
</div>
```

## 📁 File Formats

### CSV Format

```csv
name,category,sku,description,unit,minLevel,maxLevel,reorderLevel,costPrice,sellingPrice,supplier,location
Premium Towels,Linens,TOW-001,High-quality cotton towels,pieces,10,100,20,15.50,25.00,Luxury Linens,Storage A
Bath Soaps,Toiletries,SOAP-001,Premium bath soap,pieces,50,200,75,2.50,5.00,Hygiene Ltd,Storage B
```

### JSON Format

```json
[
  {
    "name": "Premium Towels",
    "category": "Linens",
    "sku": "TOW-001",
    "description": "High-quality cotton towels",
    "unit": "pieces",
    "minLevel": 10,
    "maxLevel": 100,
    "reorderLevel": 20,
    "costPrice": 15.5,
    "sellingPrice": 25.0,
    "supplier": "Luxury Linens Co.",
    "location": "Storage Room A"
  }
]
```

## 🎨 Tailwind CSS Styling

### Color Scheme

```css
/* Primary Colors */
.bg-blue-600    /* Main buttons, links */
/* Main buttons, links */
.bg-green-600   /* Success states */
.bg-red-600     /* Error states */
.bg-yellow-600  /* Warning states */

/* Status Colors */
.bg-blue-100    /* Processing state */
.bg-green-100   /* Completed state */
.bg-red-100     /* Error state */
.bg-gray-100    /* Idle state */

/* Progress Colors */
.from-blue-500   /* Progress gradient start */
.to-green-500; /* Progress gradient end */
```

### Responsive Design

```jsx
/* Mobile-first approach */
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* 2 columns on mobile, 4 on desktop */}
</div>

<div className="max-w-4xl mx-auto p-6">
  {/* Responsive container */}
</div>
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file
REACT_APP_SOCKET_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:3000/api
```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
```

## 🚀 Quick Start

### 1. Demo HTML (No Build Required)

```bash
# Open the demo file in your browser
open frontend/demo.html
```

### 2. Development Server

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3001
```

### 3. Production Build

```bash
npm run build
npm run preview
```

## 📱 Usage Examples

### Basic Usage

```jsx
import React from "react";
import BatchImportMonitor from "./components/BatchImportMonitor";

const App = () => {
  const token = localStorage.getItem("jwt-token");

  return (
    <div className="min-h-screen bg-gray-100">
      <BatchImportMonitor
        token={token}
        onImportComplete={(results) => {
          console.log("Import completed:", results);
        }}
      />
    </div>
  );
};
```

### Advanced Usage with Custom Styling

```jsx
const CustomMonitor = () => {
  const [customTheme, setCustomTheme] = useState({
    primaryColor: "blue",
    borderRadius: "rounded-lg",
  });

  return (
    <div className={`theme-${customTheme.primaryColor}`}>
      <BatchImportMonitor
        token={token}
        theme={customTheme}
        onImportComplete={handleComplete}
      />
    </div>
  );
};
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Socket Connection Failed

```javascript
// Check server is running
curl http://localhost:3000

// Check CORS configuration
// In server.js, ensure CORS allows your frontend URL
```

#### 2. Authentication Error

```javascript
// Verify JWT token format
const token = localStorage.getItem("jwt-token");
console.log("Token:", token);

// Check token expiration
const decoded = jwt.decode(token);
console.log("Expires:", decoded.exp);
```

#### 3. File Upload Issues

```javascript
// Check file size limits
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  alert("File too large");
}

// Check file format
const allowedTypes = ["text/csv", "application/json"];
if (!allowedTypes.includes(file.type)) {
  alert("Invalid file format");
}
```

### Debug Mode

```javascript
// Enable Socket.io debugging
localStorage.setItem("socket.io-debug", "true");

// Monitor all events
socket.onAny((eventName, ...args) => {
  console.log(`🔌 Event: ${eventName}`, args);
});
```

## 📈 Performance Optimization

### React Optimizations

```jsx
// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return items.map(processItem);
}, [items]);

// Use useCallback for event handlers
const handleFileSelect = useCallback((event) => {
  const file = event.target.files[0];
  setSelectedFile(file);
}, []);
```

### Socket.io Optimizations

```javascript
// Limit event frequency
const throttledProgress = throttle((progress) => {
  setProgress(progress);
}, 100);

// Batch multiple updates
const batchUpdates = [];
setInterval(() => {
  if (batchUpdates.length > 0) {
    socket.emit("batch_progress", batchUpdates);
    batchUpdates.length = 0;
  }
}, 1000);
```

## 🎯 Best Practices

### Security

- ✅ Always validate JWT tokens
- ✅ Sanitize file uploads
- ✅ Use HTTPS in production
- ✅ Implement rate limiting

### Performance

- ✅ Use React.memo for expensive components
- ✅ Implement virtual scrolling for large lists
- ✅ Optimize Socket.io event handling
- ✅ Use Web Workers for file parsing

### UX

- ✅ Provide clear loading states
- ✅ Show progress indicators
- ✅ Handle errors gracefully
- ✅ Support keyboard navigation

## 📚 API Reference

### Socket.io Events

#### Client → Server

| Event                         | Parameters      | Description              |
| ----------------------------- | --------------- | ------------------------ |
| `join_import_session`         | `{ sessionId }` | Join monitoring session  |
| `leave_import_session`        | `{ sessionId }` | Leave monitoring session |
| `subscribe_inventory_updates` | -               | Subscribe to updates     |

#### Server → Client

| Event                   | Parameters      | Description        |
| ----------------------- | --------------- | ------------------ |
| `import_progress`       | `ProgressData`  | Real-time progress |
| `import_session_joined` | `{ sessionId }` | Session joined     |
| `import_session_left`   | `{ sessionId }` | Session left       |
| `error`                 | `{ message }`   | Error occurred     |

### Component Props

#### BatchImportMonitor

| Prop               | Type     | Required | Description               |
| ------------------ | -------- | -------- | ------------------------- |
| `token`            | string   | ✅       | JWT authentication token  |
| `onImportComplete` | function | ❌       | Completion callback       |
| `theme`            | object   | ❌       | Custom theme object       |
| `autoReconnect`    | boolean  | ❌       | Auto-reconnection setting |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Socket.io](https://socket.io/) - Real-time communication
- [Vite](https://vitejs.dev/) - Build tool

---

**Built with ❤️ for EliteHub Hotel Management System**
