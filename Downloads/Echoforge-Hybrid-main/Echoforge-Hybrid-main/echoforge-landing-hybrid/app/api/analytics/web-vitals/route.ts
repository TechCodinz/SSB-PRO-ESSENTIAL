import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge runtime for faster responses

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log metrics (in production, send to analytics service)
    console.log('[Web Vitals]', {
      name: body.name,
      value: body.value,
      rating: body.rating,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to your analytics service
    // Examples:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Custom analytics database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals] Error:', error);
    return NextResponse.json({ error: 'Failed to log metrics' }, { status: 500 });
  }
}
