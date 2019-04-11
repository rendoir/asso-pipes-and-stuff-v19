/*
    Scenario 1:

    Unbounded queue;
    Publisher sends messages a.s.a.p.;
    Subscriber tries to pull messages and blocks (awaits) until it has one;
    Implicit subscription (fetch directly from data structure).
*/

import { delay, random } from "./utils";

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

export class Subscriber {
    async pull(queue: AsyncQueue) {
        let msg = await queue.dequeue();
        this.log(msg);
    }

    log(msg: string) {
        console.log(`[${Date.now().toString()}] Received: ${msg}`);
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
    let queue = new AsyncQueue();
    const publisher = new Publisher();
    const subscriber = new Subscriber();

    //Simple case
    console.log("--- Simple case ---");
    publisher.push(queue, "Hello");
    subscriber.pull(queue);
    publisher.push(queue, "World");
    subscriber.pull(queue);

    await delay(500);

    //Complex case
    console.log("--- Hard case ---");
    for(let i = 0; i < 10; i++) {
        subscriber.pull(queue);
    }
    for(let i = 0; i < 10; i++) {
        publisher.push(queue, i.toString());
        if(Math.random() > 0.5)
            await delay(random(250,500));
    }
}
