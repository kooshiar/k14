# Problem business research spec (K14, 2026-10-27)

K14 is a small startup with a computational molecule-design platform (physics + AI). For each problem we design a
molecule (binder, extractant, sorbent, additive, inhibitor, catalyst, blend component), then buy/synthesize it and test
it in a lab, then sell it (product), license it, or sell it as an add-in into someone's process. Goal of this research:
find which problems can give K14 the highest revenue and margin. Numbers must be REAL, RECENT (2023-2026) and SOURCED.
Search widely (WebSearch "extended" mode for hard facts), triangulate at least 2 sources for market size, prefer
bottom-up (tonnes/yr x price/kg, or units x $/unit) over generic market-report headlines. Market-report sites
(MarketsandMarkets, GMI, Grand View...) disagree a lot: when you use one, cross-check with a bottom-up number and say so.

Write ONE JSON file per problem to /Volumes/d1/projects/phy/web/decks/biz/raw/<key>.json (UTF-8), exactly this shape:

{
 "key": "<key>",
 "name": "<short plain name, 2-4 words>",
 "market": {                       // what is SOLD TODAY that our design would replace or sell into
   "usd_yr": 0,                    // number, USD per year, latest year available
   "year": 2025,
   "what": "short: which product/service, which geography (world unless noted)",
   "method": "short: how computed, e.g. '45 kt/yr x $4.2/kg' or 'avg of report A and B'",
   "sources": ["https://..."],
   "confidence": "high|med|low"
 },
 "value": {                        // value of OUR design if it works (be creative but honest; show the formula)
   "created_usd_yr": 0,            // $/yr of benefit to buyers if adopted across the addressable market
                                   //   e.g. coolant: data-center power saved x $/kWh; extractant: fewer SX stages capex+opex, more metal recovered
   "logic": "formula in one or two short lines with the key numbers",
   "our_revenue_usd_yr": 0,        // realistic K14 (or K14 + licensee) revenue at maturity (~year 7) at a realistic share
   "revenue_logic": "share x price x volume, or royalty % x sales",
   "gross_margin_pct": 0,          // expected gross margin on what we sell (specialty additive 50-75, commodity 10-25, license 90)
   "margin_logic": "short",
   "sources": ["https://..."]
 },
 "trend": {
   "cagr_pct": 0,                  // growth of the END market/demand driving this problem, %/yr, next ~5 yrs
   "drivers": "short: e.g. 'AI data-center build-out; EU PFAS ban 2027'",
   "deadline": "nearest hard regulatory/market deadline, or ''",
   "sources": ["https://..."]
 },
 "competition": {
   "direct_startups": ["names"],   // startups (founded 2012+) attacking THIS problem with a molecule/material like ours
   "indirect_startups": ["names"], // startups solving the same pain another way (e.g. PFAS destruction vs PFAS sorbent)
   "incumbents": ["names"],        // established companies selling today's solution
   "papers_3yr": 0,                // OpenAlex count, see below
   "paper_query": "the exact search string used",
   "groups_active": 0,             // institutions with >=3 papers in that OpenAlex result (see below)
   "notes": "short: who is strongest, any recent funding rounds with $",
   "sources": ["https://..."]
 },
 "lab": {                          // first convincing lab data for OUR type of design (molecule in hand + the key test)
   "weeks": 0,
   "usd": 0,
   "synth": "catalog | 1-2 step custom | 3-5 step custom | macrocycle/polymer/resin, and why",
   "test": "name the real standard test (ASTM/EPA/ISO method or the usual lab assay) and where it can be run",
   "logic": "synth weeks + test weeks; synth $ + test $ (cite real prices where you can)",
   "sources": ["https://..."]
 },
 "sale": {
   "years_to_first_sale": 0,       // from first lab proof to first paid order, realistic
   "gates": "short: qualification/approval steps, e.g. 'NSF/ANSI 61 cert ~1 yr; utility pilot 1 yr'",
   "sources": ["https://..."]
 }
}

Lab baseline (use unless you find better real numbers for this case; contract research org = CRO):
- catalog compound: 1-2 wk, $100-1,000
- 1-2 step custom synthesis, 5-20 g, CRO (China/India): 4-6 wk, $4-8k ; US/EU CRO ~2-3x price
- 3-5 step custom synthesis: 8-12 wk, $10-25k
- macrocycle, polymer, grafted resin or MOF: 10-16 wk, $20-50k
- test cost: find the real test (e.g. ASTM D1384 glassware corrosion ~2 wk; solvent-extraction distribution ratios at a university lab;
  EPA 533/537.1 PFAS analysis ~$250-400/sample; ICP-MS ~$30-80/sample; wine sensory panel; battery coin-cell cycling 4-8 wk)
- include formulation work and the first round of 2-3 design variants (we always test a few, not one)

OpenAlex counts (run with Bash + curl, no key needed; add &mailto=kooshiar@gmail.com is NOT allowed - leave it off):
  papers:  curl -s "https://api.openalex.org/works?search=<url-encoded query>&filter=from_publication_date:2023-01-01,to_publication_date:2025-12-31&per-page=1" | python3 -c "import json,sys;print(json.load(sys.stdin)['meta']['count'])"
  groups:  curl -s "https://api.openalex.org/works?search=<q>&filter=from_publication_date:2023-01-01,to_publication_date:2025-12-31&group_by=authorships.institutions.id&per-page=200" | python3 -c "import json,sys;g=json.load(sys.stdin)['group_by'];print(sum(1 for x in g if x['count']>=3))"
  Use a SPECIFIC query (3-6 words) that matches this exact problem (e.g. "gallium extraction Bayer liquor", not "gallium").
  Use the same style of specificity for every problem so counts are comparable.

Rules: no made-up numbers; if you can't find a number, estimate and set confidence low and say "est." in method/logic.
Keep strings short. Don't edit any other file. Do not research or discuss bio/medical or nuclear topics.
When done, reply with one line per problem: key, market $, our revenue $, CAGR, papers.
