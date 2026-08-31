const base = 'http://localhost:3000';

async function main() {
  // 1. csrf
  const r1 = await fetch(`${base}/api/auth/csrf`);
  const c1 = await r1.json();
  let cookies = (r1.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]);
  console.log('csrfToken', c1.csrfToken);

  // 2. callback
  const r2 = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookies.join('; ') },
    body: JSON.stringify({ csrfToken: c1.csrfToken, email: 'authflow@example.com', password: '123456', redirect: 'false', json: 'true' }),
    redirect: 'manual',
  });
  cookies = cookies.concat((r2.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]));
  console.log('callback status', r2.status);
  const txt = await r2.text();
  console.log('callback body(trim)', txt.slice(0, 200));
  console.log('set-cookie after cb', r2.headers.getSetCookie?.() ?? []);

  // 3. session
  const r3 = await fetch(`${base}/api/auth/session`, { headers: { cookie: cookies.join('; ') } });
  console.log('SESSION JSON:', JSON.stringify(await r3.json()));
}
main().catch((e) => console.error('ERR', e.message));