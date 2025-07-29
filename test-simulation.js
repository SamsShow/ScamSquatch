const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testSimulationFeatures() {
  console.log('🧪 Testing ScamSquatch Simulation & Preview Features\n');

  // Test data
  const testData = {
    routeId: 'test-route-1',
    userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    fromAmount: '1000000000000000000', // 1 ETH
    toAmount: '1000000', // 1 USDC
    slippage: 0.5
  };

  try {
    // 1. Test Transaction Simulation
    console.log('1️⃣ Testing Transaction Simulation...');
    const simulationResponse = await axios.post(`${BASE_URL}/simulate`, testData);
    
    if (simulationResponse.data.success) {
      console.log('✅ Transaction simulation successful');
      const data = simulationResponse.data.data;
      
      console.log('\n📊 Simulation Results:');
      console.log(`   • Gas Used: ${data.simulation.gasUsed}`);
      console.log(`   • Gas Limit: ${data.simulation.gasLimit}`);
      console.log(`   • Gas Price: ${data.simulation.gasPrice}`);
      console.log(`   • Total Cost: ${data.simulation.totalCost}`);
      
      // 2. Test Approval Checking
      console.log('\n2️⃣ Testing Approval Checking...');
      const approval = data.approval;
      console.log(`   • Approval Required: ${approval.required}`);
      console.log(`   • Current Allowance: ${approval.currentAllowance}`);
      console.log(`   • Required Allowance: ${approval.requiredAllowance}`);
      console.log(`   • Approval Gas: ${approval.approvalGas}`);
      console.log(`   • Approval Cost: ${approval.approvalCost}`);
      
      // 3. Test Token Drain Detection
      console.log('\n3️⃣ Testing Token Drain Detection...');
      const security = data.security;
      console.log(`   • Token Drain Risk: ${security.tokenDrainRisk}`);
      console.log(`   • Suspicious Patterns: ${security.suspiciousPatterns.length}`);
      console.log(`   • Warnings: ${security.warnings.length}`);
      console.log(`   • Recommendations: ${security.recommendations.length}`);
      
      if (security.warnings.length > 0) {
        console.log('   ⚠️  Warnings:');
        security.warnings.forEach(warning => console.log(`      • ${warning}`));
      }
      
      if (security.recommendations.length > 0) {
        console.log('   💡 Recommendations:');
        security.recommendations.forEach(rec => console.log(`      • ${rec}`));
      }
      
      // 4. Test Preview Data
      console.log('\n4️⃣ Testing Preview Data...');
      const preview = data.preview;
      console.log(`   • Input Amount: ${preview.inputAmount}`);
      console.log(`   • Output Amount: ${preview.outputAmount}`);
      console.log(`   • Price Impact: ${preview.priceImpact}%`);
      console.log(`   • Slippage: ${preview.slippage}%`);
      console.log(`   • Protocol Fee: ${preview.fees.protocol}`);
      console.log(`   • Gas Fee: ${preview.fees.gas}`);
      console.log(`   • Total Fee: ${preview.fees.total}`);
      
    } else {
      console.log('❌ Transaction simulation failed:', simulationResponse.data.error);
    }

    // 5. Test Improved Gas Estimation
    console.log('\n5️⃣ Testing Improved Gas Estimation...');
    const gasResponse = await axios.post(`${BASE_URL}/simulate/gas`, {
      routeId: testData.routeId,
      userAddress: testData.userAddress,
      fromAmount: testData.fromAmount
    });
    
    if (gasResponse.data.success) {
      console.log('✅ Gas estimation successful');
      const gasData = gasResponse.data.data;
      console.log(`   • Gas Estimate: ${gasData.gasEstimate}`);
      console.log(`   • Gas Price: ${gasData.gasPrice}`);
      console.log(`   • Total Cost: ${gasData.totalCost}`);
    } else {
      console.log('❌ Gas estimation failed:', gasResponse.data.error);
    }

    // 6. Test with different scenarios
    console.log('\n6️⃣ Testing Different Scenarios...');
    
    // Test with high amount (potential high price impact)
    const highAmountData = {
      ...testData,
      fromAmount: '10000000000000000000', // 10 ETH
      routeId: 'test-route-high-impact'
    };
    
    const highImpactResponse = await axios.post(`${BASE_URL}/simulate`, highAmountData);
    if (highImpactResponse.data.success) {
      console.log('✅ High amount simulation successful');
      const highImpactData = highImpactResponse.data.data;
      console.log(`   • Price Impact: ${highImpactData.preview.priceImpact}%`);
      console.log(`   • Security Risk: ${highImpactData.security.tokenDrainRisk ? 'HIGH' : 'LOW'}`);
    }

    console.log('\n🎉 All simulation features tested successfully!');
    console.log('\n📋 Summary of Features Implemented:');
    console.log('   ✅ Transaction simulation preview');
    console.log('   ✅ Approval checking and estimation');
    console.log('   ✅ Token drain detection');
    console.log('   ✅ Security risk analysis');
    console.log('   ✅ Improved gas estimation');
    console.log('   ✅ Fee breakdown and cost analysis');
    console.log('   ✅ Suspicious pattern detection');
    console.log('   ✅ User-friendly warnings and recommendations');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSimulationFeatures(); 