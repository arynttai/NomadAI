import { GoogleGenerativeAI } from "@google/generative-ai";

const BASE_SYSTEM_PROMPT = `You are "NomadAI", an elite global travel concierge for digital nomads. Your personality is warm, sophisticated, and genuinely passionate about travel.

Your expertise includes:
- **Remote Work Hubs**: You identify the best cities and neighborhoods for digital nomads, focusing on internet reliability and community.
- **Luxury & Boutique Stays**: Recommend stays that offer both comfort and work-friendly amenities.
- **Hidden Gems**: Go beyond tourist traps. Recommend secret beaches, local-only restaurants, and authentic cultural experiences.
- **Local Tips**: Share practical advice — navigating local transport, safety, and money-saving hacks.
- **Itineraries**: Create balanced itineraries mixing work and exploration.
- **Food & Dining**: Recommend spots with great food and, crucially, power outlets and Wi-Fi if needed.
- **Cultural Insights**: Share history and etiquette tips.

Formatting rules:
- Use markdown formatting.
- Be specific with names and places.
- If unsure, be honest.
- Keep responses organized.
- Add a nomad pro tip at the end.

Always greet returning users warmly.`;

export async function POST(req: Request) {
    try {
        const { messages, nomadMode } = await req.json();
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API key missing" }), { status: 500 });
        }

        console.log("Using Key:", apiKey.slice(0, 5));

        const genAI = new GoogleGenerativeAI(apiKey);

        // Explicitly using 'v1' and 'gemini-2.5-flash' as requested
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash" },
            { apiVersion: "v1" }
        );

        let systemInstruction = BASE_SYSTEM_PROMPT;

        let initialResponse = "Understood! I'm NomadAI. I'll help you explore the world.";

        if (nomadMode) {
            systemInstruction += `\n\n[NOMAD MODE ACTIVATED]
Your responses must proactively address digital nomad needs:
1. **Connectivity**: ALWAYS ask about or mention Wi-Fi speeds/reliability for every location.
2. **Workspaces**: Prioritize co-working spaces, cafes with good ergonomics, and "laptop-friendly" policies.
3. **Accommodation**: Suggest places suitable for long stays (kitchens, desks) and mention monthly discounts if applicable.
4. **Community**: Highlight expat/nomad meetups and social hubs.
5. **Proactive Questions**: Ask the user about their budget, preferred work hours, and work-life balance style (e.g., "Do you prefer a quiet focus zone or a buzzing social cafe?").
`;
            initialResponse = "Understood! I'm NomadAI. I've activated Nomad Mode and will prioritize connectivity, workspaces, and long-stay suitability for your travels.";
        }

        // Inject system prompt into history as v1 doesn't support systemInstruction
        const history = [
            {
                role: "user",
                parts: [{ text: systemInstruction }]
            },
            {
                role: "model",
                parts: [{ text: initialResponse }]
            },
            ...messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }]
            }))
        ];

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;

        const result = await chat.sendMessageStream(lastMessage);
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (err) {
                    console.error("Stream error:", err);
                    controller.error(err);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });

    } catch (error: any) {
        // Fallback: Log exact status code if available
        if (error.status) {
            console.error(`API Request Failed with Status Code: ${error.status}`);
        } else if (error.response?.status) {
            console.error(`API Request Failed with Status Code: ${error.response.status}`);
        }

        console.error("DEBUG_ERROR:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
