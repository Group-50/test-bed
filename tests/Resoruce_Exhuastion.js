//Scenario: Resource Exhaustion, such as CPU or memory saturation, to evaluate the system’s response under extreme stress and usage.
import http from 'k6/http';
import { sleep, check } from 'k6';
import disruptor from 'k6/x/disruptor'; // Import the disruptor extension

export let options = {
    stages: [
        { duration: '1m', target: 10 }, // ramp up to 10 users
        { duration: '3m', target: 50 }, // stay at 50 users for 3 minutes
        { duration: '1m', target: 0 },  // ramp down to 0 users
    ],
};

// Defining the disruptor
const cpuDisruptor = disruptor.CPU({
    load: 80, // 80% CPU load
    duration: '3m', // for 3 minutes
});
const memoryDisruptor = disruptor.Memory({
    size: '256MB', // 256MB memory allocation
    duration: '3m', // 3 minutes
});

export default function () {
    // Start CPU and Memory disruptors
    if (__VU === 1 && __ITER === 0) {
        cpuDisruptor.start();
        memoryDisruptor.start();
    }

    // Perform usual load testing tasks
    let res = http.get('http://test.k6.io');
    check(res, {
        'is status 200': (r) => r.status === 200,
        'has products': (r) => r.json().length > 0,
    });

    sleep(Math.random() * 2);

    let orderPayload = JSON.stringify({
        product_id: res.json()[0].id,
        quantity: 1,
    });
    let headers = { 'Content-Type': 'application/json' };
    res = http.post('https://api.example.com/api/orders', orderPayload, { headers: headers });
    check(res, {
        'is status 201': (r) => r.status === 201,
        'order created': (r) => r.json().id !== undefined,
    });

    sleep(Math.random() * 2);

    // Stop CPU and Memory disruptors
    if (__VU === 1 && __ITER === 5) {
        cpuDisruptor.stop();
        memoryDisruptor.stop();
    }
}

/*Disruptor Configuration: The disruptor is configured to create 80% CPU load and allocate 256MB of memory for a duration of 3 minutes.
VU (Virtual Users): The disruptor starts and stops only once, using the condition __VU === 1 && __ITER === 0 to ensure it runs only once at the start, and __VU === 1 && __ITER === 5 to stop it.
Load Testing Tasks: The script performs typical load testing tasks by making HTTP requests to the specified endpoints and checking the responses.s */
