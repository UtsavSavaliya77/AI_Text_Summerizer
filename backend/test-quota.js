import dotenv from 'dotenv';
dotenv.config({ override: true });

const apiKey = process.env.GROQ_API_KEY;
console.log('Testing Groq key:', apiKey ? apiKey.substring(0, 15) + '...' : 'NOT SET ❌');

if (!apiKey || apiKey === 'your_groq_api_key_here') {
  console.error('❌ GROQ_API_KEY is not set in .env');
  console.error('   Get your free key at: https://console.groq.com/keys');
  process.exit(1);
}

const models = [
  'llama-3.3-70b-versatile',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
];

for (const model of models) {
  try {
    console.log(`\nTesting model: ${model}...`);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: "Respond with exactly the word 'OK'" }],
        max_tokens: 5,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`  ❌ Failed (${response.status}): ${err}`);
    } else {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      console.log(`  ✅ Success! Response: ${text}`);
    }
  } catch (err) {
    console.error(`  ❌ Network error: ${err.message || err}`);
  }
}
