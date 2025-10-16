// /app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Aryan Portfolio <onboarding@resend.dev>', // Replace with verified domain later
      to: process.env.EMAIL_RECIPIENT!,
      subject: `New Contact: ${name}`,
      replyTo: email,

      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    if (data.error) {
      throw new Error(data.error.message);
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Resend error:', error.message);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
