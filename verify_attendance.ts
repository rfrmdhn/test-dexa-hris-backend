
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';

const BASE_URL = 'http://localhost:3000';
// You might need to adjust these credentials or create a seed user
const EMAIL = 'admin@dexa.com';
const PASSWORD = 'admin123';

async function main() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD,
        });
        const token = loginRes.data.data.access_token;
        console.log('   Full Login Response:', JSON.stringify(loginRes.data, null, 2));
        console.log('   Token received (first 20 chars):', token ? token.substring(0, 20) : 'null');
        const headers = { Authorization: `Bearer ${token}` };
        console.log('   Using headers:', headers);

        console.log('\n2. Checking Status (Before Clock In)...');
        const statusRes1 = await axios.get(`${BASE_URL}/attendance/my?limit=1`, { headers });
        const lastRecord1 = statusRes1.data.data[0];
        let isCheckedIn = false;

        if (lastRecord1 && !lastRecord1.checkOutTime) {
            console.log('   User is currently CHECKED IN. Cannot proceed with fresh clock-in test.');
            // Optional: Force clock out if needed, or just warn
            console.log('   Attempting to clock out to reset state...');
            await axios.post(`${BASE_URL}/attendance/check-out`, {}, { headers });
            console.log('   Force clock-out successful.');
        } else {
            console.log('   User is CHECKED OUT. Ready to test clock-in.');
        }

        console.log('\n3. Clocking In...');
        const form = new FormData();
        // Create a dummy image file if it doesn't exist
        const dummyImagePath = path.join(__dirname, 'test_selfie.jpg');
        if (!fs.existsSync(dummyImagePath)) {
            fs.writeFileSync(dummyImagePath, 'fake image content');
        }

        form.append('photo', fs.createReadStream(dummyImagePath));

        try {
            const checkInRes = await axios.post(`${BASE_URL}/attendance/check-in`, form, {
                headers: { ...headers, ...form.getHeaders() }
            });
            console.log('   Clock-In Successful:', checkInRes.data);
        } catch (error) {
            console.error('   Clock-In Failed:', error.response?.data || error.message);
        }

        console.log('\n4. Checking Status (After Clock In)...');
        const statusRes2 = await axios.get(`${BASE_URL}/attendance/my?limit=1`, { headers });
        const lastRecord2 = statusRes2.data.data[0];
        if (lastRecord2 && !lastRecord2.checkOutTime) {
            console.log('   Status Confirmed: CHECKED IN');
        } else {
            console.error('   Status Mismatch! Expected Checked In.');
        }

        console.log('\n5. Clocking Out...');
        try {
            const checkOutRes = await axios.post(`${BASE_URL}/attendance/check-out`, {}, { headers });
            console.log('   Clock-Out Successful:', checkOutRes.data);
        } catch (error) {
            console.error('   Clock-Out Failed:', error.response?.data || error.message);
        }

        console.log('\n6. Checking Status (Final)...');
        const statusRes3 = await axios.get(`${BASE_URL}/attendance/my?limit=1`, { headers });
        const lastRecord3 = statusRes3.data.data[0];
        if (lastRecord3 && lastRecord3.checkOutTime) {
            console.log('   Status Confirmed: CHECKED OUT');
        } else {
            console.error('   Status Mismatch! Expected Checked Out.');
        }

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

main();
