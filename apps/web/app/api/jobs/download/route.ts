import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import path from 'path';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
        return new NextResponse('Missing key', { status: 400 });
    }

    // Basic local file resolver.
    // We assume the key is something like "clxxxx/result.pdf" in the "./.storage" dir.
    const filePath = path.resolve(process.cwd(), '../../.storage', key);

    try {
        const stat = require('fs').statSync(filePath);

        // Convert ReadableStream for Next.js response
        const stream = createReadStream(filePath);

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
                'Content-Length': stat.size.toString(),
            }
        });

    } catch (err) {
        console.error("Local download error:", err);
        return new NextResponse('File not found', { status: 404 });
    }
}
