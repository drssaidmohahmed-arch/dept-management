/**
 * Activity Logger Utility
 * Logs actions to the activity-log API endpoint with fallback to local store.
 * Designed to be called from both client and server contexts.
 */

interface LogOptions {
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details?: Record<string, any>;
  performedByName?: string;
}

// In-memory fallback for when API is unavailable (server-side)
const localLogBuffer: Array<{
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  performed_by_name: string;
  details: string;
  created_at: string;
}> = [];

let logCounter = 0;

/**
 * Log an activity to the activity-log API.
 * - On server: uses fetch with localhost
 * - On client: uses relative URL
 * - Falls back to in-memory buffer silently
 */
export function logActivity(options: LogOptions): void {
  const { action, entityType, entityId, entityName, details, performedByName } = options;

  const payload = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    performed_by: '',
    performed_by_name: performedByName || '',
    details: details ? JSON.stringify(details) : '',
  };

  // Fire and forget — don't block the caller
  try {
    const url = typeof window !== 'undefined' ? '/api/activity-log' : 'http://localhost:3000/api/activity-log';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silent fallback to local buffer
      logCounter++;
      localLogBuffer.push({
        id: `local-log-${logCounter}`,
        action: payload.action,
        entity_type: payload.entity_type,
        entity_id: payload.entity_id,
        entity_name: payload.entity_name,
        performed_by_name: payload.performed_by_name,
        details: payload.details,
        created_at: new Date().toISOString(),
      });
    });
  } catch {
    logCounter++;
    localLogBuffer.push({
      id: `local-log-${logCounter}`,
      action: payload.action,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id,
      entity_name: payload.entity_name,
      performed_by_name: payload.performed_by_name,
      details: payload.details,
      created_at: new Date().toISOString(),
    });
  }
}

// ── Server-side logging helper for API routes ──

/**
 * Server-side log helper — can be awaited or fire-and-forget.
 * This is used inside API route handlers.
 */
export async function serverLogActivity(options: LogOptions): Promise<void> {
  const { action, entityType, entityId, entityName, details, performedByName } = options;

  const payload = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    performed_by: '',
    performed_by_name: performedByName || '',
    details: details ? JSON.stringify(details) : '',
  };

  try {
    await fetch('http://localhost:3000/api/activity-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fallback
  }
}