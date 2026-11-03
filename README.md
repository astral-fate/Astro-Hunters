<div align="center">

# 🔭 Astro-Hunters

**Hunting for exoplanets in NASA TESS light curves with machine learning, plus an interactive web app that teaches anyone how to spot a transit.**

🥇 **1st place, NASA Space Apps Challenge 2025 (Madinah) · 🌍 Global Nominee**
Challenge: [*A World Away: Hunting for Exoplanets with AI*](https://www.spaceappschallenge.org/2025/challenges/a-world-away-hunting-for-exoplanets-with-ai/)

[![Live app](https://img.shields.io/badge/🚀_Live_App-Vercel-000000?style=for-the-badge)](https://astro-hunters.vercel.app/)
[![HF Space](https://img.shields.io/badge/🤗_Model_Demo-Spaces-FF9D00?style=for-the-badge)](https://huggingface.co/spaces/FatimahEmadEldin/Astro-Hunters)
[![Model](https://img.shields.io/badge/🤗_Model-Transit_Detector-FFD21E?style=for-the-badge)](https://huggingface.co/FatimahEmadEldin/Astro-Hunters-Transit-Detector)
[![Paper](https://img.shields.io/badge/📄_Paper-arXiv:2608.18172-B31B1B?style=for-the-badge)](https://arxiv.org/abs/2608.18172)
[![Space Apps](https://img.shields.io/badge/🛰️_Space_Apps-Team_page-0B3D91?style=for-the-badge)](https://www.spaceappschallenge.org/2025/find-a-team/astro-hunter/)

</div>

---

## ✨ What it is

Astro-Hunters has two parts:

1. **A machine-learning pipeline** that looks for the tiny, periodic dips in a star's brightness that a transiting planet causes in TESS two-minute photometry. The training code is in [`Astro-Hunters-Model-traning`](https://github.com/astral-fate/Astro-Hunters-Model-traning); the trained model is on [Hugging Face](https://huggingface.co/FatimahEmadEldin/Astro-Hunters-Transit-Detector).
2. **This repo: an interactive web app** ([astro-hunters.vercel.app](https://astro-hunters.vercel.app/)) that turns the same science into something anyone can explore.

## 🌌 The web app

| Section | What you can do |
|---|---|
| **Hunt for transits** | Inspect light curves, mark dips you think are transits, and check them with the built-in *Field Guide* (planet transits vs eclipsing binaries, stellar variability and systematics) |
| **The Transit Method** | See how a planet passing its star dims the light, with a size comparison |
| **Our Solar System** | Explore the planets and the phenomena on each |
| **NASA Data Explorer** | Live NASA data: Astronomy Picture of the Day (*Cosmic Time Machine*), near-Earth objects, Mars rover photos, EONET Earth events, moon phases & eclipses |
| **Citizen science** | Get started with Planet Hunters TESS, Asteroid Hunters, Galaxy Zoo and more |
| **Discover** | Run the trained model on real stars in the [Hugging Face Space](https://huggingface.co/spaces/FatimahEmadEldin/Astro-Hunters) |

## 🧠 The model & research

The pipeline retrieves TESS light curves with `lightkurve`, stitches the sectors, then normalises and detrends them (median filter). It computes seven sliding-window statistics per cadence and classifies each cadence with gradient-boosted trees (XGBoost).

The paper, [*Astro-Hunters: Machine Learning for Exoplanet Transit Detection in TESS Photometry*](https://arxiv.org/abs/2608.18172) (sole author), treats **how the training labels are made** as the experimental variable:

- **Corpus:** 189,279 cadences from 12 confirmed planet hosts, labelled from published ephemerides rather than from the photometry itself.
- **Labels matter more than architecture:** across label sources, precision–recall varies by **29×**; across six classifier families it varies by only **1.8×**.
- **Self-labelling inflates scores:** labels from an isolation forest fitted on the classifier's own features score AUC **0.9915**, but that number measures circularity.
- **With correct labels:** AUC **0.788**, at 5.3× the prevalence baseline, evaluated star-disjoint so no star appears in both training and test.
- **The ceiling is physical:** median single-cadence SNR is 2.10, which caps per-cadence AUC at **0.932**. A Box Least Squares search recovers **8 of 12** orbital periods from one sector, showing that phase-folding, not model capacity, is what exposes the transit.

## 🛠️ Tech stack

**Web app:** React 18 · TypeScript · Vite · Tailwind CSS · lucide-react · NASA Open APIs · deployed on Vercel
**ML:** Python · lightkurve · scikit-learn (IsolationForest) · XGBoost · Gradio on Hugging Face Spaces

## 🚀 Run locally

```bash
git clone https://github.com/astral-fate/Astro-Hunters.git
cd Astro-Hunters
npm install
cp .env.example .env    # add your free key from https://api.nasa.gov
npm run dev
```

Without a key, the app falls back to NASA's `DEMO_KEY`, which works but is heavily rate-limited.

## 🔗 Links

| | |
|---|---|
| 🚀 Live web app | https://astro-hunters.vercel.app/ |
| 🤗 Model demo (Space) | https://huggingface.co/spaces/FatimahEmadEldin/Astro-Hunters |
| 🤗 Model, weights & corpus | https://huggingface.co/FatimahEmadEldin/Astro-Hunters-Transit-Detector |
| 💻 Model training code | https://github.com/astral-fate/Astro-Hunters-Model-traning |
| 📄 Paper | https://arxiv.org/abs/2608.18172 |
| 🛰️ Space Apps team page | https://www.spaceappschallenge.org/2025/find-a-team/astro-hunter/ |
| 🎨 Presentation | [Canva deck](https://www.canva.com/design/DAG02zCClOM/vhDptGnE4Sc7aeHA2kPhxw/view) |

## 🙏 Acknowledgements

Data from NASA's **TESS** mission via MAST and the **NASA Exoplanet Archive**. Live data from the **NASA Open APIs** and **EONET**. Built for the **NASA International Space Apps Challenge 2025**.

---

<div align="center">

Made by [Fatimah Emad Eldin](https://github.com/astral-fate) · [LinkedIn](https://www.linkedin.com/in/astral-fate/) · [Hugging Face](https://huggingface.co/FatimahEmadEldin)

</div>
