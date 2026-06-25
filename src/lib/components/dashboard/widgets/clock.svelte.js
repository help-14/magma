let now = $state(new Date());

if (typeof window !== 'undefined') {
  setInterval(() => {
    now = new Date();
  }, 2000);
}

export function useNow() {
  return now;
}
