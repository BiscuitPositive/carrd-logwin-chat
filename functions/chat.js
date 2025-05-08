import fetch from 'node-fetch';

export async function handler(event) {
  // 1️⃣ Handle CORS pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  // 2️⃣ Parse the incoming JSON safely
  let message;
  try {
    ({ message } = JSON.parse(event.body));
  } catch (err) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: 'Invalid JSON payload.' })
    };
  }

  // 3️⃣ Call the OpenAI API
  const OPENAI_KEY = process.env.OPENAI_KEY;
  let reply = 'Sorry, something went wrong.';
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        assistant_id: 'asst_pJW8RveJzAPFhjMpByFP1yio',
        messages: [{ role: 'user', content: message }]
      })
    });
    const data = await resp.json();
    reply = data.choices?.[0]?.message?.content ?? reply;
  } catch (err) {
    console.error('OpenAI error:', err);
  }

  // 4️⃣ Return with CORS header
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ reply })
  };
}
