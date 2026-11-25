"use strict";

(function () {
  // 1. Sticky navbar background separation on scroll
  var nav = document.getElementById("site-nav");
  if (nav) {
    var updateNav = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  // Clipboard helper
  function copyText(text, labelEl, defaultText) {
    var done = function () {
      if (!labelEl) return;
      labelEl.textContent = "Copied!";
      setTimeout(function () {
        labelEl.textContent = defaultText;
      }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (_) {
      // Ignore fallback failures in restricted browsers
    }
    document.body.removeChild(ta);
  }

  // 2. Hero one-line install copy button
  var ONE_LINE_INSTALL =
    "curl -fsSL https://raw.githubusercontent.com/VPSAgent/vpsagent/main/bootstrap/install.sh | sudo bash";
  var heroCopyBtn = document.getElementById("hero-copy-btn");
  var heroCopyLabel = document.getElementById("hero-copy-label");
  if (heroCopyBtn) {
    heroCopyBtn.addEventListener("click", function () {
      copyText(ONE_LINE_INSTALL, heroCopyLabel, "Copy");
    });
  }

  // 3. Interactive Dashboard Tab Switcher & Approval Demo
  var dashTabs = Array.from(document.querySelectorAll("[data-dash-tab]"));
  var dashPanels = Array.from(document.querySelectorAll("[data-dash-panel]"));

  function activateDashTab(tabId) {
    dashTabs.forEach(function (btn) {
      var active = btn.getAttribute("data-dash-tab") === tabId;
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    dashPanels.forEach(function (panel) {
      var match = panel.getAttribute("data-dash-panel") === tabId;
      panel.hidden = !match;
    });
  }

  dashTabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-dash-tab");
      if (id) activateDashTab(id);
    });
  });

  Array.from(document.querySelectorAll("[data-jump-tab]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-jump-tab");
      if (id) activateDashTab(id);
    });
  });

  var dashBadge = document.getElementById("dash-pending-badge");
  var dashApprovalMeta = document.getElementById("dash-approval-meta");
  var dashApprovalDesc = document.getElementById("dash-approval-desc");
  var dashApprovalActions = document.getElementById("dash-approval-actions");
  var dashApprovalItem = document.getElementById("dash-approval-item");
  var dashResetDemo = document.getElementById("dash-reset-demo");
  var dashOverviewAlert = document.getElementById("dash-overview-alert");
  var dashApproveBtn = document.getElementById("dash-approve-btn");
  var dashRejectBtn = document.getElementById("dash-reject-btn");

  function setDashApprovalState(state) {
    if (!dashApprovalItem || !dashApprovalMeta || !dashApprovalDesc || !dashApprovalActions || !dashBadge || !dashResetDemo) {
      return;
    }
    if (state === "pending") {
      dashApprovalItem.style.borderColor = "";
      dashApprovalItem.style.borderLeftColor = "";
      dashApprovalMeta.style.color = "";
      dashApprovalMeta.textContent = "Pending · deploy_app · Claude Code (ask-first pass)";
      dashApprovalDesc.innerHTML =
        "Build <strong>analytics-api</strong> from Dockerfile, allocate isolated bridge network, bind <code>analytics.yourdomain.com</code>, and redact 4 secret env keys from logs.";
      dashApprovalActions.hidden = false;
      dashBadge.textContent = "1";
      dashBadge.classList.remove("is-zero");
      dashResetDemo.hidden = true;
      if (dashOverviewAlert) dashOverviewAlert.hidden = false;
    } else if (state === "approved") {
      dashApprovalItem.style.borderColor = "rgba(16, 185, 129, 0.35)";
      dashApprovalItem.style.borderLeftColor = "#10b981";
      dashApprovalMeta.style.color = "#34d399";
      dashApprovalMeta.textContent = "Approved · Executed via /run/vpsagent/runtime-bridge.sock";
      dashApprovalDesc.innerHTML =
        "<strong>analytics-api</strong> built cleanly and started with <code>cap_drop: ALL</code> on <code>https://analytics.yourdomain.com</code>.";
      dashApprovalActions.hidden = true;
      dashBadge.textContent = "0";
      dashBadge.classList.add("is-zero");
      dashResetDemo.hidden = false;
      if (dashOverviewAlert) dashOverviewAlert.hidden = true;
    } else if (state === "rejected") {
      dashApprovalItem.style.borderColor = "rgba(251, 113, 133, 0.35)";
      dashApprovalItem.style.borderLeftColor = "#fb7185";
      dashApprovalMeta.style.color = "#fb7185";
      dashApprovalMeta.textContent = "Rejected · Blocked before container build";
      dashApprovalDesc.innerHTML =
        "Denied <strong>analytics-api</strong> deployment request. No Docker image or Caddy route was modified.";
      dashApprovalActions.hidden = true;
      dashBadge.textContent = "0";
      dashBadge.classList.add("is-zero");
      dashResetDemo.hidden = false;
      if (dashOverviewAlert) dashOverviewAlert.hidden = true;
    }
  }

  if (dashApproveBtn) {
    dashApproveBtn.addEventListener("click", function () {
      setDashApprovalState("approved");
    });
  }
  if (dashRejectBtn) {
    dashRejectBtn.addEventListener("click", function () {
      setDashApprovalState("rejected");
    });
  }
  if (dashResetDemo) {
    dashResetDemo.addEventListener("click", function () {
      setDashApprovalState("pending");
    });
  }

  // 4. Interactive Remote MCP Client Workbench
  var CLIENT_SNIPPETS = {
    claude: {
      file: "claude mcp add (terminal)",
      transport: "Streamable HTTP (POST /mcp)",
      code:
        'claude mcp add --transport http vpsagent https://vps.yourdomain.com/mcp \\\n  --header "Authorization: Bearer vpsmcp_your_scoped_key"',
    },
    codex: {
      file: "~/.codex/config.toml",
      transport: "Remote HTTP MCP with Bearer token",
      code:
        '[mcp_servers.vpsagent]\nurl = "https://vps.yourdomain.com/mcp"\nbearer_token_env_var = "VPSAGENT_MCP_KEY"',
    },
    cursor: {
      file: ".cursor/mcp.json",
      transport: "Remote HTTP MCP JSON config",
      code:
        '{\n  "mcpServers": {\n    "vpsagent": {\n      "url": "https://vps.yourdomain.com/mcp",\n      "headers": {\n        "Authorization": "Bearer vpsmcp_your_scoped_key"\n      }\n    }\n  }\n}',
    },
    antigravity: {
      file: "mcp_config.json",
      transport: "Scoped visitor pass over HTTPS",
      code:
        '{\n  "mcpServers": {\n    "vpsagent": {\n      "serverUrl": "https://vps.yourdomain.com/mcp",\n      "headers": {\n        "Authorization": "Bearer vpsmcp_your_scoped_key"\n      }\n    }\n  }\n}',
    },
    opencode: {
      file: "opencode.json",
      transport: "Streamable HTTP remote server",
      code:
        '{\n  "mcp": {\n    "vpsagent": {\n      "type": "remote",\n      "url": "https://vps.yourdomain.com/mcp",\n      "headers": {\n        "Authorization": "Bearer vpsmcp_your_scoped_key"\n      }\n    }\n  }\n}',
    },
    any: {
      file: "Standard MCP HTTP endpoint",
      transport: "POST /mcp · JSON-RPC 2.0",
      code:
        'POST https://vps.yourdomain.com/mcp\nAuthorization: Bearer vpsmcp_your_scoped_key\nContent-Type: application/json',
    },
  };

  var currentClient = "claude";
  var wbTabs = Array.from(document.querySelectorAll("[data-client]"));
  var wbFile = document.getElementById("wb-file");
  var wbCode = document.getElementById("wb-code");
  var wbTransport = document.getElementById("wb-transport");
  var wbCopyBtn = document.getElementById("wb-copy-btn");
  var wbCopyLabel = document.getElementById("wb-copy-label");

  wbTabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-client");
      if (!id || !CLIENT_SNIPPETS[id]) return;
      currentClient = id;
      wbTabs.forEach(function (t) {
        t.setAttribute("aria-selected", t === btn ? "true" : "false");
      });
      var item = CLIENT_SNIPPETS[id];
      if (wbFile) wbFile.textContent = item.file;
      if (wbCode) wbCode.textContent = item.code;
      if (wbTransport) wbTransport.textContent = item.transport;
    });
  });

  if (wbCopyBtn) {
    wbCopyBtn.addEventListener("click", function () {
      copyText(CLIENT_SNIPPETS[currentClient].code, wbCopyLabel, "Copy snippet");
    });
  }

  // 5. Interactive Action Gate Simulator
  var GATE_SCENARIOS = {
    deploy: {
      title: "deploy_app · billing-api",
      sub: "Requested by Claude Code · Scope: Ask Me First",
      statusText: "Waiting for approval",
      statusClass: "dash-status-cell--warn",
      note: "Recorded in built-in SQLite WAL audit log",
      interactive: true,
      rows: [
        ["Source", "github.com/acme/billing (Dockerfile build)"],
        ["Container policy", "cap_drop: ALL · no-new-privileges · 0 docker.sock"],
        ["Resource limits", "0.5 vCPU · 512m RAM · Private Postgres 16"],
        ["Public route", "https://billing.yourdomain.com (Caddy Auto-TLS)"],
      ],
      approvedStatus: "Approved · Shipped via Runtime Bridge",
      approvedNote: "Built & started on private bridge network",
      rejectedStatus: "Rejected · Container not created",
      rejectedNote: "Denied by owner · Bridge call skipped",
    },
    env: {
      title: "update_app_env · api-billing",
      sub: "Requested by Cursor · Scope: Ask Me First (app-locked)",
      statusText: "Waiting for approval",
      statusClass: "dash-status-cell--warn",
      note: "Secret values are encrypted at rest and redacted in logs",
      interactive: true,
      rows: [
        ["Target app", "api-billing (locked to visitor pass)"],
        ["Updated keys", "STRIPE_WEBHOOK_SECRET=[REDACTED]"],
        ["Storage", "Encrypted in node:sqlite (WAL mode)"],
        ["MCP response", "Confirmation only, secret value never echoed"],
      ],
      approvedStatus: "Approved · Encrypted & reloaded",
      approvedNote: "Container restarted cleanly with scrubbed logs",
      rejectedStatus: "Rejected · Environment unchanged",
      rejectedNote: "Existing encrypted secrets preserved",
    },
    blocked: {
      title: "host_command · rm -rf /var/lib/docker",
      sub: "Attempted over MCP · Blocked automatically before queue",
      statusText: "Denied by bridge allowlist",
      statusClass: "dash-status-cell--danger",
      note: "Runtime Bridge rejects arbitrary shell commands by design",
      interactive: false,
      rows: [
        ["Bridge socket", "/run/vpsagent/runtime-bridge.sock"],
        ["Policy check", "Command not in strict allowlist"],
        ["Docker socket", "Not mounted in core containers"],
        ["Audit event", "Logged as blocked attempt with key prefix"],
      ],
    },
  };

  var activeScenario = "deploy";
  var gateBtns = Array.from(document.querySelectorAll("[data-scenario]"));
  var gateTitle = document.getElementById("gate-title");
  var gateSub = document.getElementById("gate-sub");
  var gateStatus = document.getElementById("gate-status");
  var gateRows = document.getElementById("gate-rows");
  var gateNote = document.getElementById("gate-note");
  var gateActions = document.getElementById("gate-actions");
  var gateApprove = document.getElementById("gate-approve");
  var gateReject = document.getElementById("gate-reject");

  function setStatusBadge(el, text, cls) {
    if (!el) return;
    el.textContent = text;
    el.className = "dash-status-cell " + cls;
  }

  function renderScenario(id) {
    var sc = GATE_SCENARIOS[id];
    if (!sc) return;
    activeScenario = id;

    gateBtns.forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-scenario") === id ? "true" : "false");
    });

    if (gateTitle) gateTitle.textContent = sc.title;
    if (gateSub) gateSub.textContent = sc.sub;
    setStatusBadge(gateStatus, sc.statusText, sc.statusClass);
    if (gateNote) gateNote.textContent = sc.note;

    if (gateRows) {
      gateRows.innerHTML = "";
      sc.rows.forEach(function (pair) {
        var row = document.createElement("div");
        row.className = "gate-row";
        var label = document.createElement("span");
        label.textContent = pair[0];
        var val = document.createElement("code");
        val.textContent = pair[1];
        row.appendChild(label);
        row.appendChild(val);
        gateRows.appendChild(row);
      });
    }

    if (gateActions) {
      gateActions.hidden = !sc.interactive;
    }
  }

  gateBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-scenario");
      if (id) renderScenario(id);
    });
  });

  if (gateApprove) {
    gateApprove.addEventListener("click", function () {
      var sc = GATE_SCENARIOS[activeScenario];
      if (!sc || !sc.interactive) return;
      setStatusBadge(gateStatus, sc.approvedStatus, "dash-status-cell--ok");
      if (gateNote) gateNote.textContent = sc.approvedNote;
    });
  }

  if (gateReject) {
    gateReject.addEventListener("click", function () {
      var sc = GATE_SCENARIOS[activeScenario];
      if (!sc || !sc.interactive) return;
      setStatusBadge(gateStatus, sc.rejectedStatus, "dash-status-cell--danger");
      if (gateNote) gateNote.textContent = sc.rejectedNote;
    });
  }

  // 6. Ubuntu Install Terminal Switcher & Copy Helper
  var INSTALL_CMDS = {
    curl: ONE_LINE_INSTALL,
    git: 'git clone https://github.com/VPSAgent/vpsagent.git "$HOME/vpsagent" && sudo bash "$HOME/vpsagent/bootstrap/install.sh"',
    tunnel: "ssh -N -L 3002:127.0.0.1:3002 ubuntu@YOUR_VPS_IP",
  };
  var currentMode = "curl";
  var termCmd = document.getElementById("term-cmd");
  var modeBtns = Array.from(document.querySelectorAll("[data-install-mode]"));
  var termCopyBtn = document.getElementById("term-copy-btn");
  var termCopyLabel = document.getElementById("term-copy-label");

  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-install-mode");
      if (!mode || !INSTALL_CMDS[mode]) return;
      currentMode = mode;
      modeBtns.forEach(function (b) {
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      if (termCmd) {
        termCmd.textContent = INSTALL_CMDS[mode];
      }
    });
  });

  if (termCopyBtn) {
    termCopyBtn.addEventListener("click", function () {
      copyText(INSTALL_CMDS[currentMode], termCopyLabel, "Copy command");
    });
  }
})();
