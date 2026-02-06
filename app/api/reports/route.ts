import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Generate consolidated report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await session.getToken();
    
    if (!token) {
      console.error('Could not obtain Clerk token');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const body = await request.json();

    // Forward the request to the backend
    const response = await fetch(`${API_URL}/api/reports/generate-consolidated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}

// Get all reports
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await session.getToken();
    
    if (!token) {
      console.error('Could not obtain Clerk token');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    // Forward the request to the backend
    const response = await fetch(`${API_URL}/api/reports`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
