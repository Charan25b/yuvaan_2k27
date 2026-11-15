# Trim Redundant UI Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce repetitive small descriptive text across the frontend so the interface feels more direct and less AI-generated without removing useful content.

**Architecture:** Keep the existing components and data model unchanged. Remove only redundant `description` props and decorative helper/status copy at the render sites; preserve card-level content, event/product/contact details, controls, and accessibility labels.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, CSS modules.

**Spec:** User request in conversation: “remove texts from the ui where it is reduntant ... the redundant descriptive type of text”.

## Global Constraints

- Frontend only; do not modify backend code.
- Remove redundant descriptive copy, not useful event, product, sponsor, contact, or accessibility content.
- Preserve action labels, field labels, metadata such as venue/time/status, and `aria-label`/image `alt` text required for accessibility.
- Keep the diff limited to copy/render changes; do not refactor unrelated components or styling.
- Verify with the project lint and production build before committing.

## Review Focus

- Homepage section descriptions repeat information already present in the cards: remove only the six `SectionHeading` descriptions and keep card descriptions.
- The schedule and gallery hero paragraphs explain the page title without adding required information: remove those paragraphs while keeping navigation/action instructions and image counts.
- The team, sponsors, and merchandise pages contain decorative slogans/status lines: remove only lines that do not identify content or guide an action; retain team lore, sponsor descriptions, product details, and contact data.
- Accessibility and meaningful metadata must survive copy cleanup: inspect `aria-label`, `alt`, event fields, prices, locations, and form labels after edits.
- Empty-state and success-state messages communicate system outcomes: retain them even if their surrounding decorative copy is removed.

---

### Task 1: Remove repeated homepage section introductions

**Files:**
- Modify: `components/home/FeaturedEventsSection.tsx`
- Modify: `components/home/SchedulePreviewSection.tsx`
- Modify: `components/home/SponsorsPreviewSection.tsx`
- Modify: `components/home/FactionsSection.tsx`
- Modify: `components/home/GameSiteSection.tsx`
- Modify: `components/home/GalleryPreviewSection.tsx`

**Interfaces:**
- Consumes: Existing `SectionHeading` component and existing card data.
- Produces: The same sections with title/action rows and card content, but without redundant section-level `description` props.

- [ ] **Step 1: Remove each section-level `description` prop**

  Delete the `description` prop from the six `SectionHeading` usages listed above. Do not remove `CardDescription` content, event metadata, feature explanations, or buttons in those sections.

- [ ] **Step 2: Inspect the resulting diff**

  Run `git diff -- components/home` and confirm only redundant intro descriptions were removed.

- [ ] **Step 3: Run lint for the homepage changes**

  Run: `npm run lint -- --no-cache`
  Expected: lint exits successfully, with only the repository's existing warnings if present.

---

### Task 2: Trim redundant page-level helper and decorative copy

**Files:**
- Modify: `app/schedule/page.tsx`
- Modify: `app/gallery/page.tsx`
- Modify: `app/team/page.tsx`
- Modify: `app/sponsors/page.tsx`
- Modify: `app/merchandise/page.tsx`

**Interfaces:**
- Consumes: Existing page layouts, controls, and data.
- Produces: More concise page headers and themed layouts with all useful content and interaction labels intact.

- [ ] **Step 1: Remove redundant schedule and gallery intro copy**

  In `app/schedule/page.tsx`, remove the generic `heroDescription` paragraph while retaining the day-selection instruction and schedule/event metadata.

  In `app/gallery/page.tsx`, remove the generic introductory paragraph under `THE GALLERY`, the `Visual Transmission Online` status strip, the `Yuvaan // End of Transmission` footer slogan, and the viewer's secondary `Image Transmission Active` line. Keep category filters, image counts, empty-state text, viewer controls, and image alternative text.

- [ ] **Step 2: Remove decorative team copy that does not identify content**

  In `app/team/page.tsx`, remove the generic two-line intro paragraph under `THE WAR ROOM` and the redundant middle footer slogan `ALL IDENTITIES ARE UNDER SURVEILLANCE`. Keep the investigation instruction, team/member data, dossier labels, statuses, and close/open accessibility labels.

- [ ] **Step 3: Remove redundant sponsor and merchandise subtitles**

  In `app/sponsors/page.tsx`, remove the decorative subtitle `THE FORCES BEHIND YUVAAN 2027` and the generic introductory paragraph under it. Keep sponsor tier headings, partner names/categories/descriptions, and the partnership CTA copy.

  In `app/merchandise/page.tsx`, remove the `OFFICIAL FESTIVAL MERCHANDISE` subtitle because the page title already identifies the page. Keep product tags, prices, size controls, pickup information, and modal labels.

- [ ] **Step 4: Inspect the diff for preserved useful copy**

  Run: `git diff -- app/schedule/page.tsx app/gallery/page.tsx app/team/page.tsx app/sponsors/page.tsx app/merchandise/page.tsx`
  Expected: only the specified redundant/decorative text nodes are removed; no data fields, actions, labels, or accessibility attributes are changed.

---

### Task 3: Verify and commit the copy cleanup

**Files:**
- Test: Existing frontend lint/build commands.

- [ ] **Step 1: Run lint**

  Run: `npm run lint -- --no-cache`
  Expected: exit code 0; report any pre-existing warnings without broadening scope.

- [ ] **Step 2: Run the production build**

  Run: `npm run build`
  Expected: Next.js compilation, TypeScript checking, and static generation complete successfully.

- [ ] **Step 3: Check whitespace and working tree**

  Run: `git diff --check && git status --short`
  Expected: no whitespace errors and only the intended copy files plus the plan document are modified.

- [ ] **Step 4: Commit the cleanup separately**

  ```bash
  git add app/schedule/page.tsx app/gallery/page.tsx app/team/page.tsx app/sponsors/page.tsx app/merchandise/page.tsx components/home/FeaturedEventsSection.tsx components/home/SchedulePreviewSection.tsx components/home/SponsorsPreviewSection.tsx components/home/FactionsSection.tsx components/home/GameSiteSection.tsx components/home/GalleryPreviewSection.tsx docs/superpowers/plans/2026-11-15-trim-redundant-ui-copy.md
  git commit -m "trim redundant ui copy"
  ```
