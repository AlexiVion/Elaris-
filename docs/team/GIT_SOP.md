# Elaris — Git Collaboration SOP

This is the step-by-step Git procedure for Alexi, Juanma and their AI agents.

---

## SOP 0 — Golden rules

1. Never code directly on `main`.
2. Start from an up-to-date `main`.
3. One Issue → one branch → one PR.
4. Push the branch early.
5. Review before merge.
6. CI green before merge.
7. Normal PRs use Squash and Merge.
8. After merge, sync `main`.
9. If two branches touch the same shared area, coordinate landing order.
10. Read `AGENTS.md` first.

---

## SOP 1 — Start a task

### 1. Pull canonical main

```bash
git switch main
git pull --ff-only origin main
```

### 2. Create the task branch

Example for Issue #42:

```bash
git switch -c feat/42-placement-renewal
```

### 3. Confirm state

```bash
git status
git branch --show-current
```

Expected: clean working tree on the task branch.

---

## SOP 2 — Develop

Make small coherent commits.

```bash
git add <files>
git commit -m "Add placement renewal review flow"
```

Push early:

```bash
git push -u origin feat/42-placement-renewal
```

Continue committing as needed.

Do not optimize commit history while developing. Normal PRs are squash-merged.

---

## SOP 3 — Sync if main changed

If someone else's PR merged:

```bash
git fetch origin
git switch feat/42-placement-renewal
git merge origin/main
```

If there are conflicts:

```bash
git status
```

Resolve each file intentionally.

Then:

```bash
git add <resolved-files>
git commit
git push
```

Never choose “ours” or “theirs” blindly on architecture/domain files.

---

## SOP 4 — Verify locally

Run the repository's current checks.

At the time this SOP was written:

```bash
pnpm db:reset
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright test
```

If the repo scripts change, `package.json` and CI are authoritative.

For UI changes, also manually walk the affected demo flow.

---

## SOP 5 — Open a Pull Request

Push:

```bash
git push
```

With GitHub CLI:

```bash
gh pr create \
  --base main \
  --head feat/42-placement-renewal \
  --title "Placement renewal review flow" \
  --fill
```

Use the PR template.

Attach screenshots for meaningful UI work.

Request the other founder as reviewer when practical.

---

## SOP 6 — Review

The reviewer checks:

- Issue acceptance criteria;
- scope;
- architecture;
- product boundary;
- shared-vs-actor-specific data;
- tests/CI;
- UI flow if relevant;
- docs;
- possible collision with active work.

Review outcomes:
- Approve
- Comment
- Request changes

The PR owner makes corrections on the same branch.

---

## SOP 7 — Merge

When:
- review is resolved;
- CI is green;
- acceptance criteria are met;

use **Squash and Merge**.

Then delete the feature branch.

---

## SOP 8 — Sync after merge

Both contributors:

```bash
git switch main
git pull --ff-only origin main
```

Branch owner:

```bash
git branch -d feat/42-placement-renewal
```

If GitHub did not delete remote branch:

```bash
git push origin --delete feat/42-placement-renewal
```

---

## SOP 9 — Urgent hotfix

Create it from `main`, never patch main directly:

```bash
git switch main
git pull --ff-only origin main
git switch -c fix/73-critical-routing
```

Implement → verify → PR → review → merge.

“Urgent” changes the review speed, not the architecture discipline.

---

## SOP 10 — Initial migration into the canonical repo

The one-time migration of Alexi's current work should **not** be pushed directly to the canonical `main`.

Use:

```text
Juanma canonical main
        ↓
migration branch
        ↑
merge Alexi's current feature/history
        ↓
migration PR
        ↓
review + CI
        ↓
canonical main
```

Detailed commands are provided during the migration because the exact remote URL and branch state must be verified first.

After the migration PR is merged, both contributors should work from fresh or correctly reconfigured clones of the canonical repository.

---

## SOP 11 — Conflict protocol

A Git conflict is not only a text problem. It can represent a product/architecture conflict.

For each conflict ask:

1. Are both changes still required?
2. Which one reflects the newer accepted architecture?
3. Does combining them violate a domain invariant?
4. Does a doc need updating?
5. Does the conflict change acceptance criteria?

For conflicts in:
- Prisma schema;
- migrations;
- shared domain;
- deterministic engines;
- route hierarchy;
- shared product shell;

stop and resolve semantically, not mechanically.

---

## SOP 12 — Branch protection recommendation

Protect `main` with:

- Require Pull Request before merge
- Require at least 1 approval
- Require conversation resolution
- Require CI status checks
- Block force pushes
- Block deletion

This turns the written protocol into repository enforcement.
