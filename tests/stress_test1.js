import http from 'k6/http';
import { sleep, check } from 'k6';

export default function () {
    let response = http.get('http://test.k6.io/');
    check(response, {
        'status is 200': (response) => response.status === 200
    });
    sleep(1);
}
