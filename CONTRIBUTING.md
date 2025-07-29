# Contributing to OpenChat

Thank you for your interest in contributing to OpenChat! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- A Supabase account (for database setup)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/neon-chat-pulse.git
   cd openchat
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 How to Contribute

### Reporting Bugs
- Use GitHub Issues to report bugs
- Include steps to reproduce, expected behavior, and actual behavior
- Add screenshots or videos if helpful
- Specify your browser, OS, and device type

### Suggesting Features
- Open a GitHub Issue with the "enhancement" label
- Describe the feature in detail
- Explain the use case and benefits
- Consider implementation complexity

### Code Contributions

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing code patterns
   - Write clear, descriptive commit messages
   - Test your changes thoroughly

3. **Test Your Changes**
   - Test on desktop and mobile devices
   - Verify security implications
   - Ensure no performance degradation
   - Check accessibility compliance

4. **Submit a Pull Request**
   - Provide a clear description of changes
   - Reference related issues
   - Include screenshots/videos for UI changes
   - Update documentation if needed

## 🎯 Areas Needing Help

### High Priority
- **Mobile Testing** - iOS Safari, Android Chrome compatibility
- **Accessibility** - WCAG 2.1 AA compliance
- **Performance** - Optimization for low-end devices
- **Security** - Code review and vulnerability assessment

### Medium Priority
- **Documentation** - User guides, API documentation
- **UI/UX** - Design improvements and user experience
- **Testing** - Unit tests, integration tests, E2E tests
- **Internationalization** - Multi-language support

### Feature Requests
- **Chat Rooms** - Room creation and management
- **Voice Messages** - Audio recording and playback
- **Message Translation** - Multi-language support
- **Enhanced Search** - Full-text search with filters

## 🏗️ Code Guidelines

### TypeScript/React Patterns
```tsx
// ✅ Good: Use proper typing
interface Props {
  message: string;
  onSend: (content: string) => void;
}

// ✅ Good: Use functional components with hooks
export const ChatMessage: React.FC<Props> = ({ message, onSend }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="message-container">
      {/* Component content */}
    </div>
  );
};

// ❌ Avoid: Any types or inline styles
const Component = ({ data }: any) => (
  <div style={{ color: 'red' }}>Content</div>
);
```

### Styling Guidelines
```tsx
// ✅ Good: Use design system tokens
<Button variant="primary" size="sm">
  Click me
</Button>

// ✅ Good: Use semantic CSS classes
<div className="flex items-center gap-2 p-4 rounded-lg bg-card">

// ❌ Avoid: Hardcoded colors or magic numbers
<div style={{ backgroundColor: '#ff0000', padding: '16px' }}>
```

### Security Considerations
```tsx
// ✅ Good: Sanitize user input
import { sanitizeMessageContent } from '@/utils/sanitization';

const content = sanitizeMessageContent(userInput);

// ✅ Good: Validate data
if (!isValidGuestName(guestName)) {
  throw new Error('Invalid guest name');
}

// ❌ Avoid: Direct HTML rendering
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile browsers (iOS Safari, Android Chrome)
- [ ] Different screen sizes (320px to 1920px+)
- [ ] Both authenticated and guest users
- [ ] Dark and light themes
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Security Testing
- [ ] Input validation for all user inputs
- [ ] XSS protection for dynamic content
- [ ] CSRF protection for sensitive operations
- [ ] Rate limiting functionality
- [ ] Authentication and authorization flows

## 📝 Commit Message Format

Use conventional commits for clear history:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(chat): add message reactions
fix(mobile): resolve iOS keyboard issues
docs(readme): update installation instructions
```

## 🔒 Security Guidelines

### Sensitive Information
- Never commit API keys, passwords, or secrets
- Use environment variables for configuration
- Review all changes for security implications
- Report security vulnerabilities via email to security@open-chat.us

### Code Security
- Sanitize all user inputs
- Validate data on both client and server
- Use prepared statements for database queries
- Implement proper authentication checks
- Follow principle of least privilege

## 📚 Documentation Standards

### Code Comments
```tsx
/**
 * Handles secure message sanitization and validation
 * @param content - Raw message content from user
 * @param options - Sanitization options
 * @returns Sanitized and validated message content
 */
export const sanitizeMessage = (content: string, options?: SanitizeOptions) => {
  // Implementation
};
```

### README Updates
- Keep feature lists current
- Update installation instructions
- Add screenshots for new features
- Document breaking changes

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes for significant contributions
- Given credit in the application's about section
- Invited to join the core team for substantial ongoing contributions

## ❓ Questions?

- **General Questions:** Open a GitHub Discussion
- **Bugs:** Create a GitHub Issue
- **Security:** Email security@open-chat.us
- **Features:** Open a GitHub Issue with enhancement label

Thank you for contributing to OpenChat! 🚀