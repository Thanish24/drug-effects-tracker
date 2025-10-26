// Test current Groq models
require('dotenv').config();
const OpenAI = require('openai');

async function testCurrentGroqModels() {
  console.log('🧪 Testing Current Groq Models...\n');
  
  if (!process.env.GROQ_API_KEY || 
      process.env.GROQ_API_KEY === 'your_groq_api_key_here' || 
      process.env.GROQ_API_KEY === 'skip_llm_features') {
    console.log('❌ Groq API key not configured');
    console.log('Please add GROQ_API_KEY=your_key_here to your .env file');
    return;
  }
  
  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
  
  // Current available models (as of 2024)
  const models = [
    'llama-3.1-8b-instant',      // Fast, efficient
    'llama-3.1-70b-versatile',   // More powerful
    'mixtral-8x7b-32768',        // Balanced
    'gemma-7b-it'                // Google's model
  ];
  
  console.log('🔍 Testing available models...\n');
  
  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const startTime = Date.now();
      
      const response = await groq.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: "Analyze this side effect: 'Severe dry cough'. Rate concern level and urgency."
          }
        ],
        max_tokens: 100,
        temperature: 0.1
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`✅ ${model} - ${responseTime}ms`);
      console.log(`   Response: ${response.choices[0].message.content.substring(0, 100)}...`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${model} - Error: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎉 Model testing complete!');
  console.log('\nRecommended models:');
  console.log('• llama-3.1-8b-instant - Fastest, cheapest');
  console.log('• llama-3.1-70b-versatile - Most powerful');
  console.log('• mixtral-8x7b-32768 - Good balance');
}

testCurrentGroqModels().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
