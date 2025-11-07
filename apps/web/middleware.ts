import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function middleware(request: NextRequest) {
    const token = request.headers.get('Authorization');
    
    const protectedPaths = ['/api/submission', '/api/fetchSubmissions', '/api/run', '/api/violation', '/api/violation/disqualification'];
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
    
    if (isProtected) {
        console.log('Middleware triggered for:', request.nextUrl.pathname);
        console.log('Authorization header:', token ? 'Present' : 'Missing');
        
        if (!token) {
            console.log('No token provided');
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }

        try {
            const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
            
            
            const { payload } = await jwtVerify(cleanToken, secret);
           
            
            if (!payload.userId) {
                console.log('No userId in payload');
                return NextResponse.json(
                    { error: 'Invalid token structure' },
                    { status: 401 }
                );
            }

            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', payload.userId.toString());
          

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (error) {
            console.error('JWT verification error:', error);
            console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
            
            return NextResponse.json(
                { 
                    error: 'Invalid token',
                    details: error instanceof Error ? error.message : 'Unknown error'
                },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/submission/:path*',
        '/api/fetchSubmissions/:path*',
        '/api/run/:path*',
        '/api/violation/:path*',
        '/api/violation/disqualification/:path*',
    ],
};