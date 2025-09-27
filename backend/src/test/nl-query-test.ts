import { NLQueryAgent } from '../agents/NLQueryAgent';

// Simple test script for the Natural Language Query Agent
async function testNLQueryAgent() {
  const agent = new NLQueryAgent();
  
  console.log('🧪 Testing Natural Language Query Agent...\n');
  
  // Test queries
  const testQueries = [
    "Show my dining expenses",
    "Compare my spending by category",
    "How much did I spend at Starbucks?",
    "Show my shopping trends over time",
    "What are my top spending categories?",
    "Display my transportation costs",
    "Show my spending breakdown for last month"
  ];
  
  for (const query of testQueries) {
    console.log(`📝 Testing query: "${query}"`);
    
    try {
      // Parse the query
      const intent = await agent.parseQuery(query, 'test-user-id');
      console.log(`   ✅ Intent parsed successfully`);
      console.log(`   📊 Chart Type: ${intent.chartType}`);
      console.log(`   🎯 Type: ${intent.type}`);
      console.log(`   📈 Title: ${intent.title}`);
      console.log(`   🔍 Filters:`, intent.filters);
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error parsing query: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('✅ Natural Language Query Agent test completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testNLQueryAgent().catch(console.error);
}

export { testNLQueryAgent };
