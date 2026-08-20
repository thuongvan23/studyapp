// Vercel Serverless Function — proxy tới Gemini API.
// Key thật chỉ nằm ở đây (đọc từ Environment Variable trên server), KHÔNG bao giờ
// gửi xuống trình duyệt, nên không thể bị lộ qua GitHub/Network tab.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server thiếu GEMINI_API_KEY (đặt trong Vercel Environment Variables).' });
    return;
  }

  const { model, body } = req.body || {};
  if (!model || !body) {
    res.status(400).json({ error: 'Thiếu model hoặc body trong request.' });
    return;
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Gọi Gemini API thất bại.', detail: String(e) });
  }
};
