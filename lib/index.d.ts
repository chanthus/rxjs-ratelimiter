import { Observable, SchedulerLike } from 'rxjs'
export default class RateLimiter {
  private requestsPerInterval
  private intervalLength
  private delayBetweenCallsMs
  private scheduler
  private intervalEnds
  private nActiveInCurrentInterval
  constructor(
    requestsPerInterval: number,
    intervalLength: number,
    delayBetweenCallsMs?: number,
    scheduler?: SchedulerLike,
  )
  limit<T>(stream: Observable<T>): Observable<T>
  _clampedInterval(): number
}
