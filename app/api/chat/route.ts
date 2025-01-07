import { generateText } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';

const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, environmentData } = await req.json();

    const systemPrompt = `You are an agricultural expert AI assistant. You will receive environmental data including weather conditions, air quality, forecast, and soil information. Based on this data, provide detailed recommendations for the most suitable crops that can be planted at that location.

Your response should use Markdown formatting and follow this structure:

Based on the provided data, analyzing the suitability of various crops in the given location.

## Weather Analysis
*Provide a brief analysis of the weather conditions*

## Air Quality Analysis
*Analyze the air quality indices and their potential impact on crops*

## Soil Analysis
*Analyze the soil data and its implications for crop growth*

## Crop Suitability
### Recommended Crops:
- **Crop 1**: [explanation]
- **Crop 2**: [explanation]
- **Crop 3**: [explanation]

## Challenges and Recommendations
### Potential Challenges:
- Challenge 1
- Challenge 2

### Recommendations:
1. First recommendation
2. Second recommendation
3. Third recommendation

Remember to consider all aspects of the provided data, including temperature, humidity, air quality, soil composition, and forecast. Tailor your recommendations to the specific conditions of the location.

Current environmental data: ${JSON.stringify(environmentData)}`;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      messages,
      system: systemPrompt,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Error processing chat request', { status: 500 });
  }
}

