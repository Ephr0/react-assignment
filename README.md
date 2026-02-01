# Subways of Budapest 🚇

**Subways of Budapest** is a single-player, grid-based metro-building strategy game inspired by *Next Station: London*, adapted to the Budapest metro network.

The player builds four metro lines across a 10×10 city grid by drawing station cards and placing valid track segments while following strict placement, connectivity, and scoring rules. The goal is to maximize the final score through efficient planning, district coverage, river crossings, and junction creation.

## Tech Stack
- **Next.js**
- **React**
- **Tailwind CSS**

> Note: Although the original assignment restricted frameworks, this project was granted an explicit exception.

## Core Features
- Randomized game flow with four metro lines (M1–M4)
- Turn-based card drawing and track placement
- Rule-validated segment building (no crossings, loops, or illegal paths)
- Support for horizontal, vertical, and diagonal (45°) tracks
- Joker and special card mechanics
- Dynamic round and game scoring logic
- Timer-based gameplay
- Local state–driven rendering of the entire game board

## Scoring System
- District coverage and concentration bonuses
- Danube river crossings
- Railway station progression scoring
- Junction scoring for multi-line stations
- Final score aggregation across all rounds

## Project Status
- Core gameplay fully implemented
- Rules and scoring logic implemented and functional
- Visual scorecard display not included (logic exists)
- Local leaderboard UI not implemented




