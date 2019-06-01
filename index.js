/**
 * The board is a 2D array of functions (callin' em modifiers).
 * We run the letter's point value into the modifier, and use the return value as the calculated points
 * If the modifier returns a function, that means its a word bonus and we wait till all the letter bonuses are done
 */
const ID = L => ({pt: L, bonus: ""})
const DL = L => ({pt: L*2, bonus: "x2"})
const TL = L => ({pt: L*3, bonus: "x3"})
const DW = _ => W => ({pt: W*2, bonus: "DW"})
const TW = _ => W => ({pt: W*3, bonus: "TW"})

const board = [
  [ TW, ID, ID, DL, ID, ID, ID, TW, ID, ID, ID, DL, ID, ID, TW ],
  [ ID, DW, ID, ID, ID, TL, ID, ID, ID, TL, ID, ID, ID, DW, ID ],
  [ ID, ID, DW, ID, ID, ID, DL, ID, DL, ID, ID, ID, DW, ID, ID ],
  [ DL, ID, ID, DW, ID, ID, ID, DL, ID, ID, ID, DW, ID, ID, DL ],
  [ ID, ID, ID, ID, DW, ID, ID, ID, ID, ID, DW, ID, ID, ID, ID ],
  [ ID, TL, ID, ID, ID, TL, ID, ID, ID, TL, ID, ID, ID, TL, ID ],
  [ ID, ID, DL, ID, ID, ID, DL, ID, DL, ID, ID, ID, DL, ID, ID ],
  [ TW, ID, ID, DL, ID, ID, ID, ID, ID, ID, ID, DL, ID, ID, TW ]
  // The second half of the board is identical, so no need to include
]

// from https://www.thewordfinder.com/scrabble-point-values.php
const letterPoints = {
  a: 1,
  b: 3,
  c: 3,
  d: 2,
  e: 1,
  f: 4,
  g: 2,
  h: 4,
  i: 1,
  j: 8,
  k: 5,
  l: 1,
  m: 3,
  n: 1,
  o: 1,
  p: 3,
  q: 10,
  r: 1,
  s: 1,
  t: 1,
  u: 1,
  v: 4,
  w: 4,
  x: 8,
  y: 4,
  z: 10
}

/**
 * Calculates how many points a word is worth at a specific position
 */
const calculate = (x, y, word) => {
  // If a modifier returns a function, store it here until the letters are done calculating
  const wordBonus = []
  // The word's point value
  let points = 0
  // Flip this to true if the word extends past the board (we return it so we can skip to the next row)
  // One of the rules is you have to use the full word
  let hitEnd = false
  // Convert word to an array
  const letters = word.split("")
  // This array just stores how much each letter was worth, and any bonuses (string format)
  let ptCalc = []
  // String format for word bonuses
  let bonuses = []

  while(letters.length) {
    const [l] = letters.splice(0, 1)
    let pt = letterPoints[l.toLowerCase()] || 0
    const modifier = board[y][x]

    // Run the letter's point value through the modifier
    const res = modifier(pt)

    // If it returns a function, it's a word bonus and will be used later
    if (typeof res === 'function') {
      wordBonus.push(res)
    } else {
      pt = res.pt
    }

    points += pt

    // Formatting for output to easy read how much each letter was worth
    ptCalc.push(`${l}:${pt}${res.bonus ? `(${res.bonus})` : ''}`)

    x++

    if (x >= 14) {
      hitEnd = true
      break;
    }
  }

  // Multiply the word by each word bonus
  const result = wordBonus.reduce( (val, app) => {
    const res = app(val)
    bonuses.push(res.bonus)
    return res.pt
  }, points)

  return {
    result,
    hitEnd,
    ptCalc,
    bonuses
  }
}

const calculateBest = word => {
  let best = {
    x: 0,
    y: 0,
    points: 0,
    ptCalc: [],
    bonuses: [],
    word: "OOPS"
  }

  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[0].length; x++) {
      const {result, hitEnd, ptCalc, bonuses} = calculate(x, y, word)

      if (result > best.points) {
        best = { x: x + 1, y: y + 1, points: result, word, ptCalc, bonuses }
      }

      if (hitEnd) break;
    }
  }

  return best
}

// Now to iterate over all the names
const names = require('./names')

const res = names.map(name => {
    // cache this for the output
    const fullName = name

    // FULL NAME
    // let n = name.replace(/ /g, '')

    // toggle for which name you want
    // FIRST NAME
    let [n] = name.split(" ")

    // LAST NAME
    // let [,n] = name.split(" ")

    n = n.replace(/ /g, '')
    const result = calculateBest(n)
    return {
      ...result,
      fullName
    }
  }).sort( (a, b) => {
    if (a.points > b.points) return -1
    else if (a.points < b.points) return 1
    else return 0
  })

// Save it to a JSON file
const fs = require('fs');
fs.writeFile("./results/result-first.json", JSON.stringify(res), () => console.log("Done!"))