import fetch from 'node-fetch'; // wait, node >= 18 has built in fetch, no need to import

async function run() {
  console.log("Registering a new passenger...");
  const signupRes = await fetch('http://localhost:4001/auth/signup/passenger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "API Tester",
      username: `testuser${Math.floor(Math.random() * 10000)}`,
      password: "Password@123!"
    })
  });
  
  if (!signupRes.ok) {
    console.error("Signup failed", await signupRes.text());
    return;
  }
  
  const signupData = await signupRes.json();
  const token = signupData.token;
  console.log("Signup successful. Token:", token.substring(0, 20) + "...");

  console.log("Adding mock data...");
  const mock1 = await fetch('http://localhost:4001/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      station: "Andheri",
      line: "Red Line",
      destination: "Gundavali",
      departureTime: "09:15",
      platform: "2",
      status: "on-time",
      trainNumber: "MRS-RL-305"
    })
  });
  console.log("Added mock 1:", await mock1.text());

  const mock2 = await fetch('http://localhost:4001/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      station: "Kalyan",
      line: "Central Line",
      destination: "CSMT",
      departureTime: "09:45",
      platform: "4",
      status: "delayed",
      trainNumber: "MRS-CL-808"
    })
  });
  console.log("Added mock 2:", await mock2.text());

  console.log("Fetching schedules...");
  const schedulesRes = await fetch('http://localhost:4001/schedules', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!schedulesRes.ok) {
    console.error("Schedules fetch failed", await schedulesRes.text());
    return;
  }

  const schedulesData = await schedulesRes.json();
  console.log(`Successfully fetched schedules. Found ${schedulesData.schedules.length} schedules.`);
  console.log(JSON.stringify(schedulesData.schedules, null, 2));
}

run().catch(console.error);
