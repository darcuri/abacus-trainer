import type { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 'anatomy',
    number: 0,
    title: 'Anatomy',
    summary: 'Parts of the soroban and what each bead is worth.',
    learn: [
      {
        type: 'text',
        paragraphs: [
          'A soroban is a frame with vertical **rods**, split by a horizontal **reckoning bar**. Each rod shows one digit, and rods work like place values: ones, tens, hundreds, and so on from right to left.',
          'Above the bar each rod has one **heaven bead** worth 5. Below it are four **earth beads** worth 1 each. A bead only counts when it touches the bar. Beads pushed away from the bar count for nothing.',
          'So a rod shows 0 to 9: earth beads alone give 1 to 4, the heaven bead alone gives 5, and heaven plus earth beads give 6 to 9. Every digit has exactly one bead layout.',
          'The dots on the bar mark every third rod. Pick a dotted rod as the **unit rod** (the ones place); the dots to its left then fall on thousands, millions, and so on, like the commas in a written number. In this app the rightmost rod is the unit rod.',
          'Tap a bead to move it. Like on a real soroban, the beads between it and where it is going move with it. Try it below; the number under each rod is that rod\'s value.',
        ],
      },
      { type: 'try', prompt: 'Show 3 on the ones rod.', value: 3, rods: 5 },
      { type: 'try', prompt: 'Show 5.', value: 5, rods: 5 },
      { type: 'try', prompt: 'Show 8.', value: 8, rods: 5 },
      { type: 'try', prompt: 'Show 6 on the tens rod and 2 on the ones rod: 62.', value: 62, rods: 5 },
      {
        type: 'text',
        paragraphs: [
          'On a physical soroban the **thumb** pushes earth beads up to the bar, and the **index finger** pulls earth beads down and moves the heaven bead both ways. To clear the frame, tilt it toward you so all beads slide down, lay it flat, then run your index finger along the bar to push every heaven bead up.',
        ],
      },
    ],
    practice: [
      { id: 'anatomy-set-1', title: 'Set single digits (values shown)', problems: 10, rods: 5, spec: { kind: 'set', digits: [1, 1], showValues: true } },
      { id: 'anatomy-set-1-blind', title: 'Set single digits (values hidden)', problems: 10, rods: 5, spec: { kind: 'set', digits: [1, 1], showValues: false } },
    ],
  },
  {
    id: 'setting-reading',
    number: 1,
    title: 'Setting and reading numbers',
    summary: 'Put any number on the frame, and read one off it at a glance.',
    learn: [
      {
        type: 'text',
        paragraphs: [
          'To **set** a number, first count its digits so you know which rod the leftmost digit goes on: a 4-digit number starts three rods left of the unit rod. Then set digits **left to right**, the same order you read them. Zeros are rods you leave empty, so watch for them.',
          'To **read** a number, find the unit rod, then read rods left to right. Use the dots to group digits in threes, just like commas: the dot left of the unit rod is the thousands rod.',
          'Aim to read a rod as a shape, not by counting beads. Heaven bead down plus three earth beads up should read as "8" instantly. That recognition is what speed on the soroban is built on.',
        ],
      },
      { type: 'try', prompt: 'Set 47.', value: 47, rods: 7 },
      { type: 'try', prompt: 'Set 305. The tens rod stays empty.', value: 305, rods: 7 },
      { type: 'try', prompt: 'Set 9,060.', value: 9060, rods: 7 },
    ],
    practice: [
      { id: 'set-2', title: 'Set 2-digit numbers', problems: 10, rods: 7, spec: { kind: 'set', digits: [2, 2], showValues: false } },
      { id: 'set-4', title: 'Set 3 to 4-digit numbers', problems: 10, rods: 9, spec: { kind: 'set', digits: [3, 4], showValues: false } },
      { id: 'read-2', title: 'Read 1 to 3-digit numbers', problems: 10, rods: 7, spec: { kind: 'read', digits: [1, 3] } },
      { id: 'read-6', title: 'Read 4 to 6-digit numbers', problems: 10, rods: 9, spec: { kind: 'read', digits: [4, 6] } },
      { id: 'set-7', title: 'Set 5 to 7-digit numbers', problems: 10, rods: 13, spec: { kind: 'set', digits: [5, 7], showValues: false } },
    ],
  },
  {
    id: 'direct',
    number: 2,
    title: 'Direct addition and subtraction',
    summary: 'Sums where every digit is a plain push of beads.',
    learn: [
      {
        type: 'text',
        paragraphs: [
          'Set the first number. Then, for each next number, line its ones digit up with the unit rod and work **left to right**, highest place first, adding or removing that digit on each rod.',
          'In this level every digit can be done **directly**: the beads you need are free to move. Adding 3 to a rod showing 1 means pushing three more earth beads up. Taking 5 off a rod showing 7 means lifting the heaven bead away.',
          'Working left to right feels odd at first if you were taught written sums right to left. It is what lets you start before you have read the whole number, and it is how all later techniques are taught.',
          'Some sums can\'t be done directly. Adding 4 to a rod showing 3 needs a fifth earth bead that isn\'t there. That calls for complements, which are the next levels; problems here avoid them.',
        ],
      },
      { type: 'demo', title: '21 + 13 − 4', terms: [21, 13, -4], rods: 5 },
      { type: 'demo', title: '352 + 141 − 230', terms: [352, 141, -230], rods: 5 },
    ],
    practice: [
      { id: 'direct-add-1', title: 'Add two 1-digit numbers', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 1], terms: 2, subtractChance: 0, allowed: ['direct'] } },
      { id: 'direct-mix-1', title: 'Add and subtract, three 1-digit numbers', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 1], terms: 3, subtractChance: 0.5, allowed: ['direct'] } },
      { id: 'direct-mix-2', title: 'Add and subtract, three 2-digit numbers', problems: 10, rods: 7, spec: { kind: 'addsub', digits: [2, 2], terms: 3, subtractChance: 0.4, allowed: ['direct'] } },
      { id: 'direct-mix-3', title: 'Add and subtract, four 2 to 3-digit numbers', problems: 10, rods: 7, spec: { kind: 'addsub', digits: [2, 3], terms: 4, subtractChance: 0.4, allowed: ['direct'] } },
    ],
  },
  {
    id: 'five-complements',
    number: 3,
    title: 'Five-complements',
    summary: 'Adding or taking away when the earth beads run out, using the heaven bead.',
    learn: [
      {
        type: 'text',
        paragraphs: [
          'Try adding 4 to a rod showing 3. You need four more earth beads, but only one is free. The fix is to add 5 with the heaven bead and take back the 1 you added too many: **+4 = +5 −1**.',
          'The pairs that make 5 are called **five-complements** (or "friends of 5"): 1 and 4, 2 and 3. To add a number you can\'t add directly, add 5 and subtract its partner:',
          '**+1 = +5 −4**, **+2 = +5 −3**, **+3 = +5 −2**, **+4 = +5 −1**.',
          'Subtraction mirrors it. Taking 3 from a rod showing 6 needs three earth beads but only one is up, so take away the heaven bead and give back the partner: **−3 = −5 +2**. In full: **−1 = −5 +4**, **−2 = −5 +3**, **−3 = −5 +2**, **−4 = −5 +1**.',
          'You only use a complement when the direct move is impossible. If you can push the beads directly, do that.',
          'On a physical soroban the two halves are one pinching motion: when adding, the index finger brings the heaven bead down while the same hand clears the extra earth beads. Don\'t do it as two separate thoughts. The goal is to see "+4 on a 3" and move straight to 7.',
        ],
      },
      { type: 'demo', title: '3 + 4 − 2', terms: [3, 4, -2], rods: 5 },
      { type: 'demo', title: '6 − 3 + 1', terms: [6, -3, 1], rods: 5 },
      { type: 'demo', title: '34 + 23 − 41', terms: [34, 23, -41], rods: 5 },
    ],
    practice: [
      { id: 'five-add-1', title: 'Add with five-complements, 1 digit', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 1], terms: 2, subtractChance: 0, allowed: ['direct', 'five'], require: ['five'] } },
      { id: 'five-sub-1', title: 'Subtract with five-complements, 1 digit', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 1], terms: 2, subtractChance: 1, allowed: ['direct', 'five'], require: ['five'] } },
      { id: 'five-mix-1', title: 'Mixed chains, four 1-digit numbers', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 1], terms: 4, subtractChance: 0.5, allowed: ['direct', 'five'], require: ['five'] } },
      { id: 'five-mix-2', title: 'Mixed chains, three 2-digit numbers', problems: 10, rods: 7, spec: { kind: 'addsub', digits: [2, 2], terms: 3, subtractChance: 0.4, allowed: ['direct', 'five'], require: ['five'] } },
      { id: 'five-mix-3', title: 'Mixed chains, four 2 to 3-digit numbers', problems: 10, rods: 7, spec: { kind: 'addsub', digits: [2, 3], terms: 4, subtractChance: 0.4, allowed: ['direct', 'five'], require: ['five'] } },
    ],
  },
  {
    id: 'ten-complements',
    number: 4,
    title: 'Ten-complements',
    summary: 'Carrying to and borrowing from the next rod.',
    learn: [
      {
        type: 'text',
        paragraphs: [
          'Adding 5 to a rod showing 8 would give 13, which no rod can hold. So add 10 on the rod to the left, and take back the 5 you added too many here: **+5 = −5 +10**.',
          'The pairs that make 10 are the **ten-complements**: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5. To add a digit that won\'t fit, subtract its partner on this rod and add 1 to the rod on the left:',
          '**+9 = −1 +10**, **+8 = −2 +10**, **+7 = −3 +10**, **+6 = −4 +10**, **+5 = −5 +10**, and so on down to **+1 = −9 +10**.',
          'Subtraction mirrors it. Taking 5 from a rod showing 2 isn\'t possible, so **borrow** 1 from the rod on the left (that\'s −10) and give back the partner here: **−5 = −10 +5**. In general **−d = −10 +(10−d)**.',
          'This app does additions as "complement off this rod, then carry" and subtractions as "borrow, then complement on this rod", which is the common teaching order. Some teachers do the carry first; either gives the same result, and practice only checks the answer.',
          'If the rod on the left shows 9, the carry ripples: adding 1 to 9 is itself a ten-complement (−9 here, +1 further left). Borrowing from a 0 ripples the same way. Take ripples one rod at a time.',
          'In this level the move on the current rod is always direct. When that move itself needs a five-complement (like +6 on a rod showing 5), that\'s level 5.',
        ],
      },
      { type: 'demo', title: '8 + 5', terms: [8, 5], rods: 5 },
      { type: 'demo', title: '12 − 5', terms: [12, -5], rods: 5 },
      { type: 'demo', title: '98 + 4 − 3 (ripples)', terms: [98, 4, -3], rods: 5 },
    ],
    practice: [
      { id: 'ten-add-1', title: 'Add with carrying, 1 digit', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 1], terms: 2, subtractChance: 0, allowed: ['direct', 'five', 'ten'], require: ['ten'] } },
      { id: 'ten-sub-1', title: 'Subtract with borrowing, 1 to 2 digits', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 2], terms: 2, subtractChance: 1, allowed: ['direct', 'five', 'ten'], require: ['ten'] } },
      { id: 'ten-mix-1', title: 'Mixed chains, four 1 to 2-digit numbers', problems: 10, rods: 5, spec: { kind: 'addsub', digits: [1, 2], terms: 4, subtractChance: 0.4, allowed: ['direct', 'five', 'ten'], require: ['ten'] } },
      { id: 'ten-mix-2', title: 'Mixed chains, four 2-digit numbers', problems: 10, rods: 7, spec: { kind: 'addsub', digits: [2, 2], terms: 4, subtractChance: 0.4, allowed: ['direct', 'five', 'ten'], require: ['ten'] } },
      { id: 'ten-mix-3', title: 'Mixed chains, five 2 to 3-digit numbers', problems: 10, rods: 9, spec: { kind: 'addsub', digits: [2, 3], terms: 5, subtractChance: 0.4, allowed: ['direct', 'five', 'ten'], require: ['ten'] } },
    ],
  },
];
