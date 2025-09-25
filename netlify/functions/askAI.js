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
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7
          }
        })
      }
    );

    const result = await response.json();

    // --- Robust parsing ---
    let output = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      output = result[0].generated_text;
    } else if (result.error) {
      output = "Error from Hugging Face: " + result.error;
    } else {
      output = JSON.stringify(result, null, 2);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ output, raw: result })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
