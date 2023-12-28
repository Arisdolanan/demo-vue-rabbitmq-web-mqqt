<template>
  <div class="about">
    <h1>This is an about page</h1>
    <p v-if="connected" style="color: aquamarine">Connected to MQTT Broker!</p>
    <p v-else style="color: red">Not connected to MQTT Broker.</p>
    <div v-if="notifications.length > 0">
      <h2>New Notifications:</h2>
      <ul>
        <li v-for="(notification, index) in notifications" :key="index">{{ notification }}</li>
      </ul>
    </div>
    <button @click="publishMQTT">publish</button>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  data() {
    return {
      notifications: [],
      connected: false,
      client: {
        connected: false,
      },
      subscription: {
        topic: 'notifications_queue/#',
        qos: 0,
        payload: 'hello rabbitmq',
      },
    };
  },
  mounted() {
    this.createConnectionMQTT();
  },
  methods: {
    createConnectionMQTT() {
      try {
        const wss_protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const { topic, qos } = this.subscription;
        this.client = mqtt.connect(wss_protocol + 'localhost:15675', {
          clientId: 'clientemqid_vue_' + Math.random().toString(16).substring(2, 8) + '_',
          // clientId: 'clientemqid_vue_' + 2512 + '_',
          username: 'rabbitmq-service',
          password: 'rabbitmq-service',
          port: 15675,
          path: '/ws',
          clean: true,
          connectTimeout: 30 * 1000, // ms
          reconnectPeriod: 4000, // ms
        });

        if (this.client.on) {
          this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.connected = true;
            this.client.subscribe(topic, { qos }, (err, res) => {
              if (err) {
                console.log(`Failed to subscribe to ${topic}: ${err}`);
              } else {
                console.log(`Subscribed to ${topic}:`, res);
              }
            });
          });
          this.client.on('message', (topic, message) => {
            console.log(`Received message on topic ${topic}: ${message.toString()}`);
            this.notifications.push(message.toString());
          });
        }

        this.client.on('error', (err) => {
          this.connected = false;
          console.error('Connection error:', err);
        });
      } catch (error) {
        this.connected = false;
        console.log('mqtt.connect error', error);
      }
    },
    publishMQTT() {
      const { topic, qos, payload } = this.subscription;
      this.client.publish(topic, payload, (error) => {
        if (error) {
          console.log('Publish error', error);
        }
      });
    },
    destroyConnectionMQTT() {
      if (this.client.connected) {
        try {
          this.client.end(false, () => {
            console.log('Successfully disconnected!');
          });
        } catch (error) {
          console.log('Disconnect failed', error.toString());
        }
      }
    },
  },
};
</script>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
