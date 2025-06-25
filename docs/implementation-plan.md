# Autoclean ConfigWizard – Production Readiness Implementation Plan

> **Document version:** v0.1 · _Draft created <2025-06-25>_

---

## 1. Executive Summary
This document outlines the phased roadmap required to harden, containerise, and deploy the **Autoclean-ConfigWizard** web application to a production-grade environment while optimising for long-term operational cost efficiency.

The plan is split into ten sequential phases, each ending in a verifiable **milestone**. After the plan, you will find a **simulated technical‐lead round-table** between two senior engineering teams, comparing alternative approaches and selecting a lean, cost-aware final blueprint.

---

## 2. Work-stream Timeline & Milestones (Gantt-style overview)
| Phase | Timeline (calendar weeks) | Key Activities | Milestone | Owner(s) |
|-------|---------------------------|----------------|-----------|-----------|
| 0. Kick-off & Audit | W0 → W1 | • Assign Product-owner & TPM  
• Capture non-functional requirements  
• Run dependency & vulnerability audit | **M0: Charter & Audit Report signed** | PM, Tech-Leads |
| 1. Codebase Hardening | W1 → W2 | • Enforce ESLint strict rules  
• Add Prettier + Husky + lint-staged  
• Turn on `strict`, `noUncheckedIndexedAccess` in `tsconfig` | **M1: CI fails on lint/ts errors** | Front-end Guild |
| 2. Test Infrastructure | W2 → W3 | • Vitest unit tests (≥80 % stmt)  
• React Testing Library component tests  
• Seed E2E smoke test via Playwright | **M2: Coverage dashboard ≥ 80 %** | QA, FE |
| 3. Build Optimisation | W3 → W4 | • Deduplicate assets  
• Enable code-splitting & dynamic import  
• Add `vite-plugin-compression` (gzip+br) | **M3: Bundle ≤250 kB Gz** | FE |
| 4. Containerisation | W4 → W5 | • Author multi-stage Dockerfile  
• Health-check endpoint  
• Non-root user  
• Compose file for local dev | **M4: Image <60 MB, runs locally** | Dev-Ops |
| 5. CI / CD Pipeline | W5 → W6 | • GitHub Actions matrix (lint/test/build)  
• Cache npm + Vite  
• Push image to GHCR  
• Auto-deploy to staging | **M5: One-click staging deploy** | Dev-Ops |
| 6. Infrastructure & Runtime | W6 → W7 | • Kubernetes (Helm) manifests OR ECS Fargate task  
• ConfigMap for nginx.conf  
• HPA (CPU)  
• Secret mgmt via AWS SM / GCP Secret Mgr | **M6: Staging traffic live** | Dev-Ops |
| 7. Observability & Security | W7 → W8 | • Sentry + Grafana Faro  
• Prometheus metrics & alerts  
• Security headers, CSP, HSTS  
• Dependabot / Renovate & `npm audit` gating | **M7: Ops dashboard green** | SRE |
| 8. Docs & Governance | W8 → W9 | • README overhaul  
• CONTRIBUTING, CODEOWNERS, License  
• Architectural Decision Records (ADR) | **M8: Docs PR merged** | All |
| 9. Audit & Accessibility | W9 | • Lighthouse ≥ 90 across board  
• axe-core accessibility scan  
• Pen-test / OWASP top-10 scan | **M9: Go-live sign-off** | QA, Security |
| 10. Production Cut-over | W10 | • Tag v1.0.0  
• Blue/green release  
• Post-launch smoke test  | **M10: Prod traffic 100 %** | PM, Ops |

_Total duration:_ ~10 weeks (can compress to 6–7 weeks with parallel tracks and larger team).

---

## 3. Budget & Resource Envelope
| Item | Qty | Rate | Weeks | Cost (USD) |
|------|-----|------|-------|------------|
| Front-end Eng. | 1 | $100/h | 6 | 24 000 |
| Dev-Ops / SRE | 1 | $120/h | 5 | 24 000 |
| QA Engineer | 0.5 FTE | $80/h | 4 | 6 400 |
| PM / TPM | 0.3 FTE | $110/h | 10 | 13 200 |
| Cloud infra (staging+prod) | — | — | yearly | 2 500 |
| **Total (approx.)** | — | — | — | **70 100** |

### Cost-control levers
* Use **ECS Fargate** over full K8s for small load ⇒ saves ≈$450/mo.
* Share AWS RDS tier across micro-projects ⇒ ‑$150/mo.
* Turn on auto-pause for dev/staging DBs ⇒ ‑$80/mo.

---

## 4. Deliverables
1. Hardened codebase (lint, strict TS, tests).
2. `Dockerfile`, `docker-compose.yml`, Helm chart templates.
3. GitHub Actions workflow (CI + CD).
4. Observability stack (Sentry, Prometheus scrape config).
5. Complete project docs & ADRs.
6. Signed release notes v1.0.0.

---

## 5. Simulated Discussion – Choosing the Leanest Path
The following is a _fictional_ transcript between **Team Alpha** (internal product team) and **Team Beta** (external Dev-Ops consultants) held on *2025-06-24*.

> **Agenda:** Evaluate implementation options, balance feature-completeness vs. hosting costs.

```
🕘 14:00 UTC – Zoom call begins

Alpha-Lead (A): We've drafted a 10-phase plan. Concerned about K8s overhead.

Beta-Lead (B): Agreed. For traffic <50 req/sec, ECS Fargate or Fly.io static site is cheaper.

A: We still want blue/green deploys and HPA.

B: Fargate with two target groups covers blue/green. Auto Scaling rules on CPU + ALB metrics – no cluster to babysit.

A: What about CDN?

B: CloudFront in front of ALB. Cost ≈$0.085/GB outbound vs S3 + CloudFront static hosting at $0.02/GB. If app is SPA + API elsewhere, pure S3 static could be enough.

A: We need server-side redirects for the SPA Fallback.

B: CloudFront Functions can rewrite → cheaper than Nginx container 24/7.

A: So Option 1: "Nginx in container". Option 2: "Static S3 + CloudFront".

B: Right. Option 2 removes ~15 USD/mo per environment.

A: Downside is build-time env vars. We'd need runtime env replacement.

B: Use [S3 Object Lambda] or small Lambda@Edge to inject.

A: How about CI complexity?

B: Almost the same – artifact upload to S3 vs. docker push.

A: Security headers?

B: CloudFront Response Headers Policy covers CSP/HSTS.

A: Verdict?

B: If budget is tight, we recommend **Option 2** for now. You can containerise later if dynamic backend emerges.

A: Sounds sensible. We'll keep Dockerfile for local parity but deploy static.

B: 👍 We'll draft the new IaC templates.

🕘 14:55 UTC – Call ends
```

### Decision Matrix
| Criterion | Option 1: Nginx + ECS | Option 2: S3 + CloudFront |
|-----------|----------------------|---------------------------|
| Monthly hosting cost | ~$90 (2 × Fargate tasks + ALB) | ~$25 (S3 + CloudFront 50 GB) |
| Blue/green deploys | Yes (2 tasks) | Yes (two buckets + CF origins) |
| Runtime env-vars | Native | Workaround (edge/lambda) |
| Cold-start | None | None |
| Scalability ceiling | High | High (CDN), limited on edge logic |
| Ops complexity | Moderate | Low |

> **Adopted path:** Proceed with **Option 2** (S3 + CloudFront static hosting) to achieve **~72 % cost reduction** at current traffic volume, while retaining Docker setup for dev and potential future migration.

---

## 6. Updated High-level Architecture (Option 2)
```
┌──────────┐     S3 Sync      ┌────────────┐    CloudFront    ┌─────────────┐
│ GitHub   │ ───────────────▶│  S3 Bucket │◀────────────────▶│  End Users  │
│ Actions  │   (dist files)  │  + OAI     │◀──── TLS 🔒 ─────▶│  Browser    │
└──────────┘                  └────────────┘                  └─────────────┘
                               ▲                                    ▲
                               │ Lambda@Edge (inject env)           │
                               └────────────────────────────────────┘
```

---

## 7. Next Steps / Call-to-Action
1. Approve the **Option 2** architecture.
2. Book two 2-hour pairing sessions with Team Beta to draft CloudFront+S3 IaC (Terraform).
3. Kick off **Phase 0** Monday next week.

_© 2025 CinciBrainLab Engineering_ 