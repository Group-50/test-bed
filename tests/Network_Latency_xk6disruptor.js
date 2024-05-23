//Scenario : Simulating network delays and outages to test how microservices cope with reduced or no connectivity.
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import disruptor from 'k6/x/disruptor';

export let options = {
  stages: [
    { duration: '1m', target: 10 }, // ramp-up to 10 users
    { duration: '2m', target: 10 }, // stay at 10 users
    { duration: '1m', target: 20 }, // ramp-up to 20 users
    { duration: '2m', target: 20 }, // stay at 20 users
    { duration: '1m', target: 0 },  // ramp-down to 0 users
  ],
};

export default function () {
  group('Normal Operation', function () {
    let res = http.get('http://test.k6.io');
    check(res, {
      'status is 200': (r) => r.status == 200,
      'response time is < 200ms': (r) => r.timings.duration < 200,
    });
    sleep(1);
  });

  group('Introduce Network Delay', function () {
    let disrupt = disruptor.disrupt({
      target: 'test-api:8080',
      delay: '500ms', // Introduce a 500ms delay
    });

    disrupt.start();

    let res = http.get('http://test-api:8080');
    check(res, {
      'status is 200 with delay': (r) => r.status === 200,
      'response time is < 1000ms': (r) => r.timings.duration < 1000,
    });

    disrupt.stop();
    sleep(1);
  });

  group('Introduce Packet Loss', function () {
    let disrupt = disruptor.disrupt({
      target: 'test-api:8080',
      loss: '10%', // Introduce 10% packet loss
    });

    disrupt.start();

    let res = http.get('http://test-api:8080');
    check(res, {
      'status is 200 with packet loss': (r) => r.status === 200,
    });

    disrupt.stop();
    sleep(1);
  });

  group('Combined Disruptions', function () {
    let disrupt = disruptor.disrupt({
      target: 'test-api:8080',
      delay: '300ms', // Introduce a 300ms delay
      loss: '5%',     // Introduce 5% packet loss
    });

    disrupt.start();

    let res = http.get('http://test-api:8080');
    check(res, {
      'status is 200 with combined disruptions': (r) => r.status === 200,
      'response time is < 1500ms': (r) => r.timings.duration < 1500,
    });

    disrupt.stop();
    sleep(1);
  });

  group('Network Outage Simulation', function () {
    let disrupt = disruptor.disrupt({
      target: 'test-api:8080',
      delay: '200ms',  // Introduce a 200ms delay
      loss: '100%',    // Simulate a network outage
    });

    disrupt.start();

    let res = http.get('http://test-api:8080');
    check(res, {
      'status is not 200 during outage': (r) => r.status !== 200,
    });

    disrupt.stop();
    sleep(1);
  });
}


/* 
Explanation of the Script
Stages Configuration: The script defines multiple stages, ramping up and down the user load to simulate different traffic conditions.

Ramp-up to 10 users, maintain for 2 minutes, ramp-up to 20 users, maintain for 2 minutes, then ramp down to 0 users.
Test Groups:

Normal Operation: Tests the API under normal conditions to establish a baseline.
Introduce Network Delay: Introduces a 500ms network delay and checks the response.
Introduce Packet Loss: Introduces 10% packet loss and checks the response.
Combined Disruptions: Combines a 300ms delay with 5% packet loss to test more complex scenarios.
Network Outage Simulation: Simulates a complete network outage with 100% packet loss and checks the API's behavior.
Disruptor Control: Each group starts and stops the disruptor to introduce and then remove the disruptions, ensuring that each disruption type is tested in isolation and combination.

Checks: Each request includes checks to validate the status code and response time, helping identify how the service performs under different disruption scenarios.
*/
