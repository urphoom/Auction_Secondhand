export async function recordWithdrawalLog(
  db,
  { requestId, actorId = null, actorType, action, details = null }
) {
  if (!requestId || !actorType || !action) {
    throw new Error('recordWithdrawalLog: requestId, actorType, and action are required');
  }

  const serializedDetails = details ? JSON.stringify(details) : null;

  await db.query(
    `INSERT INTO withdrawal_request_logs (request_id, actor_id, actor_type, action, details)
     VALUES (?, ?, ?, ?, ?)`,
    [requestId, actorId, actorType, action, serializedDetails]
  );
}

