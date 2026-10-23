One JSON file per model: data/<slug>.json (slug = lowercase, dashes, e.g. alphafold-2, uma, esm-2).
Every number must come from the paper, model card, official blog or repo. Unknown -> "n/a". Never guess.
Short fragments only. No sentences.

{
 "slug": "alphafold-2",
 "name": "AlphaFold 2",
 "what": "Predicts 3D protein structure from amino-acid sequence",      // one line, input -> output, <= 12 words
 "input":  {"label": "Sequence + MSA + templates", "size": "N residues · up to ~2,700 aa"},  // what + shape/size
 "blocks": [                                    // 1-4 main blocks inside the model box, in order
   {"name": "Evoformer", "dims": "48 × 256 / 128"},   // layers × width (n_layer × hidden); note if two widths (MSA/pair)
   {"name": "Structure module", "dims": "8 × 384"}
 ],
 "params": "93M",                               // total params ("1.4B total · 50M active" for MoE)
 "loop": "× 3 recycles",                        // recycling / diffusion steps / null
 "output": {"label": "3D atom coordinates + pLDDT", "size": "N × 37 atoms × 3"},
 "who":  {"org": "Google DeepMind", "year": "2021", "versions": "AF1 2018 → AF2 2021 → Multimer 2021 → AF3 2024", "license": "Open · Apache 2.0 code, CC BY 4.0 weights"},
 "ideas": ["Pair representation + triangle updates", "..."],   // 3-6 items, each <= 6 words
 "train": {"hardware": "128 × TPU v3", "time": "~11 days", "compute": "n/a", "samples": "~170k PDB + 350k distilled", "data": "PDB, UniRef90, BFD, MGnify", "epochs": "n/a"},
 "results": ["CASP14 median GDT 92.4", "Backbone 0.96 Å median RMSD"],   // 1-3 headline numbers vs previous best / baseline
 "speed": "minutes per protein on 1 GPU",      // inference speed
 "limit": "One static structure; needs MSA",   // <= 6 words
 "sources": ["https://...", "..."]             // real URLs used
}
