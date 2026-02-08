import { generateApprovalProof, isCircuitReady } from './services/zkProofService.js';

async function test() {
  console.log('\n=== ZK Proof Generation Test ===\n');
  
  console.log('1. Checking circuit files...');
  const ready = isCircuitReady();
  console.log('   Circuit ready:', ready);
  
  if (!ready) {
    console.log('   ❌ Circuit not ready - will use mock proofs');
    return;
  }
  
  console.log('\n2. Generating proof...');
  const start = Date.now();
  
  try {
    const result = await generateApprovalProof({
      walletAddress: '0xd7e975FBa8e361093CE9D63832c585f471B12803',
      eventId: '65c123456789abcdef012345',
      adminWallet: '0xd7e975FBa8e361093CE9D63832c585f471B12803'
    });
    
    const elapsed = (Date.now() - start) / 1000;
    
    console.log('\n3. Result:');
    console.log('   Time:', elapsed, 'seconds');
    console.log('   isMock:', result.isMock || false);
    console.log('   success:', result.success);
    console.log('   hasCalldata:', !!result.calldata);
    
    if (result.calldata) {
      console.log('   pA[0]:', result.calldata.pA[0].slice(0, 20) + '...');
      console.log('   pB[0][0]:', result.calldata.pB[0][0].slice(0, 20) + '...');
    }
    
    if (result.isMock) {
      console.log('\n   ⚠️ MOCK PROOF generated (not real!)');
    } else {
      console.log('\n   ✅ REAL PROOF generated successfully!');
    }
    
  } catch (error) {
    console.error('\n   ❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

test();
