import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// System instructions for the Nova Clinic Chatbot
const systemInstruction = `You are a helpful, empathetic, and professional AI assistant for Nova Physiotherapy Specialty Clinic (ኖቫ የፊዚዮቴራፒ ልዩ ክሊኒክ). 
You speak both Amharic and English natively. Always respond in the language the user speaks to you in.

Contact & Location Information:
- Location: Addis Ababa, Ethiopia. We are centrally located with ample patient parking in a clean and safe specialty clinic area. If the user asks for a specific sub-city or building (like Bole, Piassa, etc.), clarify that we are centrally located in Addis Ababa, and they can call for exact directions.
- Phone: +251 91 124 2443 (Call any time during working hours for rapid response)
- Working Hours: Monday - Saturday, 8:00 AM - 6:00 PM (Local time)

The clinic provides Evidence-Based Clinical Services for fast recovery:
- Orthopedic Rehabilitation (የአጥንት እና መገጣጠሚያ ማገገሚያ)
- Neurological Rehabilitation (የነርቭ ህክምና ማገገሚያ)
- Pediatric Physiotherapy (የህጻናት ፊዚዮቴራፒ)
- Sports Injury Rehabilitation (የስፖርት ጉዳት ማገገሚያ)
- Post-Operative Rehabilitation (ከቀዶ ጥገና በኋላ ማገገሚያ)
- Geriatric Rehabilitation (የአረጋውያን ማገገሚያ ሕክምና)
- Cardiopulmonary Therapy (የልብና ሳንባ ፊዚዮቴራፒ)
- Manual Therapy & mobilization (የእጅ ማኑዋል ቴራፒ)
- Vestibular & Balance Therapy (የጆሮ ውስጥ ሚዛን እና መረጋጋት)

When users want to book an appointment, you have access to a tool called 'bookAppointment'. You MUST use this tool to book their appointment directly when they provide enough information: name, phone, preferred_date, and requested_service. Ask for these details naturally if they are missing.`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is missing. Please set it in the environment." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const chatHistory = history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [
                ...chatHistory,
                { role: 'user', parts: [{ text: message }]}
            ],
            config: {
                systemInstruction: systemInstruction,
                tools: [{
                    functionDeclarations: [
                        {
                            name: "bookAppointment",
                            description: "Books an appointment for the user directly via the web3forms API.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING", description: "Full name of the patient" },
                                    phone: { type: "STRING", description: "Phone number of the patient" },
                                    email: { type: "STRING", description: "Optional email address" },
                                    preferred_date: { type: "STRING", description: "Preferred date for the appointment (e.g., YYYY-MM-DD or relative like 'tomorrow')" },
                                    requested_service: { type: "STRING", description: "The specific physiotherapy service requested" },
                                    notes: { type: "STRING", description: "Any extra notes or symptoms" }
                                },
                                required: ["name", "phone", "preferred_date", "requested_service"]
                            }
                        }
                    ]
                }]
            }
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            if (call.name === 'bookAppointment') {
                return res.json({ functionCall: call });
            }
        }

        return res.json({ response: response.text });
    } catch (error: any) {
        console.error("Gemini API Error:", error.message || error);
        res.status(500).json({ error: "Failed to process chat message.", details: error.message || String(error) });
    }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
