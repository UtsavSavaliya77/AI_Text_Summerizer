import { createInterface } from "readline";

// Utility script to list available OpenAI models
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY environment variable is not set.");
  process.exit(1);
}

const response = await fetch("https://api.openai.com/v1/models", {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

if (!response.ok) {
  const error = await response.text();
  console.error(`❌ OpenAI API error ${response.status}:`, error);
  process.exit(1);
}

const data = await response.json();
const models = data.data.map((m) => m.id).sort();
console.log("✅ Available OpenAI Models:\n");
models.forEach((id) => console.log(" -", id));