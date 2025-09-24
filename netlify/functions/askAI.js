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
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,  // set this in Netlify env vars
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,   // limit length so it returns quickly
            temperature: 0.7       // creativity vs determinism
          }
        })
      }
    );

    const result = await response.json();

    let output = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      output = result[0].generated_text;
    } else {
      output = JSON.stringify(result, null, 2); // fallback for debugging
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ output })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
