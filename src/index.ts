import { asyncScheduler, Observable, of, SchedulerLike } from 'rxjs'
import { concatMap, delay, switchMapTo } from 'rxjs/operators'

export default class RateLimiter {
  private intervalEnds = 0
  private nActiveInCurrentInterval = 0

  constructor(
    private requestsPerInterval: number,
    private intervalLength: number,
    private delayBetweenCallsMs: number = 0,
    private scheduler: SchedulerLike = asyncScheduler,
  ) {}

  limit<T>(stream: Observable<T>): Observable<T> {
    return of(null).pipe(
      concatMap(() => {
        const now = this.scheduler.now()
        if (this.intervalEnds <= now) {
          this.nActiveInCurrentInterval = 1
          this.intervalEnds = now + this.intervalLength
          return stream
        } else {
          if (++this.nActiveInCurrentInterval > this.requestsPerInterval) {
            this.nActiveInCurrentInterval = 1
            this.intervalEnds += this.intervalLength
          }

          const delayBetweenCallsMs = this.delayBetweenCallsMs * this._clampedInterval()
          const wait = this.intervalEnds - this.intervalLength - now + delayBetweenCallsMs

          return wait > 0
            ? of(null).pipe(
                delay(wait, this.scheduler),
                switchMapTo(stream),
              )
            : stream
        }
      }),
    )
  }
  _clampedInterval(): number {
    return Math.max(this.nActiveInCurrentInterval - 1, 0)
  }
}
