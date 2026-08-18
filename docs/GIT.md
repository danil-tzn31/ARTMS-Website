# Git — the commands for this project

Every command here is run in Terminal, from the project folder:

```bash
cd ~/Downloads/artms
```

---

## One time only — connect to GitHub

```bash
# 1. Create an EMPTY repo on github.com first.
#    No README, no .gitignore, no licence — this repo already has all three,
#    and an initialised remote makes the first push fail with a conflict.

# 2. Point the local repo at it. Use the SSH URL if you have keys set up,
#    otherwise the https:// one.
git remote add origin git@github.com:<your-username>/artms.git

# 3. Push, and set the upstream so later pushes are just `git push`.
git push -u origin main
```

Check it worked:

```bash
git remote -v          # should print origin twice, fetch and push
git status             # should say "Your branch is up to date with 'origin/main'"
```

If you ever need to change the URL (typo, switched to SSH):

```bash
git remote set-url origin git@github.com:<your-username>/artms.git
```

---

## The everyday loop

```bash
git status             # what changed — run this first, always
git diff               # the actual changes, line by line. q to quit.
git add -A             # stage everything, including new and deleted files
git commit             # opens your editor for the message (see below)
git push               # send it up
```

Or, for a one-line message without opening an editor:

```bash
git commit -m "fix(hero): tighten the statement size on mobile"
```

**Stage only some files** when a change is really two changes:

```bash
git add src/data/eras.ts          # just this file
git add src/components/           # this whole folder
git commit -m "content: rewrite the era statements"
```

---

## Writing the message

The convention this repo already follows:

```
type(scope): imperative summary under 72 characters

Body: what changed, and — more importantly — WHY. Include anything you
tried and rejected. Wrap at about 72 columns.

A commit that only restates what the diff already shows is a wasted
commit. The diff tells you what. Only the message can tell you why.
```

**Types in use here:**

| Type | For |
|---|---|
| `feat` | a new capability or section |
| `fix` | a bug — something behaved wrongly |
| `content` | copy, data, tracklists, credits |
| `style` | visual change with no behaviour change |
| `perf` | making something faster or lighter |
| `refactor` | restructuring with no behaviour change |
| `build` | the asset pipeline, dependencies, config |
| `docs` | documentation only |
| `chore` | tooling, formatting, housekeeping |

**Scopes in use here:** `hero`, `eras`, `members`, `credits`, `chrome`,
`preloader`, `invert`, `media`, `brand`.

Real example from this repo:

```
fix(invert): move the filter to :root so fixed positioning survives

A `filter` value other than `none` makes an element a containing block for
its fixed positioned descendants. The CSS spec exempts the document root
element — and nothing else. The filter was on a wrapper div, so the edge
frame, the scanline stack and ScrollTrigger's pin all became scroll-bound.
```

---

## Seeing what happened

```bash
git log --oneline                 # compact history, newest first
git log --oneline -10             # last ten
git log --stat -3                 # last three, with files changed
git show                          # the most recent commit in full
git show ed669f0                  # a specific commit by its short hash
git log --oneline -- src/data/    # history of one path
```

---

## Undoing things

Ordered from safest to most destructive. Read the comment before running.

```bash
# Discard changes to ONE file you have not committed. Unrecoverable.
git restore src/data/eras.ts

# Unstage a file but KEEP your edits (you ran `git add` too early).
git restore --staged src/data/eras.ts

# Fix the message of the commit you just made — only if you have NOT pushed.
git commit --amend

# Add a forgotten file to the commit you just made — again, only if unpushed.
git add the-file-you-forgot.ts
git commit --amend --no-edit

# Undo the last commit but KEEP the changes in your working tree.
# This is the one you almost always want.
git reset --soft HEAD~1

# Undo the last commit and THROW AWAY the changes. Unrecoverable.
git reset --hard HEAD~1

# Undo a commit you have ALREADY pushed, by making a new commit that
# reverses it. Safe for shared history — never rewrite what others have.
git revert ed669f0
```

**If you have already pushed, do not use `reset`.** Use `revert`. Rewriting
pushed history is what forces `--force`, and `--force` is how work disappears.

---

## Branching, when you want to try something risky

```bash
git switch -c experiment/horizontal-eras   # create and move onto a branch
# ...work, commit as normal...
git switch main                            # back to main; your work is safe
git merge experiment/horizontal-eras       # bring it in, if you liked it
git branch -d experiment/horizontal-eras   # delete once merged
```

```bash
git branch          # list local branches, * marks the current one
git switch main     # move between existing branches
```

---

## Things specific to this repo

```bash
# _scrap/ is gitignored scratch. Safe to delete whenever.
rm -rf _scrap

# public/media/ and public/brand/ ARE committed on purpose — they are the
# optimised derivatives that ship. The multi-GB originals stay outside the
# repo, in `artms media resources`.

# Before committing, it is worth running:
npm run typecheck && npm run lint && npm run build
```

---

## When something looks wrong

```bash
git status                    # nine times out of ten this explains it
git diff                      # unstaged changes
git diff --staged             # staged changes, i.e. what would be committed
git log --oneline -5          # where am I in history
git reflog                    # EVERY move HEAD has made — this is the
                              # undo history, and it is how you recover a
                              # commit you thought you destroyed
```

`git reflog` is the safety net. Almost nothing committed is ever truly lost:
find the hash there and `git reset --hard <hash>` to get back to it.
