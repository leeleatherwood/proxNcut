# Contributing to proxNcut

Thank you for your interest in contributing! We welcome contributions from the community.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally.
3.  **Install dependencies**: `npm install`.
4.  **Create a branch** for your feature or fix: `git checkout -b feature/my-new-feature`.

## Development Workflow

### Running Locally
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Code Style
- We use **TypeScript** for type safety. Please ensure no `any` types are used unless absolutely necessary.
- We use **ESLint** and **Prettier**. Run `npm run lint` before committing.

### Project Structure
- `src/core`: Core interfaces and types. **Do not modify** unless you are changing the architecture.
- `src/modules`: Where plugins live. Add new parsers, providers, or machines here.
- `src/services`: Business logic.
- `src/components`: React UI components.

## How to Contribute

### Adding a New Parser
If you want to add support for a new deck builder export format:
1.  Create a new file in `src/modules/parsers/`.
2.  Implement the `IDeckParser` interface.
3.  Register it in `src/config/plugins.ts`.
4.  Submit a Pull Request with example input data.

### Adding a New Game
1.  Define the game in `src/modules/games/`.
2.  Create a Provider in `src/modules/providers/`.
3.  Register both in `src/config/plugins.ts`.

## Pull Request Guidelines

1.  **Descriptive Title**: Explain what the PR does.
2.  **Context**: Link to any relevant issues.
3.  **Test Plan**: Explain how you verified your changes.
4.  **Screenshots**: If changing UI, please include before/after screenshots.

## License
By contributing, you agree that your contributions will be licensed under the GNU General Public License v3.0.
