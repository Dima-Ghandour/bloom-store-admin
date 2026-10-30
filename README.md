# Bloom Store Admin | لوحة إدارة متجر بتلات

Arabic (RTL) admin dashboard for the [Bloom Store](https://github.com/Dima-Ghandour/bloom-store) demo shop.
لوحة إدارة عربية لمتابعة المبيعات والطلبات والمخزون.

**Live demo:** https://dima-ghandour.github.io/bloom-store-admin/

## Features

- Overview with KPI cards: sales, orders, average order value, low-stock products
- Daily sales line chart and sales-by-category doughnut chart (Chart.js)
- Top-selling products, with a 7 / 14 / 30 day range filter
- Orders table with search, status filter and inline status updates
- Product management: add, edit, delete and quick stock adjustment
- Low-stock and out-of-stock badges
- Light and dark mode, saved between visits
- Fully RTL, responsive layout
- Data persisted in the browser (`localStorage`)

## Built with

- HTML5
- CSS3
- JavaScript (vanilla)
- [Bootstrap 5.3 RTL](https://getbootstrap.com/)
- [Chart.js 4](https://www.chartjs.org/)

## Project structure

```
bloom-store-admin/
├── index.html
├── css/style.css
└── js/app.js
```

## Run locally

Download the project and open `index.html` in your browser.
An internet connection is needed to load Bootstrap, Chart.js and the Cairo font from a CDN.

## Note

This is a front-end demo with generated sample data. There is no backend or authentication.
Connecting it to a real API would replace the `load` / `store` helpers in `js/app.js` with `fetch` calls.
