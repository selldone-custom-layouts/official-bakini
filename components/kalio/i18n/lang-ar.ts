/* Bakini in this language: the shared Kalio base and Bakini's own words, one chunk. */
import base from "./base/ar";
import own from "./bakini.ar";

export default { ...base, ...own } as Record<string, string>;
