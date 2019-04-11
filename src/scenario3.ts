/*
    Scenario 3:

    Unbounded queue and publishes asap (again);
    Ventilator (or Subscription Manager) knows about the subscribers:
    Observer used to push to subscribers (Explicit subscription);
    Different specializations of ventilators (Fanout, Round-robin...).
*/

import { delay } from "./utils";

export class AsyncQueue {
    msgQueue: Array<string>
    promiseQueue: Array<(value: string) => void>

    constructor() {
        this.msgQueue = new Array<string>()
        this.promiseQueue = new Array<(value: string) => void>()
    }

    async enqueue(msg: string): Promise<void> {
        //If there are promises, resolve them
        if (this.promiseQueue.length > 0)
            this.promiseQueue.shift()(msg)
        else
            this.msgQueue.push(msg)
    }

    async dequeue(): Promise<string> {
        //If there is a message to return
        if(this.msgQueue.length > 0) {
            //Return the message
            return Promise.resolve(this.msgQueue.shift())
        } else {
            //Return a promise
            return new Promise(resolve => this.promiseQueue.push(resolve))
        }
    }
}

export class Ventilator {
    subscribers: Array<Subscriber>;

    constructor() {
        this.subscribers = new Array<Subscriber>();
    }

    addSubscriber(s: Subscriber) {
        this.subscribers.push(s);
    }

    async pull(queue: AsyncQueue) {
        let msg = await queue.dequeue();
        this.notifySubscribers(msg);
    }

    notifySubscribers(msg: string) {
        for(let s of this.subscribers)
            s.log(msg);
    }
}

export class Subscriber {
    constructor(private id: string) { }

    async pull(queue: AsyncQueue) {
        let msg = await queue.dequeue();
        this.log(msg);
    }

    log(msg: string) {
        console.log(`[${Date.now().toString()}] Received(${this.id}): ${msg}`);
    }
}

export class Publisher {
    push(queue: AsyncQueue, msg: string) {
        queue.enqueue(msg);
        this.log(msg);
    }

    log(msg: string) {
        console.log(`[${Date.now().toString()}] Sent: ${msg}`);
    }
}

export async function test() {
    let q = new AsyncQueue();
    const p = new Publisher();
    const v = new Ventilator();
    const s1 = new Subscriber("s1");
    const s2 = new Subscriber("s2");
    const s3 = new Subscriber("s3");
    
    v.addSubscriber(s1);
    v.addSubscriber(s2);
    v.addSubscriber(s3);

    console.log("----- Scenario 3 -----");
    v.pull(q);
    v.pull(q);
    v.pull(q);
    p.push(q, "Hello");
    p.push(q, "World");
    p.push(q, "I'm Daniel");

    await delay(500);
    console.log();
}
