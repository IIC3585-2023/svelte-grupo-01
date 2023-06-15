# Svelte - Grupo 1: Competitive Wordle with WebRTC

This project is a Competitive Wordle with a host and multiple clients. The host can create a game with multiple words (store in indexDB) to multiple guesses usign WebRTC. The clients can join the game using a QR code from the host.

The resources used for this project are:

- [Web Page](https://iic3585-2023.github.io/svelte-grupo-01/)
- [Presentation](/slides/svelte.pdf)

## Contributors

| Name                | Email              | Github                                           |
| ------------------- | ------------------ | ------------------------------------------------ |
| Benjamín Vicente    | benjavicente@uc.cl | [@benjavicente](https://github.com/benjavicente) |
| Jose Antonio Castro | jacastro18@uc.cl   | [@Baelfire18](https://github.com/Baelfire18)     |
| José Madriaza       | jm.madriaza@uc.cl  | [@LeoMo-27](https://github.com/LeoMo-27)         |


## Stack

- Node 18.0.0
- Svelte 3.54.0
- SvelteKit 1.5.0
- PeerJS 1.4.7
- Typescript
- TailwindCSS
- RxJS
- QRCode

## How to run

### Install pnpm and dependencies

```bash
npm install -g pnpm
```

```bash
pnpm install
```

### Development Server

Start the development server on `http://localhost:5173`:

```bash
pnpm dev
```

### Production

Build the application for production:

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```
