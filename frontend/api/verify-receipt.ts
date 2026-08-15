import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType, billType, expectedAmount } = req.body as {
    imageBase64: string;
    mimeType: string;
    billType: string;
    expectedAmount: number;
  };

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp') || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `You are verifying a payment receipt for a remittance app used by OFWs (Overseas Filipino Workers) sending money to family in the Philippines.

Bill type: ${billType}
Expected amount: ₱${expectedAmount?.toLocaleString() ?? 'unknown'}

Please verify this receipt image and respond with ONLY a JSON object in this exact format:
{
  "verified": true or false,
  "confidence": "high" | "medium" | "low",
  "amountFound": number or null,
  "billTypeMatch": true or false,
  "reason": "one sentence explanation"
}

Be lenient — if the receipt is legitimate and the amount is within 10% of expected, mark as verified.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(200).json({ verified: false, confidence: 'low', reason: 'Could not parse receipt' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Receipt verification error:', err);
    return res.status(500).json({ error: 'Verification failed', verified: false });
  }
}
