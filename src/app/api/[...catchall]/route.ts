import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    
    // Log malformed requests for debugging
    console.log('Caught malformed API request:', {
        pathname: url.pathname,
        search: url.search,
        fullUrl: req.url
    });
    
    // Check if this looks like a malformed AWS request
    if (url.pathname.includes('awp=') || url.search.includes('awp=')) {
        console.log('This appears to be a malformed AWS API request');
        
        // Try to extract the filename and redirect to proper AWS endpoint
        const awpMatch = req.url.match(/awp=([^&]*)/);
        if (awpMatch) {
            const filename = decodeURIComponent(awpMatch[1]);
            console.log('Extracted filename from malformed request:', filename);
            
            // Redirect to proper AWS endpoint
            const properUrl = new URL('/api/aws', url.origin);
            properUrl.searchParams.set('key_data', filename);
            
            console.log('Redirecting to proper AWS URL:', properUrl.toString());
            return NextResponse.redirect(properUrl.toString());
        }
    }
    
    return NextResponse.json(
        { 
            error: 'API endpoint not found',
            requestedUrl: req.url,
            suggestion: 'Check the API endpoint format'
        },
        { status: 404 }
    );
}

export async function POST(req: NextRequest) {
    return GET(req); // Handle POST requests the same way
}