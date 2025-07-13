#!/usr/bin/env node

import io from 'socket.io-client';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('❌ API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🧪 Testing WebRTC server connection...\n');

// Test basic HTTP connection
async function testHttpConnection() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ HTTP health check passed');
      return true;
    } else {
      console.log('❌ HTTP health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ HTTP connection failed:', error.message);
    return false;
  }
}

// Test WebSocket connection
function testWebSocketConnection() {
  return new Promise((resolve) => {
    const socket = io(SERVER_URL, {
      auth: { apiKey: API_KEY }
    });

    const timeout = setTimeout(() => {
      console.log('❌ WebSocket connection timeout');
      socket.disconnect();
      resolve(false);
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log('✅ WebSocket connection established');
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      console.log('❌ WebSocket connection failed:', error.message);
      resolve(false);
    });
  });
}

// Run tests
async function runTests() {
  console.log('1. Testing HTTP connection...');
  const httpOk = await testHttpConnection();
  
  console.log('\n2. Testing WebSocket connection...');
  const wsOk = await testWebSocketConnection();
  
  console.log('\n📊 Test Results:');
  console.log(`   HTTP: ${httpOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   WebSocket: ${wsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (httpOk && wsOk) {
    console.log('\n🎉 All tests passed! Server is ready for WebRTC connections.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your server configuration.');
    process.exit(1);
  }
}

runTests(); 