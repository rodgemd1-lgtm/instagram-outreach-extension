export function waitForElement(
  selector: string,
  timeout = 10000,
  root: Element | Document = document
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
    }, timeout);

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(root instanceof Document ? root.body : root, {
      childList: true,
      subtree: true,
    });
  });
}

export function waitForElements(
  selector: string,
  minCount: number,
  timeout = 10000,
  root: Element | Document = document
): Promise<NodeListOf<Element>> {
  return new Promise((resolve, reject) => {
    const existing = root.querySelectorAll(selector);
    if (existing.length >= minCount) {
      resolve(existing);
      return;
    }

    const timer = setTimeout(() => {
      observer.disconnect();
      const final = root.querySelectorAll(selector);
      if (final.length > 0) {
        resolve(final);
      } else {
        reject(new Error(`Expected ${minCount}+ elements for "${selector}", found 0`));
      }
    }, timeout);

    const observer = new MutationObserver(() => {
      const els = root.querySelectorAll(selector);
      if (els.length >= minCount) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(els);
      }
    });

    observer.observe(root instanceof Document ? root.body : root, {
      childList: true,
      subtree: true,
    });
  });
}

export function waitForNoChange(
  container: Element,
  stableMs = 2000
): Promise<void> {
  return new Promise((resolve) => {
    let timer = setTimeout(resolve, stableMs);

    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        observer.disconnect();
        resolve();
      }, stableMs);
    });

    observer.observe(container, { childList: true, subtree: true });
  });
}
