# Module Dataset Plan

This project now uses three learning categories:
- Basic Alphabets
- Words
- Sentences

Use the datasets below as the initial source pool for lesson media and curriculum design.

## 1) Basic Alphabets

### ASL Alphabet (Kaggle)
- URL: https://www.kaggle.com/datasets/grassknoted/asl-alphabet
- Why it fits: static hand-shape alphabet images, large class-balanced alphabet set.
- Notes: includes extra classes like `SPACE`, `DELETE`, `NOTHING` that are useful for real-time models.
- License shown on dataset card: GPL 2.

### Sign Language MNIST (Kaggle)
- URL: https://www.kaggle.com/datasets/datamunge/sign-language-mnist/data
- Why it fits: easy benchmark format (28x28 grayscale), great for rapid alphabet classifier baselines.
- Notes: excludes motion letters (J and Z).
- License shown on dataset card: CC0.

## 2) Words

### WLASL (official homepage + repo)
- Homepage: https://dxli94.github.io/WLASL/
- Repo: https://github.com/dxli94/WLASL
- Why it fits: large word-level ASL dataset with up to 2,000 glosses and signer variation.
- Notes: includes downloader and metadata JSON for building lesson packs.
- License/terms: C-UDA, academic/computational use only.

### MS-ASL (Microsoft Research)
- URL: https://www.microsoft.com/en-us/research/publication/ms-asl-a-large-scale-data-set-and-benchmark-for-understanding-american-sign-language/
- Why it fits: large-scale word-level ASL benchmark (1000 signs, 200+ signers).
- Notes: strong for robust real-world vocabulary modules.
- License/terms: follow Microsoft Research dataset/publication terms.

### ASL Citizen (Microsoft Research)
- URL: https://www.microsoft.com/en-us/research/project/asl-citizen/dataset-description/
- Why it fits: crowdsourced isolated-sign videos from many everyday signers/environments.
- Notes: useful for hardening recognition against real-world diversity.
- License/terms: review ASL Citizen dataset license page before use.

## 3) Sentences

### How2Sign (official)
- URL: https://how2sign.github.io/
- Why it fits: continuous ASL with gloss + English translation and multiple modalities.
- Notes: designed for sentence-level understanding and translation tasks.
- License/terms: research use only.

### OpenASL (official repo)
- URL: https://github.com/chevalierNoir/OpenASL
- Why it fits: open-domain ASL-English translation data for realistic sentence/phrase learning.
- Notes: includes tooling to download and preprocess clips.
- License/terms: CC BY-NC-ND 4.0 (non-commercial, no-derivatives requirements).

## Optional Non-ASL Sentence Benchmark

### RWTH-PHOENIX-Weather 2014
- URL: https://www-i6.informatik.rwth-aachen.de/~koller/RWTH-PHOENIX/
- Why it helps: strong continuous sign recognition benchmark pipeline.
- Important: this is German Sign Language domain data, not ASL; use for model pipeline benchmarking only.

## Recommended Fill Order

1. Fill `Basic Alphabets` using ASL Alphabet + Sign Language MNIST for classifier warm-up.
2. Fill `Words` using WLASL as primary and MS-ASL/ASL Citizen for coverage and signer diversity.
3. Fill `Sentences` using How2Sign as primary and OpenASL as open-domain extension.

## Practical Ingestion Notes

- Keep dataset licensing metadata alongside imported assets.
- Prefer storing processed lesson clips in Cloudinary and keeping source references in lesson descriptions.
- Start with 20-30 high-quality lessons per category before scaling to full corpus coverage.
- Use manifest importer for bulk load:
  - JSON: `node backend/utils/importModuleManifest.js --file docs/examples/module-manifest.example.json --mode upsert`
  - CSV: `node backend/utils/importModuleManifest.js --file docs/examples/module-manifest.example.csv --mode upsert`
