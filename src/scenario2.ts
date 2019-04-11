/*
    Scenario 2:

    Unbounded queue and publishes asap (again);
    Multiple subscribers:
    They pull messages concurrently;
    Each gets a different message;
    Implicit subscription (fetch from data structure).
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
    const s1 = new Subscriber("s1");
    const s2 = new Subscriber("s2");
    const s3 = new Subscriber("s3");

    console.log("----- Scenario 2 -----");
    s1.pull(q);
    s2.pull(q);
    s3.pull(q);
    p.push(q, "Hello");
    p.push(q, "World");
    p.push(q, "I'm Daniel");

    await delay(500);
    console.log();
}
