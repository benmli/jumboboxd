import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import { db, usersTable } from './db/index.js';

export async function POST(request: Request) {
  console.log('DB:', db);
  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);

  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  console.log('SIGNING_SECRET exists:', !!SIGNING_SECRET);

  if (!SIGNING_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SIGNING_SECRET');
    return new Response(JSON.stringify({ error: 'Missing webhook signing secret' }), {
      status: 500,
    });
  }

  // create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // get headers
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  console.log('Svix headers:');
  console.log('- svix-id:', svix_id);
  console.log('- svix-timestamp:', svix_timestamp);
  console.log('- svix-signature:', svix_signature ? 'present' : 'missing');

  // if there are no headers, return error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers');
    return new Response(JSON.stringify({ error: 'Missing Svix headers' }), {
      status: 400,
    });
  }

  // Get body
  const payload = await request.text();
  console.log('Request body length:', payload.length);

  let evt: WebhookEvent;

  // verify payload with headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log('Webhook verification successful');
    console.log('Event type:', evt.type);
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response(JSON.stringify({ error: 'Verification error' }), {
      status: 400,
    });
  }

  // handle the user.created event
  try {
    if (evt.type === 'user.created') {
      const { id } = evt.data;
      console.log('New user created:', id);
      
      // insert user into database upon Clerk user creation
      await db.insert(usersTable).values({ id: id });
      console.log('User saved to database successfully');
      
      return new Response(JSON.stringify({ message: 'User saved to DB' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Unhandled event type:', evt.type);
    return new Response(JSON.stringify({ message: 'Unhandled event' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// export function GET() {
//   console.log('=== WEBHOOK GET ENDPOINT HIT ===');
//   return new Response('Webhook endpoint is working!', {
//     status: 200,
//     headers: { 'Content-Type': 'text/plain' }
//   });
// }
