# Firebase Security Rules Setup

## Issue
You're getting "Missing or insufficient permissions" error because Firestore security rules are blocking writes.

## Solution

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Select your project: **pantry-project-51f45**

### Step 2: Navigate to Firestore Rules
1. Click on **Firestore Database** in the left sidebar
2. Click on the **Rules** tab at the top

### Step 3: Update the Rules
Replace the existing rules with one of these options:

#### Option A: Allow All (For Development/Testing Only)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### Option B: Allow All for Your Project (Safer for Testing)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

#### Option C: Production-Ready Rules (Recommended for Portfolio)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{itemId} {
      // Allow anyone to read
      allow read: if true;
      
      // Allow anyone to write (for portfolio demo)
      // In production, you'd add authentication here
      allow write: if true;
    }
  }
}
```

### Step 4: Publish the Rules
1. Click the **Publish** button
2. Wait a few seconds for the rules to update

### Step 5: Test Your App
1. Go back to your app at http://localhost:3000
2. Try adding an item again
3. It should work now!

## Important Notes

⚠️ **Security Warning**: The rules above allow anyone to read/write to your database. This is fine for:
- Local development
- Portfolio projects
- Personal projects

For production apps, you should:
- Add Firebase Authentication
- Restrict rules based on user authentication
- Add validation rules

## Example Production Rules (with Authentication)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

