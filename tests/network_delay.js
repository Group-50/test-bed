import http from 'k6/http';
import { sleep, check } from 'k6';
import { Network } from 'k6/x/network'; // need to use an extension

export let options = {
    stages: [
        { duration: '2m', target: 100 }, // ramp up to 100 users
        { duration: '5m', target: 100 }, // stay at 100 users
        { duration: '2m', target: 0 },   // ramp down to 0 users
    ],
};

export default function () {
    // Simulate network delay
    Network.simulateDelay('200ms');

    // Make a request to the microservice
    let res = http.get('http://your.microservice.endpoint/');

    // Check for successful response
    check(res, {
        'is status 200': (res) => res.status === 200,
    });

    // Optionally simulating a network outage
    if (__ITER % 20 === 0) { // every 20 iterations, simulate an outage
        Network.simulateOutage('10s'); // 10 seconds of outage
    }

    sleep(1);
}
