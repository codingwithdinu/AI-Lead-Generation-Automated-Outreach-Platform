const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}
