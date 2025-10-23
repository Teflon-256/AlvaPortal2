import { RestClientV5 } from 'bybit-api';
import https from 'https';

const apiKey = process.argv[2];
const apiSecret = process.argv[3];

console.log('📊 Diagnostic Information:');
console.log('API Key (first 6 chars):', apiKey.substring(0, 6) + '...');
console.log('API Key length:', apiKey.length);
console.log('Secret length:', apiSecret.length);
console.log('\n🌐 Testing network connectivity to Bybit...');

// Test direct HTTPS request
const options = {
  hostname: 'api.bybit.com',
  port: 443,
  path: '/v5/market/time',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Network connection to Bybit: OK');
    console.log('Response:', data);
    
    // Now test with API key
    testWithAPIKey();
  });
});

req.on('error', (e) => {
  console.error('❌ Network error:', e.message);
  process.exit(1);
});

req.end();

async function testWithAPIKey() {
  try {
    console.log('\n🔐 Testing with API credentials...');
    
    const client = new RestClientV5({
      key: apiKey,
      secret: apiSecret,
      testnet: false,
    });
    
    const result = await client.getAccountInfo();
    console.log('✅ API Authentication: SUCCESS');
    console.log('Account UID:', result.result?.uid);
    
  } catch (error) {
    console.error('\n❌ API Authentication FAILED');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. API key has IP restriction enabled (must be set to "No IP restriction")');
    console.error('2. API key permissions are incorrect (needs "Read-Write" + "Unified Trading")');
    console.error('3. API key is invalid or expired');
    
    if (error.response) {
      console.error('\nAPI Response:', error.response);
    }
  }
}
