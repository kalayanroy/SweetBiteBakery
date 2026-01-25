module.exports = {
    apps: [{
        name: 'sweetbite-bakery',
        script: 'server/index.ts',
        interpreter: 'node_modules/.bin/tsx',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
            PORT: 5000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};
