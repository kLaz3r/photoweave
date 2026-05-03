# Contributing to PhotoWeave

Thank you for your interest in contributing to PhotoWeave! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to learn and improve PhotoWeave together.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm 10.0.0 or later
- Git

### Setting Up

1. **Fork the Repository**

   Fork the repository on GitHub and clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/photoweave.git
   cd photoweave
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**

   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**

   ```bash
   pnpm dev
   ```

## Development Workflow

### Branching Strategy

- **`main`**: Production-ready code
- **`beta`**: Development branch
- **`feature/*`**: Feature branches
- **`fix/*`**: Bug fix branches

### Creating a Branch

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Or a fix branch
git checkout -b fix/my-fix
```

### Making Changes

1. **Make your changes**
2. **Run tests**: `pnpm test`
3. **Run linter**: `pnpm lint`
4. **Format code**: `pnpm format:write`
5. **Type check**: `pnpm typecheck`

### Committing Changes

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(collage): add masonry layout algorithm
fix(worker): handle worker creation failure
docs(readme): update installation instructions
```

### Pushing Changes

```bash
# Push to your fork
git push origin feature/my-feature
```

## Pull Requests

### Creating a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the PR

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests passing

## Checklist

- [ ] Code follows style guide
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No linting errors
- [ ] Added tests
```

### Review Process

1. **Automated Checks**: CI will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any feedback or questions
4. **Approval**: Once approved, your PR will be merged

## Coding Standards

### TypeScript

- Use explicit types for all functions and components
- Use `interface` for object shapes that may be extended
- Use `type` for unions and primitives
- Use type-only imports for types

### React

- Use functional components with hooks
- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Use `"use client"` directive for interactive components

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Write clear, descriptive names
- Add comments for complex logic

## Testing

### Writing Tests

Write tests for new features and bug fixes:

```typescript
// src/lib/collage/layouts/grid.test.ts
import { describe, it, expect } from "vitest";
import { gridPack } from "./grid";

describe("gridPack", () => {
  it("should create a grid with correct dimensions", () => {
    const images = [
      { width: 100, height: 100, aspect: 1 },
      { width: 100, height: 100, aspect: 1 },
    ];

    const blocks = gridPack(images, 200, 200, 10);

    expect(blocks).toHaveLength(2);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Documentation

### Updating Documentation

Update documentation when you:

- Add new features
- Change existing behavior
- Fix bugs
- Improve code organization

### Documentation Files

- `docs/`: Main documentation
- `README.md`: Project overview
- Code comments: Inline documentation

## Reporting Issues

### Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Browser, OS, version
6. **Screenshots**: If applicable

### Feature Requests

When requesting features, include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why this feature is needed
3. **Alternatives**: Any alternatives you considered
4. **Additional Context**: Any other relevant information

## Questions

### Getting Help

- Check existing documentation
- Search existing issues
- Ask questions in issues (with the "question" label)

### Discussions

Use GitHub Discussions for:

- Questions
- Ideas
- General discussion

## License

By contributing to PhotoWeave, you agree that your contributions will be licensed under the project's license.

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation

## Next Steps

- Read the [Development Guide](./07-development-guide.md) for development workflows
- Check the [Code Style Guide](./08-code-style.md) for coding conventions
- Review the [Architecture Documentation](./03-architecture.md) to understand the codebase

Thank you for contributing to PhotoWeave!
