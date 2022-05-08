export declare class Queue<T> {
    private flushLimit;
    private arriveflushLimitTopic;
    private queue;
    constructor(flushLimit?: number, arriveflushLimitTopic?: string);
    add(element: T): void;
    flush(): T[];
}
