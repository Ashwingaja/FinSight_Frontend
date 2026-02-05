import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let token = await session.getToken();
    
    if (!token) {
      console.error('Could not obtain Clerk token');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const body = await request.json();
    const { financialDataId } = body;

    if (!financialDataId) {
      return NextResponse.json({ error: 'Financial data ID required' }, { status: 400 });
    }

    // Forward the request to the backend
    const response = await fetch(`${API_URL}/api/analysis/generate/${financialDataId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let token = await session.getToken();
    
    if (!token) {
      console.error('Could not obtain Clerk token');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const financialDataId = searchParams.get('financialDataId');

    if (!financialDataId) {
      return NextResponse.json({ error: 'Financial data ID required' }, { status: 400 });
    }

    // Forward the request to the backend
    const response = await fetch(`${API_URL}/api/analysis?financialDataId=${financialDataId}`, {
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
    console.error('Fetch analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
