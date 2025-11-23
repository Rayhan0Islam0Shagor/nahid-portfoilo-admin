import cluster from 'cluster';
import os from 'os';

// Determine if running on Vercel (clustering doesn't work in serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// Get number of CPU cores
const numCPUs = os.cpus().length;

// If running on Vercel or if CLUSTER_MODE is disabled, run as single process
if (isVercel || process.env.CLUSTER_MODE === 'false') {
  // Import and run the server directly
  import('./server.js');
} else {
  // Cluster mode: master process manages workers
  if (cluster.isPrimary) {
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork();
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      const newWorker = cluster.fork();
    });

    // Handle worker online
    cluster.on('online', (worker) => {
      // Worker is online
    });

    // Handle worker disconnect
    cluster.on('disconnect', (worker) => {
      // Worker disconnected
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
    });

    process.on('SIGINT', () => {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
      process.exit(0);
    });
  } else {
    // Worker process: import and run the server
    import('./server.js');
  }
}
