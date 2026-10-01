# Elaris — Collaboration Workflow

## Purpose

This document defines how Alexi and Juanma work independently on Elaris without creating two incompatible codebases.

The rule is simple:

> **One canonical repository, one canonical `main`, many short-lived task branches.**

---

## 1. Operating model

```text
                           ELARIS
                     canonical GitHub repo
                             main
                              │
             ┌────────────────┴────────────────┐
             │                                 │
      Alexi-owned Issue                 Juanma-owned Issue
             │                                 │
      task branch                        task branch
             │                                 │
        commits/push                      commits/push
             │                                 │
             └──────────────┬──────────────────┘
                            │
                      Pull Requests
                            │
                    review + CI + tests
                            │
                           main
                            │
                 both contributors sync
```

Neither contributor needs a private long-lived version of Elaris.

Each person has:
- their local clone;
- their task branches;
- their commits;
- their Pull Requests.

They share:
- `main`;
- Issues;
- docs;
- CI;
- architecture;
- accepted product state.

---

## 2. Task lifecycle

Every code task follows this lifecycle:

```text
Idea / need
   ↓
Notion if strategic/discovery
   ↓
GitHub Issue
   ↓
Owner assigned
   ↓
Branch from latest main
   ↓
Develop + verify
   ↓
Push
   ↓
Pull Request
   ↓
Other founder review
   ↓
CI green
   ↓
Squash & Merge
   ↓
Issue closed
   ↓
Both sync main
```

### Required Issue fields

Every implementation Issue should state:

- **Owner:** Alexi or Juanma
- **Goal**
- **Why**
- **Scope**
- **Out of scope**
- **Acceptance criteria**
- **Likely files/areas**
- **Dependencies / related PRs**
- **Docs that may need updating**

Use the repository Issue template.

---

## 3. Ownership

The Issue has one **DRI (Directly Responsible Individual)**.

The DRI:
- owns the branch;
- makes the implementation decisions within agreed scope;
- keeps the Issue updated;
- opens the PR;
- responds to review;
- gets the branch green.

The non-owner should avoid making parallel edits to the same feature unless coordinated.

Ownership is about reducing collisions, not authority over the product.

---

## 4. Branch strategy

Normal prefixes:

```text
feat/<issue>-<short-name>
fix/<issue>-<short-name>
docs/<issue>-<short-name>
refactor/<issue>-<short-name>
chore/<issue>-<short-name>
```

Examples:

```text
feat/42-placement-renewal
feat/57-underwriting-case-view
fix/61-deployment-routing
docs/68-git-sop
```

Rules:

- Branch only from current `main`.
- Do not use permanent branches such as `alexi-work` or `juanma-work`.
- Do not combine unrelated tasks in one branch.
- Do not reuse an old merged branch for a new task.
- Delete merged branches.

---

## 5. Parallel work

Parallel work is expected.

### Low collision

Safe examples:

- Alexi: Placement Workspace
- Juanma: safety research/docs

or:

- Alexi: product route
- Juanma: unrelated data/research documentation

### High collision

Coordinate before starting if both tasks modify:

- `prisma/schema.prisma`;
- `lib/db/`;
- `lib/engine/`;
- product registry;
- root routing/layout;
- shared shells/components;
- CI workflows;
- the same product route tree.

If two tasks must touch the same shared area, decide:
1. which PR lands first;
2. which branch will sync after it;
3. who resolves the semantic conflict.

---

## 6. Pull Request contract

A PR is the integration boundary.

Every PR must explain:

- what changed;
- why;
- Issue reference;
- what is explicitly out of scope;
- architecture/data-model implications;
- tests/checks run;
- screenshots for meaningful UI changes;
- docs updated;
- known limitations.

The other founder reviews by default.

A review should focus on:
- product correctness;
- architecture boundaries;
- accidental scope growth;
- data/provenance integrity;
- test evidence;
- merge conflicts with ongoing work.

---

## 7. Merge policy

### Normal work

Use **Squash and Merge**.

Why:
- one Issue becomes one clean main commit;
- messy intermediate AI/human commits do not pollute `main`;
- branch history remains available in the PR;
- reverting a feature is simpler.

### Repository migration/import

The first migration from Alexi's historical repo to the canonical Juanma repo may use a **merge commit** to preserve imported history.

After migration, return to normal Squash and Merge.

### Never

- direct push to `main`;
- force-push `main`;
- merge a red PR;
- merge without reconciling conflicts;
- merge a PR whose actual scope is unknown.

---

## 8. Keeping branches current

If another PR merges while you are still working:

```bash
git fetch origin
git switch <your-branch>
git merge origin/main
```

Resolve conflicts carefully, then:

```bash
git add .
git commit
git push
```

Re-run verification.

We prefer merging `origin/main` into active branches over routine rebases because it avoids force-push coordination mistakes. Main stays clean because feature PRs are squash-merged.

---

## 9. Daily synchronization

Before starting new work:

```bash
git switch main
git pull --ff-only origin main
```

Before creating a new branch:

```bash
git status
git switch -c feat/<issue>-<name>
```

At the end of a merged task:

```bash
git switch main
git pull --ff-only origin main
git branch -d <merged-branch>
```

Optionally delete the remote branch after merge.

---

## 10. AI-agent collaboration

Both founders may use AI agents.

That does not change the Git model.

An AI agent:
- works for the Issue owner;
- reads `AGENTS.md` first;
- works only on the assigned branch;
- must not silently absorb another open PR;
- must not decide that unrelated work should also be implemented;
- must document durable architectural discoveries;
- must report actual test/CI evidence.

Two agents working at the same time are simply two developers working in parallel. Git boundaries still apply.

---

## 11. Decision locations

Use the correct system:

| Decision / information | Put it here |
|---|---|
| product hypothesis / actor research | Notion |
| implementation task | GitHub Issue |
| durable architecture | `docs/` |
| code | task branch |
| review / verification | Pull Request |
| accepted implementation | `main` |

This prevents knowledge from being trapped in personal chats.
