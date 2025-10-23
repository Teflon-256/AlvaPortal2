import { RestClientV5 } from 'bybit-api';

const apiKey = process.argv[2];
const apiSecret = process.argv[3];

async function testBybitAPI() {
  try {
    console.log('🔍 Testing Bybit API connection (NO PROXY)...\n');
    
    const client = new RestClientV5({
      key: apiKey,
      secret: apiSecret,
      testnet: false,
    });
    
    // Test 1: Get account info
    console.log('Test 1: getAccountInfo()');
    const accountInfo = await client.getAccountInfo();
    if (accountInfo && accountInfo.result) {
      console.log('✅ SUCCESS - Account UID:', accountInfo.result.uid);
      console.log('   Unified Margin Status:', accountInfo.result.unifiedMarginStatus);
    }
    
    // Test 2: Get wallet balance
    console.log('\nTest 2: getWalletBalance()');
    const balance = await client.getWalletBalance({ accountType: 'UNIFIED' });
    if (balance && balance.result) {
      console.log('✅ SUCCESS - Wallet data retrieved');
      if (balance.result.list && balance.result.list[0]) {
        const totalEquity = balance.result.list[0].totalEquity;
        console.log('   Total Equity:', totalEquity, 'USD');
      }
    }
    
    console.log('\n✅✅✅ ALL TESTS PASSED!');
    console.log('API keys work perfectly WITHOUT any proxy!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

testBybitAPI();
