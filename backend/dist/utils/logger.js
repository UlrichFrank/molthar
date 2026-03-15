class Logger {
    constructor(level = 'info') {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        this.level = level || 'info';
    }
    shouldLog(level) {
        return this.levels[level] >= this.levels[this.level];
    }
    format(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        return data ? `${prefix} ${message} ${JSON.stringify(data)}` : `${prefix} ${message}`;
    }
    debug(message, data) {
        if (this.shouldLog('debug')) {
            console.log(this.format('debug', message, data));
        }
    }
    info(message, data) {
        if (this.shouldLog('info')) {
            console.log(this.format('info', message, data));
        }
    }
    warn(message, data) {
        if (this.shouldLog('warn')) {
            console.warn(this.format('warn', message, data));
        }
    }
    error(message, data) {
        if (this.shouldLog('error')) {
            console.error(this.format('error', message, data));
        }
    }
}
export const logger = new Logger(process.env.LOG_LEVEL || 'info');
//# sourceMappingURL=logger.js.map