# Workload & Infrastructure Mapping

This document provides a living, detailed mapping of application workloads/endpoints to their optimal infrastructure, cost class, and operational notes. Update as your app evolves.

---

## 1. Workload Classification Principles
- **Frequency:** Once in a blue moon, rare, often, frequent, volume, high-intense
- **Cost Class:** Low, small, medium, big, large
- **Type:** Static, CRUD, analytics, AI/model-inference, batch, etc.

## 2. Mapping Table (Template)

| Endpoint/Function     | Frequency      | Cost Class | Infra Target                | Scaling/Monitoring Notes           | Owner/Notes                |
|-----------------------|---------------|------------|-----------------------------|------------------------------------|----------------------------|
| `/api/health`         | Frequent      | Low        | Serverless/Lambda           | Always-on, cheap                   |                            |
| `/api/user/profile`   | Frequent      | Low        | Serverless/Lambda           | CRUD, cacheable                    |                            |
| `/api/inference`      | Rare/Volume   | High       | Cloud GPU/Spot Instance     | Spin up as needed, monitor cost    |                            |
| `/api/batch-process`  | Volume        | Medium     | Spot/Preemptible VM         | Schedule for off-peak              |                            |
| `/static/*`           | Always        | Low        | CDN                         | Cache aggressively                 |                            |

*Add more rows as needed for new endpoints or workloads.*

---

## 3. Operational Guidelines
- Review this mapping quarterly or after major feature launches.
- Set up cost and usage monitoring for each infra target.
- Document owner/notes for each workload to ensure accountability.
- Use this as a reference for infra changes, scaling, and cost audits.

---

## 4. Revision History
- *2025-04-23*: Initial template created.
