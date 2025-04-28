import app from './app';
import { SERVER_PORT } from './constants/environment-vars.constants';

// Start the server and listen on configured port
const server = app.listen(SERVER_PORT || 5000, () => {
    console.info("==========================================================");
    console.info(`|| The application has started on http://localhost:${SERVER_PORT} ||`);
    console.info("==========================================================");
});

/**
 * Handles graceful shutdown logic when a system signal (SIGINT or SIGTERM) is received.
 * This ensures the server stops accepting new connections and closes properly.
 *
 * @param signal - The termination signal received (e.g., SIGINT or SIGTERM)
 */
function gracefulShutdownHandler(signal: NodeJS.Signals) {
    const GRACEFUL_SHUTDOWN_TIME = 15000; // Wait time before forcefully exiting

    // Disable health check endpoint so load balancers know we are shutting down
    app.locals.HEALTH_CHECK_ENABLED = false;

    console.info(`Caught signal ${signal} gracefully shutting down!`);

    setTimeout(() => {
        server.close(() => {
            console.info("No longer accepting incoming request. Gracefully shutting down!")
            process.exit(); // Exit the process
        })
    }, GRACEFUL_SHUTDOWN_TIME)
}

// Attach shutdown handlers to OS signals
// Handle CTRL+C locally
process.on("SIGINT", gracefulShutdownHandler);

// Handle termination signal (e.g., from cloud providers, Docker stop, etc.)
process.on("SIGTERM", gracefulShutdownHandler);