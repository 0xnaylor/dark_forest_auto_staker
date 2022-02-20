const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

module.exports = {
    logger: createLogger({
        level: 'info',
        format: combine(
            label({ label: 'auto_staker' }),
            timestamp(),
            myFormat
        ),
        // defaultMeta: { service: 'check_unicorn_balance' },
        transports: [
            //
            // - Write all logs with importance level of `error` or less to `error.log`
            // - Write all logs with importance level of `info` or less to `combined.log`
            //
            new transports.File({ filename: 'logs/unicorn_auto_staker_error.log', level: 'error' }),
            new transports.File({ filename: 'logs/unicorn_auto_staker.log' }),
        ],
    })
}