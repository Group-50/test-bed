import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 100 },  // ramp up to 100 users
        { duration: '2m', target: 100 },  // stay at 100 users for 5 minutes
        { duration: '2m', target: 0 },    // scale down. Recovery stage.
    ],
};

export default function () {
    let res = http.get('https://run.mocky.io/v3/7d123e13-87cf-4bc0-a960-214dfe5a8eb6');

    check(res, {
        "response code was 200": (res) => res.status == 200,  // Check if response status is 200
    });

    sleep(1);
}
