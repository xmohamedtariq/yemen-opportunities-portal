# Deployment

## Deployment Model

Yemen Opportunities Portal is a static web application built with HTML, CSS, and vanilla JavaScript.

It has:

- no server-side runtime
- no package installation step
- no CDN dependency
- no database server
- no build framework

Therefore a Docker image is not required to reproduce the production deployment.

The repository contains a GitHub Actions workflow that deterministically prepares and publishes the required static application files to GitHub Pages.

## Deployment Workflow

Workflow file:

`.github/workflows/pages.yml`

The workflow:

1. Checks out the exact repository commit.
2. Creates a clean `_site` deployment directory.
3. Copies only the public application files and required assets.
4. Uploads `_site` as the GitHub Pages artifact.
5. Deploys that artifact through GitHub Pages.

This keeps tests, internal task documentation, and development evidence out of the public site artifact.

## Files Published

- `index.html`
- `about.html`
- `detail.html`
- `statistics.html`
- `suggest.html`
- `service-worker.js`
- `assets/`
- `css/`
- `js/`
- `data/opportunities.json`

## Reproducing Deployment

1. Create or use a GitHub repository containing this source tree.
2. Push the `main` branch.
3. In GitHub repository settings, open Pages.
4. Select GitHub Actions as the Pages source if GitHub requests a source selection.
5. Run the `Deploy static portal to GitHub Pages` workflow, or push to `main`.
6. GitHub Pages publishes the artifact produced from that exact commit.

## Reproducibility

The workflow defines the deployed file set in source control. No undocumented manual build step is required.

The final submission records the exact commit and Git tag used for publication so that the evaluated version can be reproduced independently.

## Service Worker

The Service Worker uses same-origin relative application resources so the portal can operate under the GitHub Pages repository path after the first successful online visit.

Offline behavior was verified successfully against the final deployed GitHub Pages URL on a real physical Apple iPhone using Safari after the first successful online load.
