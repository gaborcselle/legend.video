// an example Gabor copied from
// https://vercel.com/docs/functions/quickstart

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // static by default, unless reading the request
 
export function GET(request: Request) {
  const { headers } = request;
  const userAgent = headers.get('user-agent') || '';

  // get parameter "name"
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'World';

  return new Response(`Hello to ${name}! User agent: ${userAgent}, running in region ${process.env.VERCEL_REGION}`);
}
