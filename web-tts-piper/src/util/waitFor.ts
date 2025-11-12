type WaitForConditionOptions = {
  conditionFn: () => boolean;
  interval?: number;
  timeout?: number;
};

export function waitFor({
  conditionFn,
  interval = 100,
  timeout = 5000,
}: WaitForConditionOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      if (conditionFn()) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - startTime >= timeout) {
        clearInterval(timer);
        reject(new Error('Timeout reached waiting for condition'));
      }
    }, interval);
  });
}
