// api/books.ts

// ❗ Prefer env vars in production:
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseUrl = 'https://lkqgruvexwesvppoypwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcWdydXZleHdlc3ZwcG95cHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDkzNjEsImV4cCI6MjA3NDkyNTM2MX0.nnD2Y5X9HLs96QJqN_qsV-VO0U61iW_Soxji8_BQnDQ';

const BASE = `${supabaseUrl}/rest/v1/books`;
const RPC  = `${supabaseUrl}/rest/v1/rpc/search_books`;

const HEADERS = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

export type Spice = "closed door" | "low" | "medium" | "high" | "explicit";

type GetBooksOpts = {
  // selection & paging
  select?: string;
  limit?: number;
  offset?: number;

  // text search
  titleIlike?: string;
  authorIlike?: string;
  subgenreEq?: string;
  subgenreIlike?: string;

  // numeric ranges
  minYear?: number;
  maxYear?: number;
  minPages?: number;
  maxPages?: number;
  minRating?: number;      // uses avg_rating column
  maxRating?: number;
  minRatingsCount?: number; // number_of_ratings >= N

  // tropes are plain text (substring search)
  tropesAny?: string[];   // OR
  tropesAll?: string[];   // AND
  tropesIlike?: string;   // single term

  // spice (TEXT)
  spiceEq?: Spice;
  spiceIn?: Spice[];
  spiceIlike?: string;

  // ordering
  order?: string; // e.g., "avg_rating.desc,year.desc"

  // fuzzy search via RPC
  search?: string;
};

export async function getBooks(opts: GetBooksOpts = {}) {
  // ----- Fuzzy search via RPC -----
  if (opts.search) {
    const url = new URL(RPC);
    url.searchParams.set("query", opts.search);
    if (opts.limit) url.searchParams.set("limit", String(opts.limit));
    const res = await fetch(url.toString(), { headers: HEADERS });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  const {
    select = "*",
    limit = 20,
    offset = 0,
    titleIlike,
    authorIlike,
    subgenreEq,
    subgenreIlike,
    minYear,
    maxYear,
    minPages,
    maxPages,
    minRating,
    maxRating,
    minRatingsCount,
    tropesAny,
    tropesAll,
    tropesIlike,
    spiceEq,
    spiceIn,
    spiceIlike,
    order,
  } = opts;

  const url = new URL(BASE);
  url.searchParams.set("select", select);
  url.searchParams.set("limit", String(limit));
  if (offset) url.searchParams.set("offset", String(offset));

  // ----- TEXT FILTERS (use PostgREST wildcard "*", not "%") -----
  const likeVal = (term: string) => `ilike.*${term}*`;

  if (titleIlike)   url.searchParams.set("title",    likeVal(titleIlike));
  if (authorIlike)  url.searchParams.set("author",   likeVal(authorIlike));
  if (subgenreEq)   url.searchParams.set("subgenre", `eq.${subgenreEq}`);
  if (subgenreIlike)url.searchParams.set("subgenre", likeVal(subgenreIlike));

  // ----- NUMERIC RANGES (append both bounds; don't overwrite) -----
  const appendRange = (col: string, min?: number, max?: number) => {
    if (min !== undefined) url.searchParams.append(col, `gte.${min}`);
    if (max !== undefined) url.searchParams.append(col, `lte.${max}`);
  };
  appendRange("year",        minYear, maxYear);
  appendRange("pages",       minPages, maxPages);
  appendRange("avg_rating",  minRating, maxRating);
  if (minRatingsCount !== undefined) {
    url.searchParams.set("number_of_ratings", `gte.${minRatingsCount}`);
  }

  // ----- TROPES (plain text substring search) -----
  // Single-term convenience
  if (tropesIlike) {
    url.searchParams.set("tropes", likeVal(tropesIlike));
  }

  // AND: each term must appear somewhere in the tropes text
  if (tropesAll?.length) {
    for (const trope of tropesAll) {
      url.searchParams.append("tropes", likeVal(trope));
    }
  }

  // OR: any of the terms can match, use or=(t1,t2,...) with ilike.*term*
  if (tropesAny?.length) {
    const orClauses = tropesAny.map((t) => `tropes.${likeVal(t)}`).join(",");
    url.searchParams.set("or", `(${orClauses})`);
  }

  // ----- SPICE (TEXT) -----
  if (spiceEq)  url.searchParams.set("spice_level", `eq.${spiceEq}`);
  if (spiceIn?.length) {
    // PostgREST in.(a,b,c) — values can contain spaces; URLSearchParams will encode them
    url.searchParams.set("spice_level", `in.(${spiceIn.join(",")})`);
  }
  if (spiceIlike) url.searchParams.set("spice_level", likeVal(spiceIlike));

  // ----- ORDER -----
  if (order) url.searchParams.set("order", order);

  const res = await fetch(url.toString(), { headers: HEADERS });
  console.log("Constructed URL:", url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Convenience wrapper
export const fuzzySearchBooks = (q: string, limit = 50) =>
  getBooks({ search: q, limit });
