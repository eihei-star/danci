const base = 'http://localhost:3000';

async function csrf(cookie) {
  const r = await fetch(`${base}/api/auth/csrf`, { headers: cookie ? { cookie: cookie.join('; ') } : {} });
  const body = await r.json();
  const set = r.headers.getSetCookie?.() ?? [];
  return { body, set };
}

async function main() {
  // step 1: csrf + cookie
  let { body, set } = await csrf([]);
  console.log('csrf1', body.csrfToken, 'cookies', set);
  let cookies = set.map((c) => c.split(';')[0]);
  // step 2: csrf again with cookie (narrow env) then callback
  let { body: csrf2, set: set2 } = await csrf(cookies);
  cookies = cookies.concat(set2.map((c) => c.split(';')[0]));
  console.log('csrf2', csrf2.csrfToken);

  const r = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookies.join('; ') },
    body: JSON.stringify({ csrfToken: csrf2.csrfToken, email: 'authflow@example.com', password: '123456', redirect: false, json: true }),
  });
  console.log('callback status', r.status);
  console.log('callback text', (await r.text()).slice(0, 400));
}
main().catch((e) => console.error('ERR', e.message));