import 'server-only'
import { createHash } from 'node:crypto'

/** anon_id (生UUID) を SHA-256 ハッシュ化して返す。サーバー専用。 */
export function hashAnonId(rawId: string): string {
  return createHash('sha256').update(rawId).digest('hex')
}
