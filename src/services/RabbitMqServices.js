import { connect } from 'amqplib';

export default {
  subscribeToNotifications: async () => {
    const connection = await connect('amqp://rabbitmq-service:rabbitmq-service@localhost:5672/vh_zicare1');
    const channel = await connection.createChannel();

    await channel.consume(
      'notifications_queue',
      function (message) {
        console.info(message.fields.routingKey);
        console.info(message.content.toString());
      },
      {
        noAck: true,
      }
    );
  },
};
