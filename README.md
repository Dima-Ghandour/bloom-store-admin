# Bloom Store | متجر بتلات

Arabic (RTL) e-commerce demo for flowers and houseplants.
متجر إلكتروني تجريبي باللغة العربية للورود والنباتات.

**Live demo:** https://dima-ghandour.github.io/bloom-store/

## Features

- Product grid with 12 flowers and houseplants
- Live search, category filter and sorting (price, name)
- Shopping cart with quantity controls, shipping calculation (free over $50)
- Cart saved in the browser (`localStorage`)
- Checkout form with validation
- Fully RTL layout, responsive on mobile and desktop
- Accessible labels and reduced-motion support

## Built with

- HTML5
- CSS3
- JavaScript (vanilla, no frameworks)
- [Bootstrap 5.3 RTL](https://getbootstrap.com/)

## Project structure

```
bloom-store/
├── index.html
├── css/style.css
├── js/app.js
└── images/
```

## Run locally

Download the project and open `index.html` in your browser.
An internet connection is needed to load Bootstrap and the Cairo font from a CDN.

## Customize

Edit the `PRODUCTS` array at the top of `js/app.js` to change products, prices and images.

## Note

This is a front-end demo. No real orders or payments are processed.
