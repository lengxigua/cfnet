/**
 * Archive old audit log data
 * Deletes audit logs older than 1 year
 *
 * Can be executed via Cloudflare Cron Trigger:
 *   - Schedule: 0 3 1 * * (first day of each month at 3 AM)
 *   - Or run manually: npx tsx scripts/archive-old-data.ts
 */

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

async function archiveOldData() {
  console.log('Starting audit log archival...');

  const cutoffTimestamp = Math.floor(Date.now() / 1000) - ONE_YEAR_IN_SECONDS;
  const cutoffDate = new Date(cutoffTimestamp * 1000).toISOString();

  console.log(`Archiving audit logs older than: ${cutoffDate}`);

  // Note: This script is a template. In production, you would:
  // 1. Connect to D1 via Wrangler or the Cloudflare API
  // 2. Optionally export old records to R2 before deletion
  // 3. Delete the old records

  // Example SQL:
  // DELETE FROM audit_logs WHERE created_at < ${cutoffTimestamp}

  console.log(`Cutoff timestamp: ${cutoffTimestamp}`);
  console.log(
    'To run against D1, use: wrangler d1 execute <db-name> --command "DELETE FROM audit_logs WHERE created_at < ' +
      cutoffTimestamp +
      '"'
  );
  console.log('Archival complete.');
}

archiveOldData().catch(console.error);
