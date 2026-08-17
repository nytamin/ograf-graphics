# Tennis Scorebug

A broadcast-style tennis scorebug: two player rows with seed, per-set games
(current set highlighted), current-game points, a serve indicator dot, and an
optional TIE-BREAK tag in the info bar.

Drive it like any OGraf graphic: `load` -> `playAction` -> repeated
`updateAction` calls as the score changes -> `stopAction`.

Example `updateAction` payload:

```json
{
  "data": {
    "player1Sets": "6 4",
    "player2Sets": "4 5",
    "player1Points": "15",
    "player2Points": "30",
    "server": "player2",
    "tiebreak": false
  }
}
```

Set `player1Points`/`player2Points` to empty strings to hide the points column
(for example between matches). During a tie-break, set `tiebreak: true` and put
the tie-break numerals in the points fields.

## Feeding it live data

Disclosure: this graphic was contributed by the team behind the
[Live Tennis API](https://livetennisapi.com). Any live-scores source works —
the schema is plain strings — but as an example, the Live Tennis API's
live-scores endpoint returns per-set games, current-game points, and the
serving player, which map 1:1 onto this schema. Its free keyed tier
(30 requests/min, 100 requests/day) suits development and slow-cadence
refreshes; continuous fast polling of a full match needs a paid tier. See
[docs.livetennisapi.com](https://docs.livetennisapi.com).
