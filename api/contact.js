export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message, company } = req.body || {};

  // Honeypot field - bots fill every field, real users never see/fill "company"
  if (company) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Pro Clean and Renovations Website <quotes@procleanandrenovations.co.nz>',
        to: ['procleanrenovations@gmail.com'],
        reply_to: email,
        subject: `New Quote Request from ${name}`,
        text: `New quote request from the website contact form.

Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service || 'Not specified'}

Scope of Work:
${message}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend error:', errText);
      return res.status(502).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
