# fnoneshot

**API testing in 90KB. No account required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Live Site](https://fnoneshot.pages.dev) (placeholder)

---

Pick a method. Enter a URL. Hit Send. See the response with timing.

```
GET  https://api.example.com/users  -->  200 OK  247ms
```

## The problem

- **Postman** requires sign-in and weighs 300MB+
- **Insomnia** added mandatory accounts
- **Hoppscotch** is excellent but growing complex
- **Bruno** is desktop-only

You just want to fire a request and see what comes back. That's fnoneshot.

## Comparison

| Feature | fnoneshot | Postman | Hoppscotch | Bruno | Insomnia |
|---|---|---|---|---|---|
| Size | ~90KB | 300MB+ | ~2MB | ~80MB | 200MB+ |
| Account required | No | Yes | No | No | Yes |
| Web-based | Yes | No | Yes | No | No |
| Offline-capable | Yes | Yes | Partial | Yes | Yes |
| Open source | Yes | No | Yes | Yes | No |

## Features

- **7 HTTP methods**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Custom headers**: add as many key-value pairs as you need
- **Request body**: visible for POST/PUT/PATCH, with monospace editing
- **Response viewer**: status code, headers, body with JSON highlighting, timing in ms
- **Request history**: last 20 requests saved in localStorage
- **CORS proxy toggle**: optional proxy for APIs that block browser requests
- **Keyboard-first**: Ctrl+Enter to send

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Send request |
| `Tab` | Navigate between fields |

## CORS

Browsers block cross-origin requests unless the server explicitly allows them. fnoneshot runs entirely in the browser, so it's subject to these restrictions.

**What you can do:**

1. **Enable the CORS proxy toggle** -- this routes requests through [corsproxy.io](https://corsproxy.io), a third-party proxy service. Your request data passes through their servers.
2. **Localhost requests** work without a proxy -- CORS isn't an issue for local development servers.
3. **If you control the API**, add `Access-Control-Allow-Origin` headers.

## Development

```bash
pnpm install
pnpm dev      # start dev server
pnpm build    # production build
pnpm preview  # preview production build
```

## Support

If fnoneshot saves you from opening a 300MB app, consider supporting development:

- [GitHub Sponsors](https://github.com/sponsors/fnrhombus)
- [Buy Me a Coffee](https://buymeacoffee.com/fnrhombus)

## License

MIT
