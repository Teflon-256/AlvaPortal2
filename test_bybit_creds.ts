import { RestClientV5 } from 'bybit-api';

const apiKey = 'QIaaqxpk4yKRztyRc1';
const apiSecret = 'hv5q93qF0IXBLuVEVzcra48tKSJ1mu54orE';

console.log('Testing Bybit API credentials...');
console.log('API Key:', apiKey);
console.log('API Secret length:', apiSecret.length);

const client = new RestClientV5({
  key: apiKey,
  secret: apiSecret,
  testnet: false,
});

async function test() {
  try {
    console.log('\nTesting wallet balance...');
    const response = await client.getWalletBalance({ accountType: 'UNIFIED' });
    console.log('SUCCESS! Response:', JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error('ERROR:', error.message);
    console.error('Error code:', error.code);
    console.error('Error body:', error.body);
    console.error('Response data:', error.response?.data);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

test();
