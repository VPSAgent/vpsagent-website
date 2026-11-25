"use strict";

(function () {
  // 1. Sticky header border on scroll
  var nav = document.getElementById("site-nav");
  if (nav) {
    var updateNav = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  // 2. Hero floating parallax cards & terminal caret animation controller
  function setupHeroMotion() {
    var hero = document.querySelector(".hero");
    var field = document.querySelector(".hero-float");
    var caret = document.querySelector(".caret");
    if (!hero || !field || typeof IntersectionObserver === "undefined") {
      return;
    }

    var marks = Array.from(field.querySelectorAll(".hero-float-mark"));
    var observed = caret ? marks.concat([caret]) : marks.slice();
    var visible = new Set();
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var finePointer = window.matchMedia("(pointer: fine)");
    var rafId;
    var pointerPos = null;

    function isActive(el) {
      return (
        visible.has(el) &&
        document.visibilityState === "visible" &&
        !reducedMotion.matches
      );
    }

    function canParallax() {
      return finePointer.matches && marks.some(isActive);
    }

    function resetParallax() {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
        rafId = undefined;
      }
      pointerPos = null;
      field.style.setProperty("--px", "0px");
      field.style.setProperty("--py", "0px");
    }

    function syncState() {
      observed.forEach(function (el) {
        el.style.setProperty("--home-motion-state", isActive(el) ? "running" : "paused");
      });
      var enabled = canParallax();
      field.style.setProperty("--parallax-duration", enabled ? "0.7s" : "0s");
      if (!enabled) {
        resetParallax();
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.add(entry.target);
        } else {
          visible.delete(entry.target);
        }
      });
      syncState();
    });

    observed.forEach(function (el) {
      io.observe(el);
    });

    hero.addEventListener("pointermove", function (event) {
      if (!canParallax()) return;
      pointerPos = { x: event.clientX, y: event.clientY };
      if (rafId !== undefined) return;
      rafId = requestAnimationFrame(function () {
        rafId = undefined;
        if (!pointerPos || !canParallax()) return;
        var rect = hero.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        var px = (((pointerPos.x - rect.left) / rect.width - 0.5) * 36).toFixed(1);
        var py = (((pointerPos.y - rect.top) / rect.height - 0.5) * 28).toFixed(1);
        field.style.setProperty("--px", px + "px");
        field.style.setProperty("--py", py + "px");
      });
    });

    hero.addEventListener("pointerleave", resetParallax);
    document.addEventListener("visibilitychange", syncState);
    reducedMotion.addEventListener("change", syncState);
    finePointer.addEventListener("change", syncState);
    syncState();
  }

  setupHeroMotion();

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
      dashApprovalMeta.textContent = "PENDING · deploy_app · Claude Code (ask-first pass)";
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
      dashApprovalMeta.textContent = "APPROVED · Executed via /run/vpsagent/runtime-bridge.sock";
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
      dashApprovalMeta.textContent = "REJECTED · Blocked before container build";
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

  // 4. Safety Wall Interactive Approval Card Simulator
  var simHead = document.getElementById("sim-head");
  var simStatus = document.getElementById("sim-status");
  var simFootNote = document.getElementById("sim-foot-note");
  var simApprove = document.getElementById("sim-approve");
  var simReject = document.getElementById("sim-reject");
  var simPill = document.getElementById("sim-pill");
  var simPillLabel = document.getElementById("sim-pill-label");
  var simState = "pending";

  function renderSim(next) {
    simState = next;
    if (!simHead || !simStatus || !simFootNote || !simPillLabel) return;
    simHead.classList.remove("is-pending");
    simStatus.classList.remove("is-ok", "is-rejected");

    if (next === "approved") {
      simStatus.textContent = "Approved · Shipped via Runtime Bridge";
      simStatus.classList.add("is-ok");
      simFootNote.textContent = "Signed in SQLite WAL · Secrets redacted";
      simPillLabel.textContent = "Deployed — click to reset preview";
    } else if (next === "rejected") {
      simStatus.textContent = "Rejected · Container not created";
      simStatus.classList.add("is-rejected");
      simFootNote.textContent = "Denied by owner · Bridge call skipped";
      simPillLabel.textContent = "Blocked — click to reset preview";
    } else {
      simHead.classList.add("is-pending");
      simStatus.textContent = "Waiting for approval";
      simFootNote.textContent = "Audited in SQLite WAL";
      simPillLabel.textContent = "Approve & deploy via Runtime Bridge";
    }
  }

  if (simApprove) {
    simApprove.addEventListener("click", function () {
      renderSim("approved");
    });
  }
  if (simReject) {
    simReject.addEventListener("click", function () {
      renderSim("rejected");
    });
  }
  if (simPill) {
    simPill.addEventListener("click", function () {
      renderSim(simState === "pending" ? "approved" : "pending");
    });
  }

  // 5. Ubuntu Install Terminal Switcher & Copy Helpers
  var INSTALL_CMDS = {
    curl: "curl -fsSL https://raw.githubusercontent.com/VPSAgent/vpsagent/main/bootstrap/install.sh | sudo bash",
    git: 'git clone https://github.com/VPSAgent/vpsagent.git "$HOME/vpsagent" && sudo bash "$HOME/vpsagent/bootstrap/install.sh"',
  };
  var currentMode = "curl";
  var termCmd = document.getElementById("term-cmd");
  var modeBtns = Array.from(document.querySelectorAll("[data-install-mode]"));
  var termCopyBtn = document.getElementById("term-copy-btn");
  var termCopyLabel = document.getElementById("term-copy-label");
  var pitchCopyBtn = document.getElementById("pitch-copy-btn");
  var pitchCopyLabel = document.getElementById("pitch-copy-label");

  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-install-mode");
      if (!mode || !INSTALL_CMDS[mode]) return;
      currentMode = mode;
      modeBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      if (termCmd) {
        termCmd.textContent = INSTALL_CMDS[mode];
      }
    });
  });

  function copyInstall(labelEl, defaultText) {
    var text = INSTALL_CMDS[currentMode];
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

  if (termCopyBtn) {
    termCopyBtn.addEventListener("click", function () {
      copyInstall(termCopyLabel, "Copy");
    });
  }
  if (pitchCopyBtn) {
    pitchCopyBtn.addEventListener("click", function () {
      copyInstall(pitchCopyLabel, "Copy install command");
    });
  }
})();
