const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Health', 'Other'];

// POST /api/ai/parse-expense
exports.parseExpense = async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ message: 'rawText is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expense-parsing assistant. Extract structured data from this spoken sentence about a personal expense.

Sentence: "${rawText}"

Today's date is: ${new Date().toISOString()}

Return ONLY a raw JSON object, no markdown, no code fences, no explanation, in exactly this shape:
{
  "amount": <number>,
  "category": <one of: ${CATEGORIES.join(', ')}>,
  "description": <short string, what the expense was for>,
  "date": <ISO 8601 date string>
}

Rules:
- If no date/time is mentioned in the sentence, use today's date (given above).
- "category" must be exactly one of the listed options — pick the closest match.
- "amount" must be a plain number, no currency symbols.
- If the sentence does not describe a valid expense at all, return {"error": "not_an_expense"} instead.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // strip accidental markdown fences, just in case
    const cleaned = responseText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(422).json({ message: 'Could not parse AI response', raw: responseText });
    }

    if (parsed.error) {
      return res.status(422).json({ message: "Couldn't understand that as an expense" });
    }

    // basic validation before trusting it
    if (typeof parsed.amount !== 'number' || !parsed.category || !parsed.date) {
      return res.status(422).json({ message: 'AI response missing required fields', raw: parsed });
    }

    res.json({
      amount: parsed.amount,
      category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Other',
      description: parsed.description || '',
      date: parsed.date,
      rawText,
    });
  } catch (err) {
    console.error('Gemini parse error:', err);
    if (err.status === 429) {
    return res.status(429).json({ message: 'Jervis is a bit busy right now — please try again in a moment.' });
  }
    res.status(500).json({ message: 'AI parsing failed', error: err.message });
  }
};