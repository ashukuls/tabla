# AnuLaya Composition Authoring Guide

This document is a **tutorial and cookbook** for composers.

A practical, end-to-end guide to writing compositions in AnuLaya — from a simple theka like `dha ge na tin` to a full kaida, tukda, chakradhar tihai etc.

> **Type in lowercase English.** It's the quickest input, and the app renders the composition in both Roman and Devanagari automatically. Every example in this guide is given in both scripts: the lowercase line is what you type; the line below it is what the app displays (and what your gurus likely wrote on paper).

---

## Table of contents

1. [What is a composition?](#1-what-is-a-composition)
2. [Quick start (your first composition)](#2-quick-start-your-first-composition)
3. [Composition metadata](#3-composition-metadata)
4. [Notation basics](#4-notation-basics)
5. [Taal grid: how lines line up](#5-taal-grid-how-lines-line-up)
6. [Speed within a beat: concatenation, parens, dots](#6-speed-within-a-beat-concatenation-parens-dots)
7. [Composite shortcuts](#7-composite-shortcuts)
8. [Speed markers (layi): `@2x`, `@4x`](#8-speed-markers-layi-2x-4x)
9. [Repeats and tihai with `^`](#9-repeats-and-tihai-with-)
10. [Variables: reusing phrases](#10-variables-reusing-phrases)
11. [Comments and subtitles](#11-comments-and-subtitles)
12. [Recipe: writing a full kaida](#12-recipe-writing-a-full-kaida)
13. [Recipe: writing a tukda or tihai](#13-recipe-writing-a-tukda-or-tihai)
14. [Recipe: accompanying a song](#14-recipe-accompanying-a-song)
15. [Common pitfalls](#15-common-pitfalls)
16. [Quick reference](#16-quick-reference)

---

## 1. What is a composition?

A composition is a piece of tabla text you can play back, practice against, or print. It contains:

- **Metadata**: title, taal, tempo, category, description, tags.
- **Bols**: the notation itself — the syllables (Dha, Dhin, Na, …) and how they sit inside the taal's beats.

The app parses your bols text and lays it out on a taal-aligned grid. Playback walks through that grid at your chosen BPM. That's the whole model — everything else is notation for packing more rhythm into each beat.

### Designed for phone keyboards

Compositions are typed on phones, with one thumb. The notation stays on the primary keyboard layer wherever possible — no shift, minimal symbol-layer trips:

- **Lowercase** — no shift key, autocorrect-safe. Case is ignored anyway.
- **Space between beats, `-` for rest** — both on the main layer.
- **Dot for subdivision** (`dha.ge`) — reachable without switching layers. Concatenation (`dhage`) works too if you don't want even that.
- **`x N` for repeat** — plain letter, not `×` or `*`.
- **`[ ]`, `$`, `#`, `##`, `@Nx`, `^`** — all single-tap ASCII, familiar from Markdown.
- **Composites** (`tirkit` → ti ra ki te) — four taps for a common 4-bol phrase.
- **Forgiving parser** — autocorrect capitals, extra spaces, and double-tap-space-periods don't break anything.

Roman input is offered because it's fast to type; the app always renders the canonical Devanagari alongside.

---

## 2. Quick start (your first composition)

Open the admin web app, go to **Compositions → New**, and fill in:

| Field | Value |
|---|---|
| Title | `Dadra Theka` |
| Taal | `Dadra` |
| Tempo | `120` |
| Category | `theka` |
| Bols | `dha dhin na dha tin na` |

That's it — hit play and you should hear the 6-beat Dadra cycle. Each space-separated token is one beat. Dadra has 6 beats, and your line has 6 tokens. Perfect alignment.

```
Input:      dha dhin na dha tin na
Devanagari: धा धिं ना धा तिं ना
```

Most of what follows is just ways to pack more than one stroke into a single beat, or to repeat/reuse patterns.

---

## 3. Composition metadata

Each composition carries these fields:

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Display name. |
| `taal` | yes | One of: `Dadra`, `Rupak`, `Keherwa`, `Bhajani`, `Jhaptaal`, `Ektaal`, `Chautaal`, `Dhamar`, `Teentaal`, `Tilwada`. |
| `tempo` | yes | BPM (20–300). This is the *base* tempo — speed markers and the global `speed` multiply on top. |
| `bols` | yes | The notation text (this whole guide is about this field). |
| `speed` | no | Global layi multiplier (`1` = thah/baraabar, `2` = dugun, `3` = tigun, `4` = chaugun). Default `1`. |
| `category` | no | `theka`, `kaida`, `rela`, `tukda`, `tihai`, `song`, `other`. Used for filtering and for the UI to show the right controls. |
| `description` | no | Short prose — who taught it, style, what to watch for. |
| `author` | no | Credit the composer / guru. |
| `tags` | no | Free-form array, e.g. `["kayda", "intermediate", "benares"]`. |
| `visibility` | no | `private` (only you) or `published` (anyone in your cohort / public). Defaults to `private`. |
| `userType` | no | `regular` or `expert` — used by the app to hide advanced controls from beginners. |

### Picking a taal

| Taal | Beats | Vibhags (divisions) | Claps (sam/tali) |
|---|---|---|---|
| Dadra | 6 | 3 + 3 | 0 |
| Rupak | 7 | 3 + 2 + 2 | 3, 5 |
| Keherwa / Bhajani | 8 | 4 + 4 | 0 |
| Jhaptaal | 10 | 2 + 3 + 2 + 3 | 0, 2, 7 |
| Ektaal / Chautaal | 12 | 2 × 6 | 0, 4, 8 |
| Dhamar | 14 | 5 + 2 + 3 + 4 | 0, 5, 10 |
| Teentaal / Tilwada | 16 | 4 × 4 | 0, 4, 12 |

Your bols don't need to fit a single cycle — they just need to be a multiple of the taal length (whole cycles). The grid view will wrap them automatically.

---

## 4. Notation basics

### 4.1 One bol per beat

The simplest form: one space-separated token per beat.

```
Input:      dha dhin dhin dha
Devanagari: धा धिं धिं धा
```

Four beats. Plays dha, dhin, dhin, dha at exactly one stroke per beat.

### 4.2 Rests and silence

Use `-` (hyphen) or `s` to hold a beat silent:

```
Input:      dha - - ta
Devanagari: धा - - ता
```

```
Input:      dha s s ta       (same as above)
Devanagari: धा - - ता
```

### 4.3 Use lowercase — case is ignored

All three of these produce exactly the same composition:

```
dha dhin dhin dha        ← recommended: fastest to type
Dha Dhin Dhin Dha
DHA DHIN DHIN DHA
```

**Type in lowercase.** It's quickest (no shift key), matches how most gurus write in teaching notation, and is what you'll see throughout this guide.

The one place where **camelCase helps readability** is long concatenated bols inside a single beat — `DhaGeTiTe` is easier to read than `dhagetite`, even though both parse identically. Use whichever feels clearer beat by beat; the parser doesn't care.

The app always renders the canonical title-case form (and Devanagari) on display, so how you type has no effect on what anyone sees.

### 4.4 Multi-line rows

Newline = new row. Rows are purely visual — playback is seamless across them.

```
Input:      dha dhin dhin dha dha dhin dhin dha
            dha tin tin ta ta dhin dhin dha

Devanagari: धा धिं धिं धा धा धिं धिं धा
            धा तिं तिं ता ता धिं धिं धा
```

This is Teentaal Theka (16 beats) split across two rows of 8 beats each. Same audio as one 16-beat line, but easier to read.

### 4.5 Pipes as visual separators

`|` is ignored by the parser — use it anywhere you want a visual separator for readability:

```
Input:      dha dhin | dhin dha | dha dhin | dhin dha
Devanagari: धा धिं | धिं धा | धा धिं | धिं धा
```

Many authors pipe-separate vibhags: `dha dhin dhin dha | dha dhin dhin dha | dha tin tin ta | ta dhin dhin dha`.

### 4.6 Valid bols and Devanagari mapping

Tabla bols are traditionally written in Devanagari, and that's the primary notation you'll find in old books and compositions passed down by gurus. The Roman spellings in this guide are a **canonical one-to-one mapping** to Devanagari — not a loose phonetic transcription. The app displays both.

Why this matters: several Devanagari bols sound alike or collapse into the same English spelling in casual romanization (e.g. ता and ट are completely different sounds that careless romanization conflates as "ta"). To keep the mapping round-trip–safe, each Devanagari bol has exactly one Roman form — and some Roman spellings are chosen specifically to avoid collisions.

#### Canonical table

| Devanagari | Roman | Accepted input forms |
|---|---|---|
| धा | Dha | `dha`, `Dha`, `DHA` |
| धे | Dhe | `dhe` |
| धें | Dhen | `dhen` |
| धि | Dhi | `dhi` |
| धिं | Dhin | `dhin` |
| धुं | Dhun | `dhun` |
| दि | Di | `di` |
| दिं | Din | `din` |
| द | Da | `da` |
| ड़ | De | `de` |
| ता | Ta | `ta` |
| तिं | Tin | `tin` |
| तुं | Tun | `tun` |
| त | T | `t` |
| ति | Ti | `ti` |
| ट | Te | `te` |
| त्र | Tra | `tra` |
| ना | Na | `na` |
| ने | Ne | `ne` |
| ग | Ga | `ga` |
| गे | Ge | `ge` |
| घे | Ghe | `ghe` |
| घें | Ghen | `ghen` |
| घि | Ghi | `ghi` |
| क | Ka | `k`, `ka` |
| के | Ke | `ke` |
| कि | Ki | `ki` |
| कत् | Kt | `kt` |
| क्र | Kra | `kra` |
| क्ड | Kda | `kda` |
| र | Ra | `r`, `ra` |

**Silence**: `-`, `S`, `s` all mean rest.
**Placeholder**: `~` — a layout-only bol that redistributes based on surrounding beats (advanced; use `-` for ordinary silence).

Anything not in this table is rejected by the parser.

#### Key disambiguations (why the canonical form is what it is)

These pairs look close in English but are different strokes in Devanagari. The canonical Roman form is chosen so the two never collide.

**`Ti` (ति) vs `Te` (ट) vs `T` (त) and `Ta` (ता)**
Although Ti, Te, T are same, using the right phrase to prounounce it correctly.
For example, तिरकिट -> Ti Ra Ki Te, तकता -> T K Ta
TiRaKiTa will parse incorrectly (in the common cases) as ति र कि ता

**`Ge` (गे) vs `Ghe` (घे)**
Though they are same bols, use the version that sounds correct.
For example, धा गे ति ट घे घे ति ट -> dha ge ti te ghe ghe ti te

**`Ka` (क) vs `Ke` (के) vs `Ki` (कि)**
Three flavors of "k", use the version that sounds correct.

For example, 
त कि ट -> t ki te
ता के ति ट -> ta ke ti te
क त ग दि ग ने  -> ka t ga di ga ne

**`De` (ड़) vs `Dhe` (धे) vs `Da` (द)**
De is the retroflex flap ड़ — a quick, dry stroke. Dhe and Da are unrelated. Use the exact letters.

#### Single-character shortcuts

For fast phrases, three single letters expand to full bols:

| Input | Roman | Devanagari |
|---|---|---|
| `t` | T | त |
| `r` | Ra | र |
| `k` | Ka | क |

Example: `tkta` = T Ka Ta = त क ता. Compare with `trkt` = T Ra Ka T = त र क त.

#### Round-trip examples

Common Devanagari phrases and their canonical Roman input:

| Devanagari | Roman input | Notes |
|---|---|---|
| धा धिं धिं धा | `Dha Dhin Dhin Dha` | Teentaal theka opener |
| ति र कि ट | `TiRaKiTa` *(composite)* or `Ti Ra Ki Te` | The ट is `Te`, not `Ta` |
| ति र कि ट ट क | `tirkittk` *(composite)* | Single-char shortcuts expand the whole phrase |
| क्ड धा | `KdaDha` | |
| घे ना गे ना | `Ghe Na Ge Na` | Note Ghe (घे) vs Ge (गे) — both in the same phrase |
| धा गे ति ट | `DhaGeTiTe` | One beat (concatenated), four bols |
| क्र धे ति ट | `Kra Dhe Ti Te` | |

The app renders both scripts side-by-side, so a composition authored in Roman will display correctly in Devanagari and vice versa — as long as you stay on the canonical mapping.

---

## 5. Taal grid: how lines line up

The grid view groups beats into vibhags (the claps/divisions of the taal). You don't have to match this in your notation — but your composition plays best when full cycles fit the grid.

**Teentaal (16 beats, vibhags of 4):**

```
| dha  dhin dhin dha | dha  dhin dhin dha | dha  tin  tin  ta  | ta   dhin dhin dha |
   1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
                        ^tali                  ^khali                ^tali (sam next)
```

```
Devanagari: धा धिं धिं धा | धा धिं धिं धा | धा तिं तिं ता | ता धिं धिं धा
```

When a beat contains more than one bol (through concatenation, parens, or dots — see §6), the grid squeezes them into that beat's cell. The number of bols-per-beat is called the **speed** of those bols (and the grid lays them out proportionally).

---

## 6. Speed within a beat: concatenation, parens, dots

This is the core of the notation. Three equivalent tools, each with a different "flavor":

- **Concatenation**: `DhaGe` = two bols in one beat (speed 2). Quickest to type.
- **Parentheses**: `(DhaGe)` = same thing. Useful when mixing speeds inside a single beat.
- **Dots**: `Dha.Ge` = same thing. Useful for clean equal subdivisions like triplets.

### 6.1 Concatenation (no spaces)

Bols touching each other share a single beat:

```
Input:      dha dhin dhindhin dha
Devanagari: धा धिं धिंधिं धा
```

Four beats: `dha`, `dhin`, `dhindhin` (two bols in beat 3), `dha`. In beat 3, both dhins each take half a beat (speed 2).

The parser segments concatenations using longest-match-first, so:

```
dhadhin   → dha dhin      (speed 2)   धा धिं
tirakite  → ti ra ki te   (speed 4)   ति र कि ट
dhadhin-  → dha dhin -    (speed 3)   धा धिं -
```

Rest markers (`-`) concatenate too, so you can write `dhadhin-dha` for a four-stroke beat including silence.

**Real example** — Teentaal Kism uses concatenation for its "doubled" variations:

```
## Kism 1 - Double 4th beat
dha dhin dhin dhadha

## Kism 2 - Double 3rd beat
dha dhin dhindhin dha
```

```
Kism 1 displayed: धा धिं धिं धाधा
Kism 2 displayed: धा धिं धिंधिं धा
```

### 6.2 Parentheses (explicit grouping)

Parens group bols into a single rhythmic unit inside a beat:

```
Input:      dha(tira)(kite)
Devanagari: धा तिर किट
```
The beat is first divided into 3 equal parts - dha, tira and kite. Then, ti ra and ki te are played at twice the speed of dha, effectively making it "dha - ti ra ki te" within the beat.

**Stacking groups inside a single beat** multiplies the speeds:

```
Input:      (tira)(kite)dha-
Devanagari: (ति र)(कि ट)धा-
```

This is **one** beat (no spaces between groups) containing four groups: `(tira)`, `(kite)`, `dha`, `-`. Each pair gets speed 8, each bare bol gets speed 4, together filling the beat evenly. Ugly to read, but exact.

In practice, you'll see parens for simple pairs:

```
Input:      dha ti dha ge   na dha (tira)(kite)   dha dha ti t   kra dhe ti t
Devanagari: धा ति धा गे   ना धा (ति र)(कि ट)   धा धा ति त   क्र धे ति त
```

`(tira)(kite)` is a common 4-stroke flourish occupying one beat.

### 6.3 Dot subdivision

Dots split a beat into **equal** subbeats:

```
dha.ge            → two equal halves: dha | ge               धा.गे
dha.tira.kite     → three equal thirds: dha | tira | kite   धा.तिर.किट
```

In `dha.tira.kite`, the beat splits into three equal thirds. The first third is dha alone, the next two hold pairs. Each pair's two bols share their third evenly (so ti and ra each take 1/6 of the beat).

Dots are the cleanest way to write non-power-of-two subdivisions like triplets or quintuplets:

```
dha.ti.na              (triplet)       धा.ति.ना
dha.dhin.dhin.na.ge    (quintuplet)    धा.धिं.धिं.ना.गे
```

**Nested dots** (dots inside parens inside dots) work too:

```
Input:      dha.(ta.kite).dhin
Devanagari: धा.(ता.किट).धिं
```

Three equal thirds at the top. The middle third is itself split: `ta` in its first half, `ki+te` in the second. Use this when you need a mixed rhythm and concatenation would be ambiguous.

### 6.4 Which tool when?

| You want… | Use |
|---|---|
| A quick pair or quartet in one beat | concatenation: `dhadhin`, `tirakite` |
| An exact triplet / 5-tuplet / 7-tuplet | dots: `dha.ti.na` |
| To mix a long group with a short group in one beat | parens: `(tira)dha` |
| To split a beat hierarchically | dots with nested parens: `dha.(ta.kite).dhin` |

All three are just ways to say "these N bols share this beat." Pick whichever reads most clearly.

---

## 7. Composite shortcuts

A handful of very common phrases have **named shortcuts** that expand into canonical bols. These make input faster and ensure consistent Devanagari output. You write them as a single token (lowercase is fine — the table shows the canonical form):

| Shortcut | Expands to | Devanagari |
|---|---|---|
| `TiRaKiTa` or `tirakite` | Ti Ra Ki Te | ति र कि ट |
| `tirkit` | Ti Ra Ki Te | ति र कि ट |
| `tirkittk` | Ti Ra Ki Te Te Ka | ति र कि ट ट क |
| `KitaTaka` | Ki Ta Ta Ka | कि ता ता क |
| `DhiRaDhiRa` | Dhi Ra Dhi Ra | धि र धि र |
| `GhiDeNaGa` | Ghi De Na Ga | घि ड़ ना ग |
| `GaDiGeNe` | Ga Di Ge Ne | ग दि गे ने |
| `TakKdaan` | Ta Kda Ne | ता क्ड ने |
| `KdaDhaan` | Kda Dha Ne | क्ड धा ने |
| `TaKiTa` | Ti Ki Te | ति कि ट |
| `KdaDha` | Kda Dha | क्ड धा |
| `TraKa` | Tra Kda | त्र क्ड |
| `Tita` | Ti Te | ति ट |
| `TaKa` | Ti Ki | ति कि |
| `Dhit` | Dhi Te | धि ट |

They work inside parens (`(tita)dha`) but not across beat boundaries (spaces, parens, or brackets break them).

**Real example** — a Dadra mukhda:

```
Input:      dha dhin na tirakite tkta- tirakite
Devanagari: धा धिं ना तिरकिट तकता- तिरकिट
```

`tirakite` is the composite (ti ra ki te), and `tkta-` uses single-char shortcuts (t ka ta -).

---

## 8. Speed markers (layi): `@2x`, `@4x`

A speed marker multiplies the playback speed of everything after it (in the same composition) until the next marker. Use `@1x`, `@2x`, `@3x`, or `@4x`.

```
dha ge na tin na ke dhin na

@2x
[dha ge na tin na ke dhin na]x2
```

```
Displayed as: धा गे ना तिं ना के धिं ना
              @2x
              [धा गे ना तिं ना के धिं ना]x2
```

A Keherwa theka: first line at baraabar (1x), then double-speed (dugun) repeating the same 8 bols twice.

You can change speed mid-line too: `dha dhin @2x na tin` runs the first two bols at 1x and the rest at 2x.

Common pattern: **write each layi at `@Nx`** so the bols-per-line stays readable:

```
## Vilambit Theka
@2x
dhin - na na dhin -kra dhin dhin na na

## Main Theme (chaugun — 4x speed)
@4x
$MT1 $MT_Khali
```

(From a Jhaptaal kaida.) The vilambit section plays slowly; the main theme plays four times faster.

The composition also has a global `speed` field (1/2/3/4). Speed markers multiply with that, so a composition at global `speed: 2` with an `@2x` section plays that section at 4×.

---

## 9. Repeats and tihai with `^`

### 9.1 Repeats: `[ … ] x N`

Brackets repeat a block N times (N = 2–9):

```
[dha ge]x3
```

expands to `dha ge dha ge dha ge` (धा गे धा गे धा गे).

Repeats can nest:

```
[dha ti dha ge [dha ge na]x2 dhin na]x2
```

and can hold whole passages — this is how you write a palta played twice.

### 9.2 Tihai cut with `^`

A **tihai** is three repetitions that land on sam. Often the third repetition is cut short. Mark the cut point with `^` — everything after the last `^` is dropped from the final repetition only.

```
[dha ge na ^ge na]x3
```

- Rep 1: `dha ge na ge na`
- Rep 2: `dha ge na ge na`
- Rep 3: `dha ge na` (the `^ge na` is cut)

Displayed:
```
धा गे ना गे ना | धा गे ना गे ना | धा गे ना
```

**Chakradhar tihai** (tihai-within-tihai, 9 repeats, landing on sam) is a common ending pattern:

```
[na dha tira kete dha ti dha ge
  [na dha tira kete dha ti dha ge ^dha - - -]x3
]x3
```

The inner `^` cuts the final inner rep; the outer brackets play the whole phrase three times.

> **Note**: only the **last** `^` in the entire expanded output is the active cut. If you have multiple `^`s, earlier ones don't actually cut anything — think of `^` as "mark the final cut point."

### 9.3 Nauhakka (9-stroke) tihai

```
[dha ti ^dha -]x9
```

Nine repeats of `dha ti dha -` (धा ति धा -), with the final rep cut to just `dha ti`. The 9-stroke landing is what makes it a "nauhakka."

---

## 10. Variables: reusing phrases

Kaida variations and song accompaniments repeat the same phrases many times. Variables keep your text short and your edits in one place.

### 10.1 Single-line

```
$MT = dha ti dha ge na dha tira kete dha ti dha ge tin na ke na
$MT
```

Displayed: `धा ति धा गे ना धा ति र कि ट धा ति धा गे तिं ना के ना`

Now `$MT` anywhere in the composition expands to that phrase.

### 10.2 Multi-line (with braces)

```
$theme = {
dha dhin dhin dha
na tin tin ta
}
$theme
```

The `$theme` reference produces both rows. Displayed:
```
धा धिं धिं धा
ना तिं तिं ता
```

### 10.3 Variables that reference variables

```
$A = dha dhin
$B = $A dhin dha
$B
```

`$B` expands to `dha dhin dhin dha` (धा धिं धिं धा). Handy for building a full theme from its halves:

```
$theme_half1 = DhaGeTiTe GheGheTiTe GheGheTiTe GheGheNaNa
$theme_half2 = GheNaGeNa GheGheTiTe GheGheTiTe GheGheNaNa
$MT = $theme_half1 $theme_half2
```

(Long concatenated bols like `DhaGeTiTe` are easier to read in camelCase — the parser is happy with `dhagetite` too.)


### 10.4 Naming conventions

There's no enforced convention. Common names you'll see in practice:

- `$MT`, `$MT1`, `$MT2` — main theme and its variations (bhari/khali versions)
- `$theme_half1`, `$theme_half1_khali` — decompose a theme into named halves
- `$theka` — the taal's basic pattern

Pick names you'll recognize later.

---

## 11. Comments and subtitles

### 11.1 Comments — `#`

Any line starting with a single `#` is a comment and is ignored at playback:

```
# Reusable components
$MT  = dha ti dha ge na dha tira kete dha ti dha ge tin na ke na
$MT1 = ta ti ta ke na ta tira kete dha ti dha ge dhin na ge na

# Main Theme
$MT
$MT1

# Dohra
[dha ti dha ge na dha tira kete]x2 $MT
```

Comments are mostly for **organizing the source text** — grouping variable definitions, marking sections of a long kaida, or leaving reminders for yourself or students. Think of them the way you'd use blank lines and headings in a notebook: they make a 100-line composition skimmable when you come back to edit it.

Use `#` for editor-only notes (hidden at playback) and `##` (next subsection) for section headers you want shown on the grid.

### 11.2 Subtitles — `##`

Lines starting with `##` are **displayed on the grid** as section headers but not played:

```
## Theka
dha dhin dhin dha
dha dhin dhin dha

## Palta 1
dha ti dha ti dhin na dhin na
```

Use subtitles to label sections of a kaida (Theka, Main Theme, Dohra, Bal, Adha Dohra, Tihai, etc.) or movements of a song. They're the difference between a wall of bols and a readable composition.

---

## 12. Recipe: writing a full kaida

A kaida has a standard structure: theka → main theme (bhari) → khali → palta variations → tihai. Here's a full worked example of the classic *Dha Ti Dha Ge* kayda. Read it once, then copy the skeleton for your own.

```
# Reusable components
$MT  = dha ti dha ge na dha tira kete dha ti dha ge tin na ke na
$MT1 = ta ti ta ke na ta tira kete dha ti dha ge dhin na ge na
$MT2 = dha ti dha ge na dha tira kete dha ti dha ge dhin na ge na

# Main Theme
$MT
$MT1

# Dohra
[dha ti dha ge na dha tira kete]x2 $MT
[ta ti ta ke na ta tira kete]x2 $MT2

# Bal
dha ti dha ge na dha tira kete dha - - - na dha tira kete $MT
ta ti ta ke na ta tira kete ta - - - na ta tira kete $MT2

# Adha Dohra
dha ti dha ge dha ti dha ge dha ti dha ge na dha tira kete $MT
ta ti ta ke ta ti ta ke ta ti ta ke na ta tira kete $MT2

# Tihai
[na dha tira kete dha ti dha ge [na dha tira kete dha ti dha ge ^dha - - -]x3 ]x3
```

**Main theme in Devanagari** (what gets rendered on screen):

```
$MT :  धा ति धा गे ना धा ति र कि ट धा ति धा गे तिं ना के ना
$MT1:  ता ति ता के ना ता ति र कि ट धा ति धा गे धिं ना गे ना
$MT2:  धा ति धा गे ना धा ति र कि ट धा ति धा गे धिं ना गे ना
```

**What's happening**:

1. **Define** `$MT` (bhari main theme), `$MT1` (khali version — `ta` and `ke` replace `dha` and `ge`), and `$MT2` (a bhari-ending closer).
2. **Main Theme** — play bhari then khali once each.
3. **Dohra** — doubles the first half of the theme, then tails with `$MT`/`$MT2`. (The `[...]x2` is the "double.")
4. **Bal** — inserts `- - -` (rests) into the theme to "hollow out" beats before returning to the closer.
5. **Adha Dohra** — repeats the first fragment three times, then the closer.
6. **Tihai** — chakradhar (9-fold) ending.

**To write your own kaida**: open a new composition, set taal + tempo, then:

1. Work out your main theme in 16 matras (for Teentaal) or whatever your taal calls for. Save it as `$MT`.
2. Derive the khali version (swap dha→ta, ge→ke, dhin→tin). Save as `$MT1`.
3. For each palta, write the variation prefix, then end with `$MT` (bhari) and `$MT1` (khali). Separate with `## Palta 1`, `## Palta 2`, etc.
4. Finish with a tihai. Start with `[phrase ^cut]x3` and iterate until it lands on sam.

---

## 13. Recipe: writing a tukda or tihai

Tukdas and tihais are shorter — usually one passage ending on sam. They often use chaugun (4x) speed.

**Tukda example** (Farmaishi tukda in Rupak):

```
## Theka
tin tin na dhin na dhin na

## Tukda in 4 cycles
@2x
dhite dhite dhage tite kradhe tite dhage tite
[kradhe tite]x3 dhage tite
[din- din- nana nana [kradhe tite ^dha]x3 -]x3
```

Theka in Devanagari: `तिं तिं ना धिं ना धिं ना`

- Play the theka once at 1x.
- Switch to `@2x` for the tukda body.
- The last line is a chakradhar tihai (outer `x3` around an inner `x3`).

**Standalone tihai** — just theka, then a sam-to-sam tihai at `@4x`:

```
## Theka
dhin na dhin dhin na   tin na dhin dhin na
## SAM to SAM Tihai
@4x
[ta - dha - t ki te dha - ghe - t ^dha - ]x3
```

Tihai phrase in Devanagari: `ता - धा - त कि ट धा - घे - त धा -` (the last `dha` is what you land on each rep; the final rep cuts after `t`).

Set `category: "tukda"` or `"tihai"` accordingly.

---

## 14. Recipe: accompanying a song

For a song, the "composition" is the tabla arrangement — theka sections alternating with fills and tihais, usually in a song-friendly taal like Keherwa or Dadra.

Example — *Om Jai Jagdish* in Keherwa:

```
## Uthan
[dhi te ti te]x2 [dha - ^-]x3

## Theka
[ghe ti na na - ti dha na ]x4

## Tihai
[dhin - ta ke te]x3 dhin - -

## Theka
[ghe ti ti ta - ti ti ta    ke ti ti ta - ti dhi ta]x2

## Tihai
[dhin - ta ke te]x3 dha - -
```

Theka line in Devanagari: `घे ति ना ना - ति धा ना`
(Notice `ghe` (घे) vs the `ge` (गे) you'd find in a kaida — different strokes, different Devanagari, different sounds. The extra `h` matters.)

- Name each section with `##` — singer and tabla player can find their spots.
- Use `[…]x4` to hold a theka for 4 cycles while the verse plays.
- Separate tihais mark phrase endings.
- Set `category: "song"`.

---

## 15. Common pitfalls

| Problem | Cause | Fix |
|---|---|---|
| Bols don't fit the taal cycle. | Wrong number of beats per row. | Count: single bols are 1 beat, concatenated/grouped tokens are still 1 beat each. |
| `tirakite` didn't expand to 4 bols. | Followed by a lowercase letter, which broke the composite match. | Put a space: `tirakite something`. |
| Composite won't cross beats. | Composites match within one token only. | Don't split across spaces: `tirkit` not `tir kit`. |
| `^` in my tihai didn't cut. | Only the **final** `^` in the fully expanded output cuts. | Either remove extra `^`s, or nest brackets so the one you want is last. |
| Speed marker didn't apply. | `@2x` applies from that point forward until the next marker — not per-line. | Add `@1x` where you want to return to baraabar. |
| Parser rejects `din` + `e`. | `dine` resolves to `di + ne` (longest match wins), so a lone `e` after `din` would be ambiguous. | Write `din e` with a space, or use the intended bol directly. |
| `~` behaving oddly. | `~` is a placeholder that redistributes based on surrounding beat sizes — advanced. | For straightforward silence use `-`. Reach for `~` only when you need its specific layout behavior. |
| Two different speeds in one beat. | Concatenation or parens alone won't do it. | Use dots with nested parens: `dha.(ta.kite).dhin`. |
| Devanagari wrong: `ट` showed as `ता`. | Wrote `ta` for a retroflex stroke. | ट is canonically `te` (not `ta`). Same idea: use `ghe` (not `ge`) for घे. See §4.6. |
| Grid misaligned after a row. | Total beats in the row don't match a multiple of the vibhag. | Check per-row beat totals; use `|` as a sanity marker for vibhags. |

---

## 16. Quick reference

### Notation at a glance

| Syntax | Meaning |
|---|---|
| `dha` | One bol per beat |
| `-` / `s` | Rest (silent beat) |
| `dhadhin` | Two bols sharing one beat (concatenation) |
| `(tira)` | Same — explicit grouping |
| `dha.ge` | Two equal halves of a beat |
| `dha.ti.na` | Triplet (three equal thirds) |
| `dha.(ta.kite).dhin` | Nested subdivision |
| `\|` | Visual separator (ignored) |
| `tirakite` / `TiRaKiTa` | Composite (expands to 4 bols) |
| `@1x` … `@4x` | Speed marker (applies forward) |
| `[pattern]xN` | Repeat pattern N times |
| `[A ^B]x3` | Tihai — drop B on the final rep |
| `$name = …` | Define a variable |
| `$name = { … }` | Multi-line variable |
| `$name` | Expand the variable |
| `# text` | Comment (ignored) |
| `## text` | Subtitle (displayed as section header) |

All syntax is case-insensitive. Lowercase is recommended for speed; camelCase (e.g. `DhaGeTiTe`) can aid readability in long concatenations.

### Relative duration cheatsheet (inside one beat)

| Token | Bols | Speed each |
|---|---|---|
| `dha` | 1 | 1 |
| `dhadhin` or `(dhadhin)` | 2 | 2 |
| `dhagetite` | 4 | 4 |
| `dha.ge` | 2 (equal) | 2 |
| `dha.ti.na` | 3 (equal) | 3 |
| `dha(tira)` | 2 groups | dha 2, ti/ra 4 |
| `(tira)(kite)` | 2 groups of 2 | all 8 |

### Pre-loaded compositions to study

The app ships with sample compositions demonstrating every feature in this guide. Browse them in the composition list and open each to see the `bols` text:

| Concept | Look for |
|---|---|
| Simple theka | *Dadra Theka*, *Teentaal Theka* |
| Subtitles + concatenation | *Teentaal Kism* |
| Speed marker in a theka | *Keherwa Theka* |
| Full kaida with variables & chakradhar tihai | *Teentaal Kayda: Dha Ti Dha Ge*, *Teentaal Kayda: DhaGe TiTe GheGhe TiTe* |
| Multi-layi kaida (2x theka, 4x theme) | *Jhaptaal Kaida* |
| Tukda with chakradhar tihai | *Farmaishi Tukda* |
| Nauhakka (9-stroke) tihai | *Nauhakka Tukda* |
| Sam-to-sam bedam tihai | *Bedam Tihai* |
| Song accompaniment | *Om Jai Jagdish* |
| Peshkar + uthan | *Jhaptaal Peshkar & Uthan* |
| Parenthesized subdivisions | *Dha Ti T Tukda* |
| Composites + single-char shortcuts | *Dadra Mukhda Examples* |

Open one, copy its `bols` text, paste into a new composition, and tweak.
