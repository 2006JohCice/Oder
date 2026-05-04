const { spawn } = require("child_process");

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const buildPath = `release-${stamp}`;

const child = spawn("npx react-scripts build", {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    BUILD_PATH: buildPath,
  },
});

child.on("close", (code) => process.exit(code ?? 1));
