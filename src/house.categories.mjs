/**
 * The "house Starlight kit" category list: generic, reusable for any Starlight
 * site. Each category gets a hue from the --house-hue-N palette by its 0-based
 * index (wrapping: idx 9 -> hue 1).
 *
 * Components derive guide/reference kind from the entry id prefix:
 * "guides/" -> guide, "reference/" -> reference.
 *
 * This file is the SITE-SPECIFIC re-export. Lexicanum maps from its TAXONOMY;
 * another site would provide its own CATEGORIES array directly (no import).
 */
import { TAXONOMY } from "./lib/taxonomy.mjs";

/** @type {{id:string,label:string,groups?:{id:string,label:string}[]}[]} */
export const CATEGORIES = TAXONOMY;