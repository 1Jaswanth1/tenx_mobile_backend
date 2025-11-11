// app/api/health/route.ts
// Health Check API Route

import { NextResponse } from 'next/server';
import os from 'os';
import { createClient } from '@/lib/supabase/server';

/**
 * Health Check Endpoint
 *
 * Returns the health status of the application including:
 * - Server uptime and resource usage
 * - Supabase database connectivity
 * - Memory and CPU statistics
 *
 * This endpoint is used by:
 * - Docker health checks
 * - Load balancers
 * - Monitoring systems
 * - CI/CD pipelines
 *
 * @returns JSON response with health status
 */
export async function GET() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  // Test Supabase connectivity
  let databaseStatus = 'disconnected';
  let databaseError = null;

  try {
    const supabase = await createClient();

    // Simple query to test database connection
    const { error } = await supabase
      .from('user')
      .select('count')
      .limit(1)
      .single();

    if (!error || error.code === 'PGRST116') {
      // PGRST116 = no rows returned (table exists but empty - that's fine)
      databaseStatus = 'connected';
    } else {
      databaseStatus = 'error';
      databaseError = error.message;
    }
  } catch (error: any) {
    databaseStatus = 'error';
    databaseError = error.message;
  }

  const healthCheck = {
    status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: databaseStatus,
      error: databaseError,
      provider: 'supabase',
    },
    system: {
      cpuUsage: process.cpuUsage(),
      memoryUsage: {
        total: formatBytes(totalMemory),
        free: formatBytes(freeMemory),
        used: formatBytes(usedMemory),
        percentUsed: ((usedMemory / totalMemory) * 100).toFixed(2) + '%',
      },
    },
  };

  // Return 200 if healthy, 503 if degraded
  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

  return NextResponse.json(healthCheck, { status: statusCode });
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}