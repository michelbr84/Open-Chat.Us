# OpenChat

<p align="center">
  <img src="https://github.com/michelbr84/neon-chat-pulse/blob/main/openchat.png" alt="OpenChat Banner" width="600"/>
</p>

**OpenChat** is a modern, open-source real-time community chat platform designed for seamless public and private conversations. Built with security, privacy, and user experience in mind, it features advanced moderation tools, AI bot integration, and full crypto donation support.

---

## 🚀 Features

### Core Chat Features
- **Open public chat** with instant messaging for everyone
- **Private messaging** with unread notifications and real-time updates
- **AI Bot integration** via n8n webhook for automated responses
- **File attachments** with drag-and-drop support for images, documents, and media
- **Threaded replies** to organize conversations and maintain context
- **Message reactions** with emoji picker and real-time updates
- **Live user presence** tracking with online/offline status

### User Experience
- **Guest and member support** - Chat as a guest or register for advanced features
- **Multi-theme UI** - Neon (default), Dark, and Light modes
- **Mobile-first responsive design** with touch-optimized interactions
- **Slash commands** for quick actions (/help, /clear, /theme, etc.)
- **Emoji autocomplete** with comprehensive emoji system
- **User mentions** with autocomplete and notifications
- **Message search and filtering**

### Security & Moderation
- **Advanced security** - CSP, XSS protection, RLS, rate limiting
- **Content moderation** - Automated filtering and manual review tools
- **Guest user protection** - Prevents impersonation and abuse
- **Audit logging** - Comprehensive security event tracking
- **Input sanitization** - DOMPurify integration for safe content

### Additional Features
- **Crypto donations** - Bitcoin and Ethereum QR codes with easy copy/paste
- **Achievement system** - Gamified user engagement
- **User reputation** - Community-driven trust system
- **No ads, no tracking** - Privacy-first approach

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, ShadCN UI
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Security:** DOMPurify, advanced CSP, comprehensive audit logs
- **AI Integration:** n8n workflow automation with webhook endpoints
- **Deployment:** Vercel, Netlify, or Supabase Hosting

---

## 🔥 Demo

> **Live Preview:** [https://open-chat.us](https://open-chat.us)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- (Optional) n8n instance for AI bot integration

### 1. Clone the repository

```bash
git clone https://github.com/michelbr84/neon-chat-pulse.git
cd openchat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required: Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: AI Bot Integration
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

### 4. Set up Supabase

1. Create a new Supabase project
2. Run the provided database migrations (see `supabase/migrations/`)
3. Enable authentication providers in Supabase dashboard
4. Configure Row Level Security policies

### 5. Run locally

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## 📋 Project Status & ToDo

### ✅ Recently Implemented Features

#### Security & Infrastructure
- **CSP hardening** - Removed unsafe directives, added security headers
- **Input sanitization** - DOMPurify integration with content filtering
- **Database security** - RLS policies for all sensitive tables
- **Guest user protection** - Enhanced validation and impersonation prevention
- **Audit logging** - Comprehensive security event tracking
- **Rate limiting** - Client and server-side protection

#### Chat Features
- **AI Bot integration** - Complete n8n webhook integration with real-time updates
- **Private messaging** - Unread indicators, notifications, conversation management
- **File attachments** - Drag-and-drop support with security validation
- **Threaded replies** - Organized conversation context
- **Message reactions** - Real-time emoji reactions with counts
- **Slash commands** - /help, /clear, /theme with autocomplete
- **Emoji system** - Comprehensive picker with autocomplete

#### User Experience
- **Mobile optimization** - Touch-friendly responsive design
- **Theme system** - Neon, Dark, Light modes with persistence
- **User presence** - Real-time online/offline status tracking
- **Achievement system** - Gamified user engagement
- **Message formatting** - Markdown support with live preview

### 🚧 Current Known Issues & Pending Tasks

#### High Priority
- [ ] **Performance optimization** - Message pagination for large conversations
- [ ] **Error handling** - Improved offline/connection error states
- [ ] **Mobile keyboard issues** - iOS Safari input focus improvements
- [ ] **Notification permissions** - Browser notification setup
- [ ] **Message editing** - Allow users to edit their own messages

#### Medium Priority
- [ ] **User profiles** - Extended profile information and avatars
- [ ] **Message deletion** - Soft delete with admin override
- [ ] **Advanced search** - Full-text search with filters
- [ ] **Content export** - Message history export functionality
- [ ] **Admin dashboard** - Enhanced moderation and analytics tools

#### Testing & Documentation
- [ ] **Cross-browser testing** - Comprehensive compatibility testing
- [ ] **API documentation** - Detailed developer documentation
- [ ] **Performance testing** - Load testing for high concurrent users
- [ ] **Security audit** - Third-party security assessment

### 🚀 Future Roadmap

#### Phase 1: Chat Rooms (Next Major Feature)
- **Room creation** - Users can create custom chat rooms
- **Room administration** - Owner controls, moderator permissions
- **Privacy options** - Public, private, invite-only, password-protected rooms
- **Room discovery** - Browse and join public rooms
- **Member management** - Invite, remove, ban users from rooms

#### Phase 2: Public API
- **RESTful API** - Full CRUD operations for chat functionality
- **WebSocket API** - Real-time event streaming for external integrations
- **Authentication** - API key management and OAuth integration
- **Rate limiting** - Per-API-key rate limiting and usage analytics
- **Documentation** - OpenAPI specification and integration guides

#### Phase 3: Advanced Features
- **Voice messages** - Audio recording and playback
- **Video chat** - WebRTC peer-to-peer video calls
- **Message translation** - Multi-language support
- **Custom themes** - User-created theme system
- **Plugin system** - Third-party feature extensions

---

## 🛡️ Security

OpenChat implements enterprise-grade security:

### Security Features
- **Input Sanitization:** All user inputs sanitized using DOMPurify
- **Content Security Policy:** Strict CSP headers prevent XSS attacks
- **Row Level Security:** Database access controlled via Supabase RLS policies
- **Rate Limiting:** Protection against spam and DoS attacks (client & server)
- **Authentication:** Secure authentication with session management
- **Audit Logging:** Comprehensive security event tracking
- **Guest Protection:** Prevents impersonation and unauthorized access

### Security Headers
- Content-Security-Policy with strict directives
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

> **Note:** See [SECURITY.md](SECURITY.md) for detailed security information and vulnerability reporting.

---

## 🔧 AI Bot Integration

OpenChat supports AI chatbot integration through n8n workflows:

### Setup Requirements
1. **n8n Instance:** Self-hosted or n8n.cloud account
2. **Webhook Configuration:** Set up webhook to receive chat messages
3. **Response Format:** Bot responses must follow specific JSON format
4. **Authentication:** Configure webhook security tokens

### Bot Features
- **Real-time responses** - Immediate bot replies to user messages
- **Context awareness** - Bot receives message history and user context
- **Customizable personality** - Configure bot behavior through n8n workflows
- **Rate limiting** - Built-in protection against bot spam

### Integration Guide
See detailed integration documentation in `/docs/ai-bot-integration.md`

---

## 📱 Mobile Support

OpenChat is designed mobile-first with:

- **Touch-optimized UI** - Large touch targets, gesture support
- **Responsive layout** - Adaptive design for all screen sizes
- **iOS/Android testing** - Cross-platform compatibility
- **PWA features** - App-like experience on mobile devices
- **Offline support** - Basic functionality when disconnected

---

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Supabase Hosting
1. Install Supabase CLI
2. Link to your Supabase project
3. Deploy with: `supabase hosting deploy`

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_N8N_WEBHOOK_URL=your_production_webhook_url
```

---

## 🪙 Crypto Donations

Support this open-source project!

- **Bitcoin (BTC):** `3FV6kFsNTXEzPpLKKG5SrChXdgGSSNFN9P`
- **Ethereum (ETH):** `0xe527C13F23799e5a7d038B70765128c5e928f07d`

You can also donate via the "Donate" button in the app.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### Development Setup
1. Fork this repository
2. Clone your fork locally
3. Follow the Quick Start guide above
4. Create a feature branch: `git checkout -b feature/my-feature`
5. Make your changes and test thoroughly
6. Commit with clear messages: `git commit -am 'Add my feature'`
7. Push to your branch: `git push origin feature/my-feature`
8. Create a Pull Request

### Contribution Guidelines
- **Code Style:** Follow existing TypeScript/React patterns
- **Testing:** Test your changes on desktop and mobile
- **Security:** Consider security implications of all changes
- **Documentation:** Update relevant documentation
- **Performance:** Ensure changes don't degrade performance

### Areas Needing Help
- 🐛 **Bug fixes** - Check GitHub issues for known bugs
- 🎨 **UI/UX improvements** - Mobile experience enhancements
- 🔒 **Security auditing** - Review code for vulnerabilities
- 📱 **Mobile testing** - Cross-device compatibility testing
- 🌐 **Accessibility** - WCAG compliance improvements
- 📚 **Documentation** - API docs, user guides, developer docs

---

## 📚 Documentation

- **User Guide:** [/docs/user-guide.md](docs/user-guide.md)
- **API Documentation:** [/docs/api.md](docs/api.md)
- **Deployment Guide:** [/docs/deployment.md](docs/deployment.md)
- **Security Guide:** [SECURITY.md](SECURITY.md)
- **Contributing Guide:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 License

This project is [MIT Licensed](LICENSE) - feel free to use it for personal or commercial projects.

---

## 🙏 Acknowledgements

- [Supabase](https://supabase.com/) - Backend infrastructure and real-time database
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful, accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Fast build tool and development server
- [DOMPurify](https://github.com/cure53/DOMPurify) - XSS sanitization
- [Lucide React](https://lucide.dev/) - Beautiful icons
- [date-fns](https://date-fns.org/) - Date utility library
- [All Open Source Contributors](https://github.com/michelbr84/neon-chat-pulse/graphs/contributors)

---

## 📈 Project Stats

- **Lines of Code:** ~15,000+ (TypeScript/React)
- **Components:** 50+ reusable UI components
- **Security Features:** 15+ implemented security measures
- **Database Tables:** 20+ with comprehensive RLS policies
- **Mobile Optimized:** 100% responsive design
- **Performance:** <2s initial load time
- **Security Score:** A+ rating with implemented best practices

---

> **OpenChat** – Connect, share, and learn together.  
> Powered by open source. Built for the community.

---

## 📞 Support & Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/michelbr84/neon-chat-pulse/issues)
- **Security Reports:** security@open-chat.us
- **General Contact:** contact@open-chat.us
- **Live Demo:** [https://open-chat.us](https://open-chat.us)

---

*Last updated: July/29 2025*