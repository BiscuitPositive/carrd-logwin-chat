import fetch from 'node-fetch';

export async function handler(event) {
  const { message } = JSON.parse(event.body);
  const OPENAI_KEY = process.env.OPENAI_KEY;

  const payload = {
    model: "gpt-4o-mini",
    assistant_id: "asst_pJW6RveJzAPfMjmPyBFP1yio",
    messages: [{ role: "user", content: message }]
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const { choices } = await resp.json();
  const reply = choices?.[0]?.message?.content || "Sorry, try again.";

  return {
    statusCode: 200,
    body: JSON.stringify({ reply })
  };
}
