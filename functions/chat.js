import fetch from 'node-fetch';

export async function handler(event) {
  // 1) CORS pre‐flight  
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

  // 2) Parse the incoming JSON  
  let message;
  try {
    ({ message } = JSON.parse(event.body));
  } catch {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ reply: '❌ Invalid JSON payload.' })
    };
  }

  // 3) Check for your OpenAI key  
  const OPENAI_KEY = process.env.OPENAI_KEY;
  if (!OPENAI_KEY) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ reply: '❌ Missing OpenAI key.' })
    };
  }

  // 4) Call the Assistant endpoint (note the `/chat/completions` path)
  const assistantId = 'asst_pJW6RveJzAPFMjmPyBFP1yio';  // your exact ID
  let reply;
  try {
    const resp = await fetch(
      `https://api.openai.com/v1/assistants/${assistantId}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
      }
    );
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || resp.statusText);
    reply = data.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI call failed:', err);
    reply = `❌ OpenAI error: ${err.message}`;
  }

  // 5) Return with CORS & JSON headers  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ reply })
  };
}
