# README — Project Documentation Export

This folder contains all project data, metrics, and diagrams for the **Ethical Supply Chain** blockchain research project.

---

## Quick Reference

| Item | Detail |
|------|--------|
| **Algorithm Name** | Threshold-Based Multi-Authority Ethical Validation Algorithm |
| **Threshold** | 2 of 3 authorities |
| **Network** | Sepolia Testnet (Chain ID: 11155111) |
| **Base Contract** | `0x0262C4dEc9A16A5962e862926DD1AdA94c64A302` |
| **Proposed Contract** | `0x32dA54F4c606fccB17fcB3f41416529b181cE4C7` |

---

## Folder Contents

### Data Documents

| File | Section | Content |
|------|---------|---------|
| `7_Proposed_Algorithm.md` | Section 7 | Algorithm name, threshold logic, approval/rejection rules, revocation, Solidity function reference |
| `8_System_Architecture.md` | Section 8 | Full architecture flow, exact modules, data flows for registration/validation/verification |
| `9_Technology_Stack.md` | Section 9 | Complete stack list with versions, repository structure, notable exclusions |
| `10_Implementation_Results.md` | Section 10 | 20 working features, deployment addresses, gas snapshot, pending items |
| `11_Comparison_Metrics.md` | Section 11 | 8-dimension metric table, feature comparison, algorithm formula comparison |
| `13_Figures_and_Graphs.md` | Section 13 | Bar graph data, radar chart data, comparison table, algorithm formulas, lifecycle states |

### Diagrams (12_Diagrams/)

| File | Diagram Type | Format | Status |
|------|-------------|--------|--------|
| `01_Architecture_Diagram.md` | System Architecture | Mermaid | ✅ Created |
| `02_Flow_Diagram_Base.md` | Base Paper Flow | Mermaid | ✅ Created |
| `03_Flow_Diagram_Proposed.md` | Proposed System Flow | Mermaid | ✅ Created |
| `04_Use_Case_Diagram.md` | Use Case | Mermaid | ✅ Created |
| `05_Sequence_Diagram.md` | Sequence / Demo Flow | Mermaid | ✅ Created |
| `06_Class_Diagram.md` | Class Diagram (Solidity) | Mermaid | ✅ Created |
| `07_Component_Diagram.md` | Component Diagram | Mermaid | ✅ Created |
| `08_Deployment_Diagram.md` | Deployment Diagram | Mermaid | ✅ Created |
| `09_Algorithm_Flowchart.md` | Algorithm Flowchart | Mermaid | ✅ Created |
| `10_Existing_vs_Proposed_Comparison.md` | Comparison Flow | Mermaid | ✅ Created |

### Original Diagrams (12_Diagrams/original_diagrams/)

These are the existing PNG diagrams from the repository:

| File | Type | Source |
|------|------|--------|
| `use_case_diagram.png` | Use Case Diagram | DOCs/uml_diagrams/ |
| `sequence_diagram.png` | Sequence Diagram | DOCs/uml_diagrams/ |
| `component_diagram.png` | Component Diagram | DOCs/uml_diagrams/ |
| `deployment_diagram.png` | Deployment Diagram | DOCs/uml_diagrams/ |
| `uml_diagrams.drawio` | Editable source (draw.io) | DOCs/uml_diagrams/ |

---

## How to Use Mermaid Diagrams

The `.md` files in `12_Diagrams/` contain Mermaid diagram code. To render them:

1. **VS Code:** Install "Markdown Preview Mermaid Support" extension
2. **Online:** Paste code into [mermaid.live](https://mermaid.live)
3. **GitHub/GitLab:** Mermaid renders natively in markdown files
4. **Export:** Use mermaid.live to export as PNG/SVG/PDF

---

## Key Metrics Summary

| Metric | Existing | Proposed |
|--------|----------|----------|
| Trust | 4 | 9 |
| Security | 5 | 9 |
| Governance | 3 | 9 |
| Transparency | 7 | 9 |
| Validation | 2 | 9 |
| Storage Efficiency | 5 | 8 |
| Gas Efficiency | 5 | 7 |
| Auditability | 6 | 9 |

## Gas Snapshot

| Operation | Base Paper | Proposed |
|-----------|-----------|----------|
| Create / Register | 145,056 | 76,085 |
| Sell / Advance Stage | 76,558 | 38,450 |
| Buy / Approve | 81,291 | 59,786 |

---

*Generated from repository: `/home/sxtr/Projects/New Supply Chain/`*
*Date: 2026-04-23*
