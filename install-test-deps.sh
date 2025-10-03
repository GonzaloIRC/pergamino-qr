#!/bin/bash

# Install Playwright
npm install --save-dev @playwright/test

# Install Playwright browsers
npx playwright install

# Install Maestro for mobile testing (optional, only needed for mobile smoke tests)
# curl -Ls "https://get.maestro.mobile.dev" | bash

echo "Testing dependencies installed successfully!"
echo "To run web tests: npm run test:e2e"
echo "To run mobile tests (requires Maestro): maestro test tests/mobile/app-smoke-test.yaml"