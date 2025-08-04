# Chat Debug Steps - Start Here

## 🔥 **URGENT: Updated Dev Server Port**
Your dev server is now running on: **http://localhost:5175** (not 5173!)

## 🔍 **Step 1: Check if ChatView Component is Loading**

1. **Open browser** and go to: `http://localhost:5175`
2. **Navigate to AI Course Builder** → Chat interface
3. **Open browser console** (F12 → Console tab)
4. **Look for this log**: `🚀 ChatView component mounted successfully`

### ❌ If you DON'T see the mount log:
- The ChatView component isn't loading at all
- Check if you're in the right section of the app
- Check browser console for any React errors

### ✅ If you DO see the mount log, continue to Step 2

## 🔍 **Step 2: Test Basic Debug Tools**

In browser console, run these commands one by one:

```javascript
// 1. Check if debug tools are available
window.chatDebugTools.getCurrentMessages()

// 2. Test simple message addition
window.chatDebugTools.testSimpleMessage()

// 3. Check state after adding test message
window.chatDebugTools.getCurrentMessages()
```

### Expected Output:
```
💬 Current messages: 0
📋 Message sections: {}
🎯 Current streaming ID: null
🔄 Is loading: false

🧪 Testing simple message addition...
✅ Test message added

💬 Current messages: 1
📋 Message sections: {}
🎯 Current streaming ID: null
🔄 Is loading: false
```

## 🔍 **Step 3: Test Real Chat Message**

1. **Type a simple message** in the chat input: `"hello"`
2. **Press Enter** or click Send
3. **Watch console for these logs**:

```
🎬 About to render messages: {messageCount: 1, messageIds: ["user:xxxxx"]}
👤 Rendering user message xxxxx with plain content
🤖 Adding AI message to messages array. Previous count: 1
🎬 About to render messages: {messageCount: 2, messageIds: ["user:xxxxx", "ai:xxxxx"]}
🎬 Rendering AI message xxxxx with StructuredMessageContent
🎨 StructuredMessageContent rendering for message xxxxx: {sectionCount: 0, sections: []}
```

## 🔍 **Step 4: Test API Connection**

If Step 3 works but no AI response comes, test API:

```javascript
// Test API connection
window.testApiCall()
```

## 🔍 **Step 5: Enable Debug Mode and Test Streaming**

```javascript
// Enable debug mode
window.enableChatDebug()

// Send a real message like "create a small course on AI"
// Watch for streaming logs:
```

Expected streaming logs:
```
📡 Streaming chunk received: [chunk content]
➕ Adding section to message [messageId]
📝 Updated sections for [messageId]: X total sections
🎨 StructuredMessageContent rendering for message [messageId]
```

## 🚨 **Common Issues & Solutions**

### Issue 1: No mount log
**Problem**: ChatView component not loading
**Solution**: Check if you're in AI Course Builder → Chat section

### Issue 2: Mount log appears but no debug tools
**Problem**: `window.chatDebugTools is undefined`
**Solution**: Refresh page, component might not have fully initialized

### Issue 3: Test message doesn't appear in UI
**Problem**: React rendering issue
**Solution**: Check browser console for React errors

### Issue 4: API works but no UI updates
**Problem**: State management issue with streaming
**Solution**: Use `window.simulateLastResponse()` to test with cached data

## 📋 **Information to Provide**

When reporting issues, provide:

1. **Exact logs from each step** (copy-paste from console)
2. **Any error messages** in red in console
3. **Which step failed** and what you see instead
4. **Screenshots** of browser console and chat interface

## 🎯 **Quick Test Commands (Copy-Paste Ready)**

```javascript
// Quick diagnostic - paste this all at once:
console.log("=== CHAT DEBUG DIAGNOSTIC ===");
console.log("1. Debug tools available:", typeof window.chatDebugTools);
console.log("2. Current state:", window.chatDebugTools?.getCurrentMessages());
console.log("3. Testing message...");
window.chatDebugTools?.testSimpleMessage();
console.log("4. State after test:", window.chatDebugTools?.getCurrentMessages());
console.log("=== END DIAGNOSTIC ===");
```

Start with Step 1 and let me know what you see!
