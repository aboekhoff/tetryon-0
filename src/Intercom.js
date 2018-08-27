class Intercom {
  constructor() {
    this.topics = new Map();
  }

  publish(topic, data) {
    const subscriptions = this.topics.get(topic);
    
    if (subscriptions) {
      for (let i = 0; i < subscriptions.length; i++) {
        subscriptions[i](data);
      }
    }
  }

  subscribe(topic, callback) {
    let subscriptions = this.topics.get(topic);
    if (!subscriptions) {
      subscriptions = [];
      this.topics.set(topic, mailboxes);
    }
    subscriptions.push(callback);
  }
}

export default new Intercom();