"use strict";

(function () {
  // 1. Sticky navbar background separation on scroll + mobile menu close on anchor click
  var nav = document.getElementById("site-nav");
  if (nav) {
    var updateNav = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });

    var navMenu = nav.querySelector(".nav-menu");
    if (navMenu) {
      Array.from(navMenu.querySelectorAll("a")).forEach(function (link) {
        link.addEventListener("click", function () {
          navMenu.removeAttribute("open");
        });
      });
    }
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

  // Shared ARIA tabs helper (roving tabindex + ArrowLeft/ArrowRight/Home/End)
  function initTabs(listEl, onSelect) {
    if (!listEl) return null;
    var tabs = Array.from(listEl.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return null;

    function activate(tab, shouldFocus) {
      tabs.forEach(function (t) {
        var active = t === tab;
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.setAttribute("tabindex", active ? "0" : "-1");
      });
      var panelId = tab.getAttribute("aria-controls");
      if (panelId && tab.id) {
        var panel = document.getElementById(panelId);
        if (panel) panel.setAttribute("aria-labelledby", tab.id);
      }
      if (shouldFocus) tab.focus();
      if (onSelect) onSelect(tab, tabs);
    }

    tabs.forEach(function (tab, idx) {
      var isSelected = tab.getAttribute("aria-selected") === "true";
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");

      tab.addEventListener("click", function () {
        activate(tab, false);
      });

      tab.addEventListener("keydown", function (e) {
        var isVertical = listEl.getAttribute("aria-orientation") === "vertical";
        var nextIdx = null;
        if (e.key === "ArrowRight" || (isVertical && e.key === "ArrowDown")) {
          nextIdx = (idx + 1) % tabs.length;
        } else if (e.key === "ArrowLeft" || (isVertical && e.key === "ArrowUp")) {
          nextIdx = (idx - 1 + tabs.length) % tabs.length;
        } else if (e.key === "Home") {
          nextIdx = 0;
        } else if (e.key === "End") {
          nextIdx = tabs.length - 1;
        }
        if (nextIdx === null) return;
        e.preventDefault();
        activate(tabs[nextIdx], true);
      });
    });

    return {
      activateByAttr: function (attr, value) {
        var match = tabs.find(function (t) {
          return t.getAttribute(attr) === value;
        });
        if (match) activate(match, false);
      },
    };
  }

  // 2. Hero one-line install copy button
  // TODO(diego): switch to the v2.0.0-alpha.1 tag URL once the tag exists and install.sh defaults VPSAGENT_REPO_REF to it
  var ONE_LINE_INSTALL =
    "curl -fsSL https://raw.githubusercontent.com/VPSAgent/vpsagent/main/bootstrap/install.sh | sudo bash";
  var heroCopyBtn = document.getElementById("hero-copy-btn");
  var heroCopyLabel = document.getElementById("hero-copy-label");
  if (heroCopyBtn) {
    heroCopyBtn.addEventListener("click", function () {
      copyText(ONE_LINE_INSTALL, heroCopyLabel, "Copy");
    });
  }

  // 2b. Overview panel agent activity line (runs once on load; static when reduced motion)
  var activityEl = document.getElementById("dash-activity-text");
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var activityTimers = [];
  function clearActivityTimers() {
    while (activityTimers.length) clearTimeout(activityTimers.pop());
  }
  if (activityEl && !reduceMotion) {
    activityEl.textContent = "deploy_app(analytics-api)";
    activityTimers.push(
      setTimeout(function () {
        activityEl.textContent = "deploy_app(analytics-api) → building…";
      }, 900)
    );
    activityTimers.push(
      setTimeout(function () {
        activityEl.textContent =
          "deploy_app(analytics-api) → live at https://analytics.yourdomain.com";
      }, 2100)
    );
  }

  // 3. Interactive Dashboard Tab Switcher & Approval Demo
  var dashPanels = Array.from(document.querySelectorAll("[data-dash-panel]"));
  var dashTabCtrl = initTabs(document.querySelector(".dash-tabs"), function (tab) {
    var tabId = tab.getAttribute("data-dash-tab");
    dashPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-dash-panel") !== tabId;
    });
  });

  Array.from(document.querySelectorAll("[data-jump-tab]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-jump-tab");
      if (id && dashTabCtrl) dashTabCtrl.activateByAttr("data-dash-tab", id);
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
    if (
      !dashApprovalItem ||
      !dashApprovalMeta ||
      !dashApprovalDesc ||
      !dashApprovalActions ||
      !dashBadge ||
      !dashResetDemo
    ) {
      return;
    }
    clearActivityTimers();
    if (state === "pending") {
      dashApprovalItem.style.borderColor = "";
      dashApprovalItem.style.borderLeftColor = "";
      dashApprovalMeta.style.color = "";
      dashApprovalMeta.textContent = "Pending · deploy_app · Claude Code (Ask Me First)";
      dashApprovalDesc.innerHTML =
        "Build <strong>analytics-api</strong> from its Dockerfile, add a private Postgres 16, and serve it on <code>analytics.yourdomain.com</code>.";
      dashApprovalActions.hidden = false;
      dashBadge.textContent = "1";
      dashBadge.classList.remove("is-zero");
      dashResetDemo.hidden = true;
      if (dashOverviewAlert) dashOverviewAlert.hidden = false;
      if (activityEl) activityEl.textContent = "deploy_app(analytics-api) → waiting for approval";
    } else if (state === "approved") {
      dashApprovalItem.style.borderColor = "rgba(16, 185, 129, 0.35)";
      dashApprovalItem.style.borderLeftColor = "#10b981";
      dashApprovalMeta.style.color = "#34d399";
      dashApprovalMeta.textContent = "Approved · Deploy started";
      dashApprovalDesc.innerHTML =
        "<strong>analytics-api</strong> is live on <code>https://analytics.yourdomain.com</code>.";
      dashApprovalActions.hidden = true;
      dashBadge.textContent = "0";
      dashBadge.classList.add("is-zero");
      dashResetDemo.hidden = false;
      if (dashOverviewAlert) dashOverviewAlert.hidden = true;
      if (activityEl) {
        activityEl.textContent =
          "deploy_app(analytics-api) → live at https://analytics.yourdomain.com";
      }
    } else if (state === "rejected") {
      dashApprovalItem.style.borderColor = "rgba(251, 113, 133, 0.35)";
      dashApprovalItem.style.borderLeftColor = "#fb7185";
      dashApprovalMeta.style.color = "#fb7185";
      dashApprovalMeta.textContent = "Rejected · Nothing was changed";
      dashApprovalDesc.innerHTML =
        "Rejected <strong>analytics-api</strong> deployment request. Nothing was changed.";
      dashApprovalActions.hidden = true;
      dashBadge.textContent = "0";
      dashBadge.classList.add("is-zero");
      dashResetDemo.hidden = false;
      if (dashOverviewAlert) dashOverviewAlert.hidden = true;
      if (activityEl) {
        activityEl.textContent = "deploy_app(analytics-api) → rejected · nothing was changed";
      }
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

  // 3b. Demo slot click-to-load YouTube embed
  var demoSlot = document.querySelector(".demo-slot");
  var ytId = demoSlot ? (demoSlot.getAttribute("data-youtube-id") || "").trim() : "";
  if (demoSlot && ytId) {
    demoSlot.innerHTML =
      '<button type="button" class="demo-poster-btn" aria-label="Play demo video">' +
      '<img class="demo-poster" src="https://i.ytimg.com/vi/' + encodeURIComponent(ytId) + '/hqdefault.jpg" alt="" loading="lazy" />' +
      '<span class="demo-poster-play" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg></span>' +
      "</button>";
    demoSlot.querySelector(".demo-poster-btn").addEventListener("click", function () {
      demoSlot.innerHTML =
        '<iframe class="demo-iframe" src="https://www.youtube-nocookie.com/embed/' +
        encodeURIComponent(ytId) +
        '?autoplay=1" title="VPSAgent demo video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
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
  var wbFile = document.getElementById("wb-file");
  var wbCode = document.getElementById("wb-code");
  var wbTransport = document.getElementById("wb-transport");
  var wbCopyBtn = document.getElementById("wb-copy-btn");
  var wbCopyLabel = document.getElementById("wb-copy-label");

  initTabs(document.querySelector(".workbench-tabs"), function (btn) {
    var id = btn.getAttribute("data-client");
    if (!id || !CLIENT_SNIPPETS[id]) return;
    currentClient = id;
    var item = CLIENT_SNIPPETS[id];
    if (wbFile) wbFile.textContent = item.file;
    if (wbCode) wbCode.textContent = item.code;
    if (wbTransport) wbTransport.textContent = item.transport;
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
      sub: "Requested by Claude Code · Pass: Ask Me First",
      statusText: "Waiting for approval",
      statusClass: "dash-status-cell--warn",
      note: "Recorded in built-in SQLite WAL audit log",
      interactive: true,
      rows: [
        ["Source", "github.com/acme/billing (Dockerfile build)"],
        ["Resources", "0.5 vCPU · 512 MB RAM"],
        ["Database", "Private Postgres 16"],
        ["Public route", "https://billing.yourdomain.com (Caddy Auto-TLS)"],
      ],
      approvedStatus: "Approved · Deploying",
      approvedNote: "Your agent gets the live URL when it's up",
      rejectedStatus: "Rejected · Not deployed",
      rejectedNote: "Rejected by you · Your agent is told why",
    },
    env: {
      title: "update_app_env · api-billing",
      sub: "Requested by Cursor · Pass: Ask Me First (app-locked)",
      statusText: "Waiting for approval",
      statusClass: "dash-status-cell--warn",
      note: "Secret values are encrypted at rest and redacted in logs",
      interactive: true,
      rows: [
        ["Target app", "api-billing (locked to visitor pass)"],
        ["Updated keys", "STRIPE_WEBHOOK_SECRET=[REDACTED]"],
        ["Storage", "Encrypted at rest"],
        ["MCP response", "Confirmation only, secret value never echoed"],
      ],
      approvedStatus: "Approved · Encrypted & reloaded",
      approvedNote: "Container restarted cleanly with scrubbed logs",
      rejectedStatus: "Rejected · Environment unchanged",
      rejectedNote: "Existing encrypted secrets preserved",
    },
    host: {
      title: "run_host_command · apt list --upgradable",
      sub: "Requested by Claude Code · Pass: Ask Me First",
      statusText: "Waiting for your OK",
      statusClass: "dash-status-cell--warn",
      note: "Server commands wait for you on every pass except Full Server Admin",
      interactive: true,
      rows: [
        ["Command", "apt list --upgradable"],
        ["Runs on", "Your VPS host"],
        ["Output", "Returned to your agent and saved in history"],
        ["Timeout", "30 s (max 180 s)"],
      ],
      approvedStatus: "Approved · Ran on host",
      approvedNote: "Output sent back to Claude Code",
      rejectedStatus: "Rejected · Not run",
      rejectedNote: "Your agent is told you said no",
    },
  };

  var activeScenario = "deploy";
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

  initTabs(document.querySelector(".gate-scenarios"), function (btn) {
    var id = btn.getAttribute("data-scenario");
    if (id) renderScenario(id);
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
  var termCopyBtn = document.getElementById("term-copy-btn");
  var termCopyLabel = document.getElementById("term-copy-label");

  initTabs(document.querySelector(".install-modes"), function (btn) {
    var mode = btn.getAttribute("data-install-mode");
    if (!mode || !INSTALL_CMDS[mode]) return;
    currentMode = mode;
    if (termCmd) {
      termCmd.textContent = INSTALL_CMDS[mode];
    }
  });

  if (termCopyBtn) {
    termCopyBtn.addEventListener("click", function () {
      copyText(INSTALL_CMDS[currentMode], termCopyLabel, "Copy command");
    });
  }
})();
