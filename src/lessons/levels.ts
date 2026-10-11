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
];
