# OpenChat

<p align="center">
  <img src="https://github.com/michelbr84/neon-chat-pulse/blob/main/openchat.png" alt="OpenChat Banner" width="600"/>
</p>

**OpenChat** is a modern, real-time, open community chat platform.  
It’s designed for seamless public and private conversations with a beautiful, mobile-friendly UI, advanced moderation tools, and full crypto donation support.

---

## 🚀 Features

- **Open public chat** with instant messaging for everyone
- **Private messaging** with unread notifications and real-time updates (for authenticated users)
- **Live user list:** See who is online
- **Guest and member support:** Chat as a guest or log in for advanced features
- **Multi-theme UI:** Neon (default), Dark, and Light modes
- **Mobile-first responsive design**
- **Crypto donations:** Bitcoin and Ethereum QR codes, easy copy/paste
- **Message search/filter**
- **Emoji reactions**
- **Content reporting and moderation tools**
- **Advanced security:** CSP, XSS protection, RLS, rate limiting, and more
- **No ads, no tracking—privacy first**

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, ShadCN UI
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Security:** DOMPurify, advanced CSP, audit logs
- **Deployment:** Vercel, Netlify, or Supabase Hosting

---

## 🔥 Demo

> **Live Preview:** [https://open-chat.us](https://open-chat.us)

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/michelbr84/neon-chat-pulse.git
cd openchat
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

* Copy `.env.example` to `.env.local` and set your Supabase credentials.

### 4. Run locally

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## 🪙 Crypto Donations

Support this open-source project!

* **Bitcoin (BTC):** `3FV6kFsNTXEzPpLKKG5SrChXdgGSSNFN9P`
* **Ethereum (ETH):** `0xe527C13F23799e5a7d038B70765128c5e928f07d`

You can donate via the "Donate" button in the app as well.

---

## 🛡️ Security

OpenChat is built with security best practices:

* **RLS policies** for all sensitive tables
* **Input sanitization** and content filtering
* **Strict CSP and security headers**
* **Real-time audit logging**
* **Rate limiting (database and client side)**
* **Guest and member isolation**

> **Note:** Password leak protection is available with Supabase Pro plan.

---

## 📱 Mobile Friendly

OpenChat is designed to work beautifully on all devices, with special care for touch and small screens.
If you notice any layout issues on your device, please open an issue!

---

## 📚 License

This project is [MIT Licensed](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a new Pull Request

For bug reports, suggestions, or feature requests, please open an [issue](https://github.com/yourusername/openchat/issues).

---

## 🙏 Acknowledgements

* [Supabase](https://supabase.com/)
* [ShadCN UI](https://ui.shadcn.com/)
* [date-fns](https://date-fns.org/)
* [DOMPurify](https://github.com/cure53/DOMPurify)
* [All Open Source Contributors](https://github.com/yourusername/openchat/graphs/contributors)

---

> OpenChat – Connect, share, and learn together.
> Powered by open source.

```

---

**Tip:**  
- Replace the `banner.png` URL with your actual banner (GitHub or CDN).
- Update `yourusername` everywhere with your GitHub username or org.
- Update the live preview link if needed.
- Add any extra contributors or project credits as you wish.

Let me know if you want the **About/Educational Purpose** section or anything else included!
```
