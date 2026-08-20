# B2 — Browser Minesweeper (React + TypeScript)

Build a complete, polished, playable Minesweeper for the browser.

---

## 1. Environment

- Node 22 with npm. The toolchain is already installed in `node_modules/`.
- **There is no network access.** Do not add, remove, upgrade or vendor any
  dependency, and do not run `npm install`. Everything required is present:
  React 19, TypeScript, Vite, Vitest, Testing Library, puppeteer-core.
- The application is a Vite SPA. Entry point: `index.html` -> `src/main.tsx`.
- Work only inside this repository.

## 2. Game rules (all mandatory)

- **Default board: 16x16 with 40 mines.** This is what loads on first paint.
- **First click is always safe**: the first revealed cell is never a mine, and
  mine placement must guarantee it. Placing mines only after the first click is
  the expected approach.
- **Reveal**: revealing a cell shows either a mine (loss), a number 1-8 with the
  count of adjacent mines, or an empty cell.
- **Flood reveal**: revealing an empty cell (zero adjacent mines) recursively
  reveals its neighbours, stopping at numbered cells, which are revealed too.
  This must not blow the stack on the largest board.
- **Flags**: the player can flag and unflag a covered cell. A flagged cell
  cannot be revealed until it is unflagged.
- **Mine counter**: shows `total mines - flags placed`. It may go negative.
- **Timer**: starts on the first reveal, stops on win or loss, resets on
  restart. Seconds, monotonic, never runs while the game is over.
- **Win**: every non-mine cell is revealed. Winning stops the timer and locks
  the board; remaining mines should be shown as flagged.
- **Loss**: revealing a mine ends the game, reveals all mines, marks the
  triggering mine distinctly, and locks the board.
- **Restart**: a visible control starts a fresh game with the current
  difficulty, resetting board, timer, flags and status.

## 3. Difficulties

Exactly these three, switchable at any time (switching starts a new game):

| Name         | Board  | Mines |
| ------------ | ------ | ----- |
| Beginner     | 9x9    | 10    |
| Intermediate | 16x16  | 40    |
| Expert       | 30x16  | 99    |

`30x16` means 30 columns by 16 rows. Intermediate is the default.

## 4. Input: mouse and touch

- Mouse: left click reveals, right click toggles a flag. The browser context
  menu must not appear over the board.
- Touch: tap reveals, long press (roughly 400-600ms) toggles a flag. Long press
  must not also fire a reveal, and must not select text or trigger the native
  callout.
- Keyboard is not required, but nothing may break if a user tabs through.

## 5. Responsive

- Works at 1440x900 and at 390x844.
- At 390px the Expert board (30 columns) does not fit at a comfortable cell
  size: it must remain playable — scale the cells down and/or scroll the board
  **inside its own container**. The page body must never scroll horizontally.
- Controls (difficulty, restart, counter, timer) stay visible and usable at both
  viewports; touch targets stay usable on mobile.

## 6. Polish

This is judged as a finished product, not a prototype:

- Coherent visual design: consistent palette, spacing, typography and states.
- Classic number colors (1 blue, 2 green, 3 red, ...) or a deliberate, legible
  alternative applied consistently.
- Clear covered/revealed/flagged/exploded states.
- Visible hover/active/focus feedback that does not shift layout.
- Clear win and loss feedback.
- No layout jump when the board or status changes.

## 7. Required markup contract

External validation depends on these hooks. They are part of the task.

- `data-testid="board"` on the board container.
- `data-testid="cell"` on **every** cell, plus:
  - `data-row` and `data-col` with zero-based indices;
  - `data-state` with exactly one of `covered`, `revealed`, `flagged`,
    `exploded`;
  - `data-adjacent` with the adjacent mine count (`"0"`-`"8"`) on revealed
    non-mine cells.
- `data-testid="mine-counter"` whose text content contains the current counter
  value.
- `data-testid="timer"` whose text content contains the elapsed seconds.
- `data-testid="restart"` on the restart control (a real `<button>`).
- `data-testid="difficulty"` on the difficulty control. It must expose the three
  difficulties as `<button>` elements with
  `data-difficulty="beginner|intermediate|expert"`, or as a `<select>` with
  `<option value="beginner|intermediate|expert">`.
- `data-testid="status"` whose text content reflects the game state and contains
  the word `Playing`, `Won` or `Lost` (case-insensitive) as appropriate.

Do not use these attributes anywhere else.

## 8. Tests (mandatory)

Write real unit tests with Vitest under `src/`. At minimum, cover:

1. first click is safe on a board where mine placement is forced/seeded;
2. flood reveal expands an empty region and stops correctly at numbers;
3. mine counter decrements when a flag is placed and restores when removed;
4. a flagged cell cannot be revealed;
5. win detection when all non-mine cells are revealed;
6. loss detection when a mine is revealed, with the board locked afterwards.

Keep the game logic in pure, testable modules separate from the React
components; test the logic directly rather than only through the DOM.

## 9. Quality bar

- Clean, readable, typed code. No `any`, no dead code, no unused exports.
- No TypeScript errors, no runtime console errors, no React key warnings.
- Deterministic tests: no reliance on real timers or real randomness.

## 10. Validation (this is exactly what will be run)

```
npm run typecheck
npm run build
npm test
npm run check
```

`npm run check` serves the existing `dist/` produced by `npm run build` and
drives a headless Chrome over it, playing the game. Run `npm run build` before
`npm run check`.

`scripts/` (the external validation harness), `vitest.config.ts`,
`vite.config.ts`, `tsconfig.json` and `package.json` are the validation
contract: **do not modify them**. Add your own tests under `src/`.

## 11. Definition of done

- All four validation commands exit 0.
- The game is fully playable with mouse at 1440x900 and with touch at 390x844.
- All three difficulties work, first click is always safe, and the game reaches
  both a win and a loss state correctly.
