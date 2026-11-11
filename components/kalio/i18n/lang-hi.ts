/* Medio in this language: the shared Kalio base and Medio's own words, one chunk. */
import base from "./base/hi";
import own from "./medio.hi";

export default { ...base, ...own } as Record<string, string>;
