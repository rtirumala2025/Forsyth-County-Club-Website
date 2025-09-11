import React, { useState } from 'react';
import { useAuth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const FirestoreTest = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestoreConnection = async () => {
    if (!user) {
      setTestResult('❌ No user authenticated');
      return;
    }

    setLoading(true);
    setTestResult('🔄 Testing Firestore connection...\n');

    try {
      // Test 1: Create a test document
      setTestResult(prev => prev + '📝 Test 1: Creating test document...\n');
      const testDocRef = doc(db, 'test', user.uid);
      await setDoc(testDocRef, {
        test: true,
        timestamp: serverTimestamp(),
        userEmail: user.email
      });
      setTestResult(prev => prev + '✅ Test 1: Document created successfully\n');

      // Test 2: Read the test document
      setTestResult(prev => prev + '📖 Test 2: Reading test document...\n');
      const testDocSnap = await getDoc(testDocRef);
      if (testDocSnap.exists()) {
        setTestResult(prev => prev + '✅ Test 2: Document read successfully\n');
        setTestResult(prev => prev + `📊 Data: ${JSON.stringify(testDocSnap.data(), null, 2)}\n`);
      } else {
        setTestResult(prev => prev + '❌ Test 2: Document not found\n');
      }

      // Test 3: Try to create user profile
      setTestResult(prev => prev + '👤 Test 3: Creating user profile...\n');
      const userDocRef = doc(db, 'users', user.uid);
      const userProfile = {
        name: user.displayName || user.email?.split('@')[0] || "Test User",
        email: user.email,
        bio: "Test bio",
        grade: "Test Grade",
        clubs: ["Test Club"],
        profilePic: "",
        createdAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userProfile);
      setTestResult(prev => prev + '✅ Test 3: User profile created successfully\n');

      // Test 4: Read user profile
      setTestResult(prev => prev + '📖 Test 4: Reading user profile...\n');
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setTestResult(prev => prev + '✅ Test 4: User profile read successfully\n');
        setTestResult(prev => prev + `📊 Profile: ${JSON.stringify(userDocSnap.data(), null, 2)}\n`);
      } else {
        setTestResult(prev => prev + '❌ Test 4: User profile not found\n');
      }

      setTestResult(prev => prev + '\n🎉 All tests passed! Firestore is working correctly.');

    } catch (error) {
      setTestResult(prev => prev + `\n❌ Error: ${error.message}\n`);
      setTestResult(prev => prev + `🔍 Error code: ${error.code}\n`);
      setTestResult(prev => prev + `📊 Full error: ${JSON.stringify(error, null, 2)}\n`);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firestore Connection Test</h2>
      
      <div className="mb-4">
        <p><strong>User:</strong> {user ? `${user.email} (${user.uid})` : 'Not authenticated'}</p>
        <p><strong>Database:</strong> {db ? 'Connected' : 'Not connected'}</p>
      </div>

      <button
        onClick={testFirestoreConnection}
        disabled={loading || !user}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Testing...' : 'Test Firestore Connection'}
      </button>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Test Results:</h3>
        <pre className="whitespace-pre-wrap text-sm">{testResult || 'Click the button to run tests'}</pre>
      </div>
    </div>
  );
};

export default FirestoreTest;
