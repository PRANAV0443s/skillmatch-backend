const https = require('http');

async function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (data) {
      const dataStr = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log("1. Registering test user...");
  const email = `testuser_${Date.now()}@example.com`;
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Test Setup User',
    email: email,
    password: 'password123',
    role: 'STUDENT'
  });
  
  if (regRes.status !== 200) {
    console.error("Failed to register:", regRes);
    return;
  }
  
  const token = regRes.data.token;
  const userId = regRes.data.userId;
  console.log(`User created. Email: ${email}, Token: ${token.substring(0, 10)}...`);

  console.log("2. Fetching jobs...");
  const jobsRes = await request('GET', '/api/jobs', null, token);
  if (jobsRes.status !== 200 || !Array.isArray(jobsRes.data) || jobsRes.data.length === 0) {
     console.log("No jobs found or error:", jobsRes);
     // Fallback: Just trying to use a direct apply if we know jobId
     return;
  }
  
  const jobId = jobsRes.data[0].id;
  console.log(`Found job: ${jobsRes.data[0].title} (${jobId})`);
  
  console.log("3. Applying to the job (This triggers the email)...");
  // Simple Apply endpoint: /api/applications/apply?userId=...&jobId=...&email=...
  // Wait, let's check ApplicationController! I'll just use the standard one
  // I need to send multipart/form-data for /api/applications/apply with resume? 
  // Let me look at ApplicationController to be sure! Wait, let's use the explicit fast endpoint if it exists
  const applyRes = await request('POST', `/api/applications/apply-job`, {userId, jobId, email}, token);
  
  console.log("Apply response:", applyRes);
  if (applyRes.status === 200) {
      console.log("TEST SUCCESSFUL! The backend should have sent the email.");
  } else {
      console.log("TEST FAILED:", applyRes);
  }
}

run().catch(console.error);
