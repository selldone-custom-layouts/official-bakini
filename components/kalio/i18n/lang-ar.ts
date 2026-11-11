/* Medio in this language: the shared Kalio base and Medio's own words, one chunk. */
import base from "./base/ar";
import own from "./medio.ar";

export default { ...base, ...own } as Record<string, string>;
