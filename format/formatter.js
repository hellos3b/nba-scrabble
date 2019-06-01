/**
  * this file is for formatting into a reddit table
  * I just paste the original json in input as a module.exports, and write the result to a file
 */
const input = require('./input')

const rows = [
  `Rank|Name|Score|Position`,
  `:-|:-|:-|:-`
]

for (var i = 0; i < input.length; i++) {
  rows.push(`${i+1}|${input[i].fullName}|${input[i].points}|${input[i].x},${input[i].y}`)
}

console.log(rows)

// Save it to a JSON file
const fs = require('fs');
fs.writeFile("./results/reddit-table-first.txt", rows.join('\n'), () => console.log("Done!"))