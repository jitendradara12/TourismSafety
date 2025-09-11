import { connect } from 'mqtt';

const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
const client = connect(url);

client.on('connect', () => {
  console.log('IoT Gateway connected to', url);
  client.subscribe('iot/+/telemetry');
  client.subscribe('iot/+/event');
});

client.on('message', (topic, payload) => {
  try {
    const msg = JSON.parse(String(payload));
    console.log('MQTT', topic, msg);
    // TODO: validate & forward to Kafka
  } catch (e) {
    console.error('Invalid MQTT message', e);
  }
});
