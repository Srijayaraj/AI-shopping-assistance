import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Ensure Gemini API key is present
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY environment variable is not set. Chatbot queries may fail.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for conversational shopping assistant
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, currentProduct, cart, orders, catalog } = req.body;

      if (!apiKey) {
        return res.status(500).json({
          error: 'Gemini API key is missing. Please add it to Secrets in the Settings menu.'
        });
      }

      // Format chat messages for @google/genai format
      // In the @google/genai SDK, chat contents are defined as a list of roles and parts
      const systemInstruction = `You are "Aria", a brilliant and helpful Conversational AI Shopping Assistant for "AI Shopping Assistant" e-commerce web app (similar in scale and premium polish to Amazon and Flipkart).
Your voice is friendly, objective, professional, and knowledgeable. Do not use flowery marketing jargon or make up fake facts.

Here is the current official e-commerce Product Catalog:
${JSON.stringify(catalog || [], null, 2)}

User Account Details:
- Name: Mohana Siva
- Email: mohanasiva95@gmail.com
- Saved Addresses: Flat 402, Sunshine Heights, Jubilee Hills, Hyderabad and Mindspace IT Park, Hyderabad.

User Order History:
${JSON.stringify(orders || [], null, 2)}

Context:
- Current product user is viewing right now: ${currentProduct ? JSON.stringify(currentProduct) : 'None (Browsing or on Home screen)'}
- User's active shopping cart items: ${cart ? JSON.stringify(cart) : 'Empty'}

Capabilities:
1. Recommend actual products from our catalog. You must match the catalog product 'id' EXACTLY (e.g., 'p1' for iPhone 15, 'p2' for Galaxy S24).
2. Answer product questions, explain specifications (like RAM/ROM, camera MP, battery life, direct drive washing machines) in simple terms.
3. Compare up to 4 products side by side.
4. Summarize customer reviews (likes, dislikes, verified purchase feedback) for any catalog product.
5. Track order status (e.g. "Where is my order ORD-12345?") based on the User Order History.
6. Suggest special deals, active discounts, and promo codes (like SMARTSHOP10, AIPOWERED, FREESHIP).
7. Take actions in the application! You can trigger navigation, filter products, or add products to cart.

Actions mapping:
- If the user wants to compare specific products, or if you suggest comparing them, set the action field to:
  { "type": "compare_products", "payload": { "productIds": ["p1", "p2"] } }
- If the user wants to navigate to a specific product detail page, set action to:
  { "type": "navigate", "payload": { "screen": "product", "productId": "p1" } }
- If the user wants to navigate to other screens: 'home', 'products', 'cart', 'orders', 'profile', 'wishlist', set action to:
  { "type": "navigate", "payload": { "screen": "cart" } } (or screen: "orders", "products", etc.)
- If the user wants to filter products (e.g., "Show me smartphones under 50,000" or "Filter by Apple brand"), set action to:
  { "type": "apply_filter", "payload": { "category": "Mobiles", "maxPrice": 50000, "brands": ["Apple"] } }
- If the user says "Add iPhone 15 to cart" or wants to buy a recommended product, set action to:
  { "type": "add_to_cart", "payload": { "productId": "p1" } }

Rule on format: You MUST return a JSON object that adheres to the requested schema. Ensure the conversational response text is in the 'text' key. Include any relevant products from the catalog in the 'products' array, and any triggered actions in the 'action' key.`;

      const contents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'The conversational response message in markdown. Be helpful, comprehensive yet clear, and polite.'
              },
              products: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { id: { type: Type.STRING } } },
                description: 'Array of products that are highly relevant to the discussion. Must have a valid "id" matching the catalog.'
              },
              action: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'The type of action to take in the app: "navigate" | "apply_filter" | "add_to_cart" | "compare_products"'
                  },
                  payload: {
                    type: Type.OBJECT,
                    properties: {
                      screen: {
                        type: Type.STRING,
                        description: 'Screen to navigate to: "home" | "products" | "product" | "cart" | "orders" | "profile" | "wishlist" | "comparison"'
                      },
                      productId: { type: Type.STRING, description: 'Product ID for navigate or add_to_cart' },
                      productIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of product IDs for comparison' },
                      category: { type: Type.STRING, description: 'Category for apply_filter' },
                      maxPrice: { type: Type.NUMBER, description: 'Max price for apply_filter' },
                      brands: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Brands list for apply_filter' }
                    }
                  }
                }
              }
            },
            required: ['text']
          }
        }
      });

      const responseText = response.text || '{}';
      try {
        const parsedResponse = JSON.parse(responseText.trim());
        res.json(parsedResponse);
      } catch (parseErr) {
        console.error('Failed to parse Gemini response as JSON:', responseText, parseErr);
        res.json({ text: responseText });
      }
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      res.status(500).json({ error: err.message || 'An error occurred during conversational retrieval.' });
    }
  });

  // Serve static files / Vite asset bundling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Shopping Assistant Server is running on http://localhost:${PORT}`);
  });
}

startServer();
