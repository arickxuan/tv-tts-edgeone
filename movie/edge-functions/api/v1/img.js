
export async function onRequest444(context) {
    const { request, env, next, waitUntil } = context; // next 和 waitUntil 可能需要
    const url = new URL(request.url);

    console.log(url)
    return new Response('Hello World!');
}

// OrionTV 兼容接口
export async function onRequest(context) {
    const { request, env, next, waitUntil } = context; // next 和 waitUntil 可能需要
    // const url = new URL(request.url);

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        let info = { error: 'Missing image URL' };
        return new Response(JSON.stringify(info), {
            status: 400,
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        })
    }

    try {
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                Accept: 'image/jpeg,image/png,image/gif,*/*;q=0.8',
                Referer: 'https://movie.douban.com/',
            },
        });

        if (!imageResponse.ok) {
            let info = { error: imageResponse.statusText };
            return new Response(JSON.stringify(info), { status: imageResponse.status })
        }

        const contentType = imageResponse.headers.get('content-type');

        if (!imageResponse.body) {
            return NextResponse.json(
                { error: 'Image response has no body' },
                { status: 500 }
            );
        }

        // 创建响应头
        const headers = new Headers();
        if (contentType) {
            headers.set('Content-Type', contentType);
        }

        // 设置缓存头（可选）
        headers.set('Cache-Control', 'public, max-age=15720000, s-maxage=15720000'); // 缓存半年
        headers.set('CDN-Cache-Control', 'public, s-maxage=15720000');
        headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=15720000');
        headers.set('Netlify-Vary', 'query');

        // 直接返回图片流
        return new Response(imageResponse.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        let info = { error: 'Error fetching image' };
        return new Response(JSON.stringify(info), { status: 500 })
    }
}