export function isPromise(obj) {
  return obj && obj.then instanceof Function;
}
