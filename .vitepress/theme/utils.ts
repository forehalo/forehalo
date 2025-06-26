export class Disposable {
  private disposables: (() => void)[] = []

  add(cleanup: () => void) {
    this.disposables.push(cleanup)
  }

  dispose() {
    for (const cleanup of this.disposables) {
      cleanup()
    }
  }
}
