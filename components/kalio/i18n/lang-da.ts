/* Medio in this language: the shared Kalio base and Medio's own words, one chunk. */
import base from "./base/da";
import own from "./medio.da";

export default { ...base, ...own } as Record<string, string>;
