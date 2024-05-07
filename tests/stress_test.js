import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    },
};

export default function () {
    // Using 'URL' environmental variable for the URL
    const url = __ENV.URL || 'https://jsonplaceholder.typicode.com/posts/1';
    const response = http.get(url);

    check(response, {
        'is status 200': (response) => response.status == 200,
        'response time is less than 200ms': (response) => response.timings.duration < 200,
    });

    sleep(1);
}
