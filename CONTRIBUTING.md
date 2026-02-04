# 🤝 Contributing to SQL Query Management Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

> ⚠️ **Security Notice**: If you're contributing security-related changes or have discovered a vulnerability, please review the [Security](#security-contributions) section below and [SECURITY.md](SECURITY.md) before proceeding.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Security Contributions](#security-contributions)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Security Contributions

### 🔒 Reporting Security Vulnerabilities

**⚠️ CRITICAL: Do NOT create public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability:

1. **DO NOT** create a public issue or pull request
2. Follow the responsible disclosure process in [SECURITY.md](SECURITY.md)
3. Report privately via GitHub Security Advisories
4. Wait for maintainer response before public disclosure

### Security-Related Contributions

When contributing security improvements:

1. **Review First**: Read [SECURITY.md](SECURITY.md) thoroughly
2. **Test Carefully**: Security changes require extensive testing
3. **Document Impact**: Clearly explain security implications
4. **Breaking Changes**: Security fixes may require breaking changes - document them
5. **No Secrets**: Never include actual secrets, keys, or credentials in code or commits

### Security Checklist for Contributors

Before submitting security-related PRs:

- [ ] No hardcoded secrets or credentials
- [ ] No sensitive information in commit history
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS prevention measures in place
- [ ] Authentication/authorization properly tested
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include sensitive data
- [ ] Dependencies checked for known vulnerabilities (`npm audit`)
- [ ] Security implications documented in PR description

### Examples of Security Contributions

**Welcome:**
- Implementing additional security features (MFA, token revocation)
- Improving input validation and sanitization
- Enhancing audit logging
- Fixing authentication/authorization issues
- Improving encryption implementations
- Adding security tests
- Documenting security best practices

**Requires Extra Caution:**
- Changes to authentication logic
- Modifications to credential encryption
- Database query execution logic
- Permission checking code
- Token generation/validation

### Security Development Environment

For testing security features:

```bash
# Use separate test database (never production!)
export DATABASE_URL=postgresql://testuser:testpass@localhost:5432/test_db

# Use test secrets
export JWT_SECRET=test-secret-not-for-production
export ENCRYPTION_KEY=test1234567890test1234567890te

# Enable debug logging
export LOG_LEVEL=debug
```

**Never:**
- Test with production databases
- Use production credentials
- Commit test credentials that look real
- Store test data with real personal information

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/sql-query-dashboard.git
   cd sql-query-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp scheduler/.env.example scheduler/.env
   # Edit .env files with your configuration
   ```
   
   > ⚠️ **Security**: Use strong, unique secrets even in development. Never commit `.env` files.
   
   Generate secure secrets:
   ```bash
   # JWT Secret
   openssl rand -base64 48
   
   # Encryption Key (exactly 32 characters)
   openssl rand -base64 32 | cut -c1-32
   ```

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Verify setup**
   ```bash
   # Check if all services are running
   docker-compose ps
   
   # Access the application
   open http://localhost:3000
   ```

## Development Workflow

### Branch Strategy

```
main (production-ready code)
  ├── develop (integration branch)
  │   ├── feature/query-execution
  │   ├── feature/monaco-editor
  │   ├── bugfix/auth-token-expiry
  │   └── enhancement/ui-improvements
```

### Creating a Feature Branch

```bash
# Update your local repository
git checkout develop
git pull origin develop

# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes...

# Push to your fork
git push origin feature/your-feature-name
```

### Branch Naming Convention

- **Features**: `feature/short-description`
- **Bug Fixes**: `bugfix/issue-description`
- **Enhancements**: `enhancement/what-you-improve`
- **Hotfixes**: `hotfix/critical-issue`

## Coding Standards

### TypeScript

```typescript
// ✅ Good
interface UserData {
  id: number;
  username: string;
  email: string;
}

export const fetchUser = async (id: number): Promise<UserData> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

// ❌ Bad
export const fetchUser = async (id: any) => {
  const response = await apiClient.get('/users/' + id);
  return response.data;
};
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// ❌ Bad - Missing types
export const Button = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### API Controllers

```typescript
// ✅ Good - Proper error handling
export const createQuery = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const query = await Query.create({
      ...req.body,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: query
    });
  } catch (error) {
    next(error);
  }
};

// ❌ Bad - No error handling
export const createQuery = async (req, res) => {
  const query = await Query.create(req.body);
  res.json(query);
};
```

### Code Style

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings (except JSON)
- **Semicolons**: Use them consistently
- **Line Length**: Max 100 characters
- **Naming**:
  - Variables/Functions: `camelCase`
  - Classes/Interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.ts` or `PascalCase.tsx` (React components)

### File Structure

```
// ✅ Good organization
src/
├── components/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── Button.module.css
├── pages/
│   ├── Dashboard.tsx
│   └── Dashboard.test.tsx
├── services/
│   ├── api.ts
│   └── auth.ts
└── utils/
    ├── helpers.ts
    └── constants.ts
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Good commits
git commit -m "feat(backend): implement query execution engine"
git commit -m "fix(frontend): resolve authentication token expiry issue"
git commit -m "docs: update README with new setup instructions"
git commit -m "refactor(scheduler): improve cron expression parsing"

# Bad commits
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "wip"
```

### Detailed Commit

```bash
git commit -m "feat(backend): add email notification service

- Implement SMTP configuration
- Add email templates for success/failure
- Integrate with schedule execution
- Add tests for email sending

Closes #123"
```

## Pull Request Process

### Before Creating a PR

1. **Update your branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Check linting**
   ```bash
   npm run lint
   ```

4. **Build successfully**
   ```bash
   npm run build
   ```

### PR Title Format

```
[Type] Short description

Examples:
[Feature] Add Monaco Editor integration
[Fix] Resolve schedule execution bug
[Enhancement] Improve dashboard performance
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
Related to #456
```

### Review Process

1. At least one approval required
2. All CI checks must pass
3. No merge conflicts
4. Code review feedback addressed

## Testing Guidelines

### Unit Tests (Jest)

```typescript
// Example: backend/src/services/__tests__/queryExecutor.test.ts
import { QueryExecutor } from '../queryExecutor';

describe('QueryExecutor', () => {
  let executor: QueryExecutor;

  beforeEach(() => {
    executor = new QueryExecutor();
  });

  it('should execute a SELECT query successfully', async () => {
    const result = await executor.execute({
      query: 'SELECT * FROM users',
      connectionId: 1
    });

    expect(result.success).toBe(true);
    expect(result.rows).toBeDefined();
  });

  it('should handle execution errors', async () => {
    await expect(
      executor.execute({ query: 'INVALID SQL', connectionId: 1 })
    ).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// Example: backend/src/__tests__/integration/auth.test.ts
import request from 'supertest';
import app from '../../index';

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### React Component Tests

```typescript
// Example: frontend/src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct label', () => {
    render(<Button label="Click Me" onClick={() => {}} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Project-Specific Guidelines

### Adding a New API Endpoint

1. Create model (if needed) in `backend/src/models/`
2. Create controller in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Add tests
5. Update API documentation
6. Update FEATURES.md

### Adding a New Frontend Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Update navigation in `frontend/src/components/Layout.tsx`
4. Create required API hooks
5. Add tests
6. Update documentation

### Adding a Database Model

1. Create model in `backend/src/models/`
2. Add to `backend/src/models/index.ts`
3. Update `database/init.sql` with schema
4. Create migration (if needed)
5. Update ARCHITECTURE.md

## Getting Help

- **Documentation**: Check README.md and ARCHITECTURE.md
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our Discord server (if available)

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉
