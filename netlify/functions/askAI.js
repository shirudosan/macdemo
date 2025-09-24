// netlify/functions/askAI.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
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

    // Hugging Face sometimes returns an array, sometimes an object
    let output = "";

    if (Array.isArray(result)) {
      // e.g., [{"generated_text": "blah"}]
      output = result[0]?.generated_text || JSON.stringify(result);
    } else if (result.generated_text) {
      output = result.generated_text;
    } else if (result[0]?.summary_text) {
      // some summarization models
      output = result[0].summary_text;
    } else {
      output = JSON.stringify(result, null, 2);
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
