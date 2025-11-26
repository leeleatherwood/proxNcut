# proxNcut ✂️
Universal Card Game Proxy Generator & Cutting Machine Companion

Convert decklists into print-ready PDFs and cut files. Designed for any card game (with built-in support for Magic: The Gathering), featuring intelligent layout calculation, plugin-based data providers, and native support for Silhouette cutting machines.

![License](https://img.shields.io/badge/license-GPLv3-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-16.0-black)

![proxNcut Screenshot](public/screenshot_placeholder.png)

## ✨ Features

*   🔌 **Plugin Architecture** - Extensible design for Parsers, Providers, and Machines using the Registry pattern. Easily add support for Pokémon, Lorcana, or custom games.
*   🃏 **Multi-Format Support** - Auto-detects and imports from popular deck builders. Includes built-in parsers for Archidekt, Moxfield, Topdeck.gg, and MTGO formats.
*   ✂️ **Silhouette Integration** - Native support for Silhouette registration marks (Type 1) and DXF cut files.
*   📏 **Precision Layouts** - 300 DPI processing with mirror bleed (~2mm) for perfect edge-to-edge cuts.
*   🚀 **Local Caching** - Caches card data and images locally to minimize API usage and speed up generation.
*   📄 **PDF Export** - Generates print-ready PDFs for Letter and A4 paper sizes.
*   🖐️ **Hand Cut Mode** - Generates simple grid layouts with cut guides for manual cutting.

## 📋 Requirements

*   Node.js 20+
*   npm (or yarn/pnpm)

## 🚀 Quick Start

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/leeleatherwood/proxNcut.git
    cd proxNcut
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🖥️ Usage

### Web Interface Workflow

1.  **Paste Decklist**: Copy your decklist from your favorite builder (Archidekt, Moxfield, etc.) into the left panel.
2.  **Auto-Detect**: The system will automatically identify the format and fetch card data from the configured provider (e.g., Scryfall).
3.  **Configure Layout**:
    *   **Cutter**: Choose "Silhouette Cameo" or "Hand Cut".
    *   **Paper Size**: Letter or A4.
    *   **Sensor Safe**: Toggle to avoid printing in registration mark exclusion zones.
4.  **Preview**: See a live render of your pages in the center panel.
5.  **Export**:
    *   **Download PDF**: Get the printable file.
    *   **Download Cut File**: Get the `.dxf` (Silhouette) or instructions (Hand).

## 🔧 How It Works

### Architecture & Extensibility
This project uses a robust **Plugin/Adapter Architecture** centered around a Registry pattern. This means the core application logic (state management, UI, rendering) is completely decoupled from the specific details of any game, data source, or cutting machine.

*   **Providers (`ICardProvider`)**: Responsible for fetching card data.
    *   *Current:* `ApiCardProvider` (Scryfall/MTG).
    *   *Potential:* Pokémon TCG API, Lorcana API, or even a local CSV file provider for custom cards.
*   **Parsers (`IDeckParser`)**: Responsible for converting text input into a standardized list of cards.
    *   *Current:* Archidekt, Moxfield, Topdeck.gg.
    *   *Potential:* TCGPlayer export, custom spreadsheet formats, or other game-specific deck builders.
*   **Machines (`ICuttingMachine`)**: Responsible for calculating layouts and generating cut files.
    *   *Current:* Silhouette Cameo (DXF), Hand Cut (Guides).
    *   *Potential:* Cricut (SVG), Brother ScanNCut (FCM), or Laser Cutter (G-Code) support.
*   **Games (`IGame`)**: Defines game-specific constants like card dimensions.
    *   *Current:* Magic: The Gathering.
    *   *Potential:* Any standard or non-standard card size (Bridge, Tarot, Mini).

Adding support for a new game is as simple as registering a new Game definition and a corresponding Provider. The rest of the application (layout engine, PDF generation, UI) automatically adapts.

### Technical Strategy (Silhouette Integration)
1.  **Layouts as Data**: Static configuration defines exact `x` and `y` coordinates to match Silhouette Studio's expectations.
2.  **300 DPI Coordinate System**: All internal calculations use pixels at 300 DPI to prevent floating-point rounding errors.
3.  **Mirror Bleed**: Extends card edge pixels outward by ~2mm to handle slight cutter misalignment.
4.  **Registration Templates**: Uses pre-defined background images for Type 1 registration marks to ensure optical sensor recognition.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool was vibe coded using GitHub Copilot by an author who freely admits to knowing absolutely nothing about Next.js.
