// netlify/functions/askAI.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const result = await response.json();

    // For debugging: return full result
    return {
      statusCode: 200,
      body: JSON.stringify({ raw: result })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
