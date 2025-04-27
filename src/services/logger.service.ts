import { ILoggerBody, ILoggerTransports } from '../interfaces/logger.interface';

class Logger {
    private cache: Array<string>;
    private host: string;
    private writeToStdOut: boolean;

    public constructor(transport: ILoggerTransports) {
        this.cache = Array<string>();
        this.host = transport.host || '';
        this.writeToStdOut = transport.writeToStdOut || true;
    }

    /**
     * @description This method accepts a structured log format and saves it to an internal cache to be flushed
     *              at a later time.
     * @param logType A interface that accepts the request path and the log message
     * @param fieldSet An empty object that extending the logging frame with custom structured key value pairs.
     */
    public fatal(logType: ILoggerBody, logKeyPairs: any = {}): Logger {
        this.log(logType, 'error', logKeyPairs);
        return this;
    }

    /**
     * @description This method accepts a structured log format and saves it to an internal cache to be flushed
     *              at a later time.
     * @param logType A interface that accepts the request path and the log message
     * @param logKeyPairs An empty object that extending the logging frame with custom structured key value pairs.
     */
    public error(logType: ILoggerBody, logKeyPairs: any = {}): Logger {
        this.log(logType, 'error', logKeyPairs);
        return this;
    }

    /**
     * @description This method accepts a structured log format and saves it to an internal cache to be flushed
     *              at a later time.
     * @param logType A interface that accepts the request path and the log message
     * @param logKeyPairs An empty object that extending the logging frame with custom structured key value pairs.
     */
    public warning(logType: ILoggerBody, logKeyPairs: any = {}): Logger {
        this.log(logType, 'warning', logKeyPairs);
        return this;
    }

    /**
     * @description This method accepts a structured log format and saves it to an internal cache to be flushed
     *              at a later time.
     * @param logType A interface that accepts the request path and the log message
     * @param logKeyPairs An empty object that extending the logging frame with custom structured key value pairs.
     */
    public info(logType: ILoggerBody, logKeyPairs: Record<string, unknown> = {}): Logger {
        this.log(logType, 'info', logKeyPairs);
        return this;
    }

    /**
     * @description This method accepts a structured log format and saves it to an internal cache to be flushed
     *              at a later time.
     * @param logType A interface that accepts the request path and the log message
     * @param logKeyPairs An empty object that extending the logging frame with custom structured key value pairs.
     */
    public debug(logType: ILoggerBody, logKeyPairs: any = {}): Logger {
        this.log(logType, 'debug', logKeyPairs);
        return this;
    }

    /**
     * @description write log to transport (log file, standard out or log aggregator service (i.e: datadog))
     */
    public flush(): void {
        this.writeToStandardOut();
    }

    /**
     * @description write log console (stdout).
     */
    private writeToStandardOut(): void {
        if (this.writeToStdOut) {
            for (const log of this.cache) {
                process.stdout.write(`${log}\n`);
            }
        }
    }

    /**
     * @description Send logs to an external log aggregation service.
     * Example targets: Grafana Loki, Prometheus push gateway, etc.
     */
    private async sendLogsToAggregatorService(): Promise<void> {
        if (!this.host) {
            console.warn("No aggregator host configured. Skipping log upload.");
            return;
        }

        try {
            const payload = this.cache.join("\n");

            const response = await fetch(this.host, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: payload,
            });

            if (!response.ok) {
                console.error(`Failed to send logs to aggregator: ${response.statusText}`);
            } else {
                console.info("Logs successfully sent to aggregator.");
                this.cache = []; // Clear cache after successful send
            }
        } catch (error) {
            console.error(`Error sending logs to aggregator: ${(error as Error).message}`);
        }
    }

    private log(logType: ILoggerBody, level: string, logKeyPairs?: Record<string, unknown>): void {
        const keySetValues = this.parseLogKeyPairs(logKeyPairs);
        const logMessage = `[time]=${this.timeStamp()} [level]=${level} [message]='${logType.message}' ${keySetValues}[path]=${logType.path} [execution_time]=${this.executionTime()}ms`;

        this.cache.push(logMessage);
    }

    /**
     * @description calculation request execution time.
     * @returns The execution time of the request.
     */
    private executionTime(): number {
        const startTime = new Date().getTime();
        return new Date().getTime() - startTime;
    }

    /**
     * @description creates a timestamp for the log object.
     * @returns The timestamp the log was created.
     */
    private timeStamp(): string {
        // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const currentTime = new Date();
        const timeStamp = currentTime.toString()

        return `${timeStamp} `;
    }

    /**
     * @param logKeyPair An object containing a key value pair of added log values.
     * @returns A formatted string in a structured log format.
     */
    private parseLogKeyPairs(logKeyPairs: any = {}): string {
        let formattedKeyPairs = '';
        if (Object.keys(logKeyPairs).length === 0) {
            return formattedKeyPairs;
        }

        for (const key in logKeyPairs) {
            formattedKeyPairs += `[${key}]=${logKeyPairs[key]} `;
        }

        return formattedKeyPairs;
    }
}

export default new Logger({ host: '', writeToStdOut: true });