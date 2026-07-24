import initialFixtures from '../data/fixtures.json';
import initialTeams from '../data/teams.json';
import playersData from '../data/players.json';


// Resolve a team's formation, starting 11, and substitutes dynamically & deterministically
export const getTeamFormationAndLineup = (teamId, roster) => {
  const formations = {
    MEX: '4-3-3',
    BRA: '4-3-3',
    ARG: '4-3-3',
    GER: '4-2-3-1',
    ESP: '4-3-3',
    FRA: '4-2-3-1',
    ENG: '4-2-3-1',
    ITA: '3-5-2',
    POR: '4-3-3',
    NED: '3-5-2',
    CRO: '4-3-3',
    BEL: '3-4-3',
    URU: '4-3-3',
    USA: '4-3-3',
    CAN: '4-4-2',
    MAR: '4-2-3-1',
    KOR: '4-4-2',
    JPN: '4-2-3-1',
    COL: '4-3-3',
    SEN: '4-3-3',
  };

  // Deterministic fallback based on teamId characters
  const charCode = teamId ? (teamId.charCodeAt(0) + teamId.charCodeAt(1)) : 0;
  const formationOptions = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3'];
  const formation = formations[teamId] || formationOptions[charCode % formationOptions.length];

  // Parse required position counts
  let dfNeeded = 4;
  let mfNeeded = 3;
  let fwNeeded = 3;

  if (formation === '4-2-3-1') {
    dfNeeded = 4;
    mfNeeded = 5;
    fwNeeded = 1;
  } else if (formation === '4-4-2') {
    dfNeeded = 4;
    mfNeeded = 4;
    fwNeeded = 2;
  } else if (formation === '3-5-2') {
    dfNeeded = 3;
    mfNeeded = 5;
    fwNeeded = 2;
  } else if (formation === '3-4-3') {
    dfNeeded = 3;
    mfNeeded = 4;
    fwNeeded = 3;
  } else if (formation === '5-3-2') {
    dfNeeded = 5;
    mfNeeded = 3;
    fwNeeded = 2;
  }

  const starters = [];
  const starterIds = new Set();

  // 1. Goalkeeper
  const gks = roster.filter(p => p.position === 'GK');
  if (gks.length > 0) {
    starters.push(gks[0]);
    starterIds.add(gks[0].number);
  }

  // 2. Defenders
  const dfs = roster.filter(p => p.position === 'DF');
  const selectedDfs = dfs.slice(0, dfNeeded);
  starters.push(...selectedDfs);
  selectedDfs.forEach(p => starterIds.add(p.number));

  // 3. Midfielders
  const mfs = roster.filter(p => p.position === 'MF');
  const selectedMfs = mfs.slice(0, mfNeeded);
  starters.push(...selectedMfs);
  selectedMfs.forEach(p => starterIds.add(p.number));

  // 4. Forwards
  const fws = roster.filter(p => p.position === 'FW');
  const selectedFws = fws.slice(0, fwNeeded);
  starters.push(...selectedFws);
  selectedFws.forEach(p => starterIds.add(p.number));

  // Fallback: if starters < 11, fill with anyone who isn't already a starter
  if (starters.length < 11) {
    for (const p of roster) {
      if (starters.length >= 11) break;
      if (!starterIds.has(p.number)) {
        starters.push(p);
        starterIds.add(p.number);
      }
    }
  }

  // Substitutes: all roster players not starting
  const subs = roster.filter(p => !starterIds.has(p.number));

  return { formation, starters, subs };
};

// Generate realistic match outcome deterministically based on matchId (including cards and substitutions)
export const generateDeterministicResult = (match) => {
  const events = [];
  
  // Real world events for historical matches 1 and 2
  const realWorldEvents = {
    1: [
      { type: 'red', minute: 49, teamId: 'RSA', player: 'Sphephelo Sithole', detail: 'Straight Red Card (Professional foul)' },
      { type: 'red', minute: 84, teamId: 'RSA', player: 'Themba Zwane', detail: 'Red Card (Violent conduct)' },
      { type: 'red', minute: 90, teamId: 'MEX', player: 'Cesar Montes', detail: 'Red Card (Late tackle)' },
      { type: 'sub', minute: 75, teamId: 'MEX', player: 'Brian Gutierrez (Out) / Gilberto Mora (In)', detail: 'Tactical replacement' }
    ],
    2: [
      { type: 'yellow', minute: 96, teamId: 'KOR', player: 'Lee Gi-Hyuk', detail: 'Tactical foul' },
      { type: 'sub', minute: 62, teamId: 'KOR', player: 'Lee Jae-Sung (Out) / Hwang Hee-Chan (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Pavel Sulc (Out) / Adam Hlozek (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Patrik Schick (Out) / Tomas Chory (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 64, teamId: 'UEFA_D', player: 'Lukas Provod (Out) / Michal Sadilek (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 69, teamId: 'KOR', player: 'Lee Tae-Seok (Out) / Eom Ji-Sung (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 69, teamId: 'KOR', player: 'Son Heung-Min (Out) / Oh Hyeon-Gyu (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 84, teamId: 'UEFA_D', player: 'Alexandr Sojka (Out) / Mojmir Chytil (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 84, teamId: 'KOR', player: 'Hwang In-Beom (Out) / Kim Jin-Gyu (In)', detail: 'Tactical replacement' },
      { type: 'sub', minute: 84, teamId: 'KOR', player: 'Paik Seung-Ho (Out) / Park Jin-Seob (In)', detail: 'Tactical replacement' }
    ]
  };

  // Hardcoded real scores and goals for Matches 1 to 20 from API
  const realResults = {
    1: { homeScore: 2, awayScore: 0, events: [] },
    2: { homeScore: 2, awayScore: 1, events: [] },
    3: { homeScore: 0, awayScore: 0, events: [] },
    4: { homeScore: 4, awayScore: 0, events: [] },
    5: { homeScore: 0, awayScore: 0, events: [] },
    6: { homeScore: 1, awayScore: 1, events: [] },
    7: { homeScore: 0, awayScore: 1, events: [] },
    8: { homeScore: 0, awayScore: 1, events: [] },
    9: { homeScore: 7, awayScore: 1, events: [] },
    10: { homeScore: 0, awayScore: 0, events: [] },
    11: { homeScore: 0, awayScore: 1, events: [] },
    12: { homeScore: 2, awayScore: 0, events: [] },
    13: { homeScore: 0, awayScore: 0, events: [] },
    14: { homeScore: 0, awayScore: 0, events: [] },
    15: { homeScore: 1, awayScore: 1, events: [] },
    16: { homeScore: 1, awayScore: 1, events: [] },
    17: { homeScore: 1, awayScore: 0, events: [] },
    18: { homeScore: 0, awayScore: 2, events: [] },
    19: { homeScore: 3, awayScore: 0, events: [] },
    20: { homeScore: 3, awayScore: 1, events: [] },
    21: { homeScore: 0, awayScore: 0, events: [] },
    22: { homeScore: 4, awayScore: 2, events: [] },
    23: { homeScore: 1, awayScore: 0, events: [] },
    24: { homeScore: 0, awayScore: 2, events: [] },
    25: { homeScore: 1, awayScore: 1, events: [] },
    26: { homeScore: 4, awayScore: 1, events: [] },
    27: { homeScore: 6, awayScore: 0, events: [] },
    28: { homeScore: 1, awayScore: 0, events: [] },
    29: { homeScore: 1, awayScore: 2, events: [] },
    30: { homeScore: 0, awayScore: 1, events: [] },
    31: { homeScore: 3, awayScore: 0, events: [] },
    32: { homeScore: 0, awayScore: 2, events: [] },
    33: { homeScore: 4, awayScore: 2, events: [] },
    34: { homeScore: 1, awayScore: 2, events: [] },
    35: { homeScore: 0, awayScore: 0, events: [] },
    36: { homeScore: 0, awayScore: 4, events: [] },
    37: { homeScore: 4, awayScore: 0, events: [] },
    38: { homeScore: 0, awayScore: 0, events: [] },
    39: { homeScore: 2, awayScore: 2, events: [] },
    40: { homeScore: 1, awayScore: 3, events: [] },
    41: { homeScore: 2, awayScore: 0, events: [] },
    42: { homeScore: 2, awayScore: 0, events: [] },
    43: { homeScore: 4, awayScore: 0, events: [] },
    44: { homeScore: 1, awayScore: 2, events: [] },
    45: { homeScore: 5, awayScore: 0, events: [] },
    46: { homeScore: 0, awayScore: 0, events: [] },
    47: { homeScore: 0, awayScore: 1, events: [] },
    48: { homeScore: 1, awayScore: 0, events: [] },
    49: { homeScore: 3, awayScore: 2, events: [] },
    50: { homeScore: 4, awayScore: 2, events: [] },
    51: { homeScore: 4, awayScore: 2, events: [] },
    52: { homeScore: 0, awayScore: 3, events: [] },
    53: { homeScore: 1, awayScore: 0, events: [] },
    54: { homeScore: 0, awayScore: 3, events: [] },
    55: { homeScore: 0, awayScore: 2, events: [] },
    56: { homeScore: 1, awayScore: 2, events: [] },
    57: { homeScore: 2, awayScore: 6, events: [] },
    58: { homeScore: 3, awayScore: 3, events: [] },
    59: { homeScore: 2, awayScore: 3, events: [] },
    60: { homeScore: 0, awayScore: 0, events: [] },
    61: { homeScore: 2, awayScore: 7, events: [] },
    62: { homeScore: 8, awayScore: 1, events: [] },
    63: { homeScore: 0, awayScore: 0, events: [] },
    64: { homeScore: 0, awayScore: 1, events: [] },
    65: { homeScore: 2, awayScore: 6, events: [] },
    66: { homeScore: 2, awayScore: 2, events: [] },
    67: { homeScore: 0, awayScore: 2, events: [] },
    68: { homeScore: 2, awayScore: 1, events: [] },
    69: { homeScore: 1, awayScore: 1, events: [] },
    70: { homeScore: 4, awayScore: 2, events: [] },
    71: { homeScore: 3, awayScore: 3, events: [] },
    72: { homeScore: 1, awayScore: 3, events: [] },
    // Knockout Matches 73 to 104
    73: {"homeScore":0,"awayScore":1,"winner":"CAN","events":[{"type":"goal","minute":56,"teamId":"CAN","player":"Jonathan David","detail":"Goal"}]},
    74: {"homeScore":1,"awayScore":1,"penHome":3,"penAway":4,"penWinner":"PAR","winner":"PAR","events":[{"type":"goal","minute":28,"teamId":"GER","player":"Jamal Musiala","detail":"Goal"},{"type":"goal","minute":67,"teamId":"PAR","player":"Miguel Almiron","detail":"Goal"}]},
    75: {"homeScore":1,"awayScore":1,"penHome":2,"penAway":3,"penWinner":"MAR","winner":"MAR","events":[{"type":"goal","minute":19,"teamId":"NED","player":"Cody Gakpo","detail":"Goal"},{"type":"goal","minute":44,"teamId":"MAR","player":"Youssef En-Nesyri","detail":"Goal"}]},
    76: {"homeScore":2,"awayScore":1,"winner":"BRA","events":[{"type":"goal","minute":22,"teamId":"BRA","player":"Vinicius Junior","detail":"Goal"},{"type":"goal","minute":65,"teamId":"JPN","player":"Koki Ogawa","detail":"Goal"},{"type":"goal","minute":87,"teamId":"BRA","player":"Endrick","detail":"Goal"}]},
    77: {"homeScore":3,"awayScore":0,"winner":"FRA","events":[{"type":"goal","minute":35,"teamId":"FRA","player":"Kylian Mbappe","detail":"Goal"},{"type":"goal","minute":55,"teamId":"FRA","player":"Kylian Mbappe","detail":"Goal"},{"type":"goal","minute":74,"teamId":"FRA","player":"Antoine Griezmann","detail":"Goal"}]},
    78: {"homeScore":1,"awayScore":2,"winner":"NOR","events":[{"type":"goal","minute":28,"teamId":"CIV","player":"Sebastien Haller","detail":"Goal"},{"type":"goal","minute":47,"teamId":"NOR","player":"Erling Haaland","detail":"Goal"},{"type":"goal","minute":79,"teamId":"NOR","player":"Erling Haaland","detail":"Goal"}]},
    79: {"homeScore":2,"awayScore":0,"winner":"MEX","events":[{"type":"goal","minute":30,"teamId":"MEX","player":"Hirving Lozano","detail":"Goal"},{"type":"goal","minute":85,"teamId":"MEX","player":"Santiago Gimenez","detail":"Goal"}]},
    80: {"homeScore":2,"awayScore":1,"winner":"ENG","events":[{"type":"goal","minute":18,"teamId":"ENG","player":"Harry Kane","detail":"Goal"},{"type":"goal","minute":40,"teamId":"IC_1","player":"Yoane Wissa","detail":"Goal"},{"type":"goal","minute":76,"teamId":"ENG","player":"Jude Bellingham","detail":"Goal"}]},
    81: {"homeScore":2,"awayScore":0,"winner":"USA","events":[{"type":"goal","minute":31,"teamId":"USA","player":"Christian Pulisic","detail":"Goal"},{"type":"goal","minute":73,"teamId":"USA","player":"Folarin Balogun","detail":"Goal"}]},
    82: {"homeScore":3,"awayScore":2,"winner":"BEL","events":[{"type":"goal","minute":14,"teamId":"BEL","player":"Romelu Lukaku","detail":"Goal"},{"type":"goal","minute":38,"teamId":"SEN","player":"Nicolas Jackson","detail":"Goal"},{"type":"goal","minute":61,"teamId":"BEL","player":"Kevin De Bruyne","detail":"Goal"},{"type":"goal","minute":84,"teamId":"SEN","player":"Ismaïla Sarr","detail":"Goal"},{"type":"goal","minute":104,"teamId":"BEL","player":"Jeremy Doku","detail":"Goal"}]},
    83: {"homeScore":2,"awayScore":1,"winner":"POR","events":[{"type":"goal","minute":24,"teamId":"POR","player":"Cristiano Ronaldo","detail":"Goal"},{"type":"goal","minute":52,"teamId":"CRO","player":"Luka Modric","detail":"Goal"},{"type":"goal","minute":78,"teamId":"POR","player":"Bruno Fernandes","detail":"Goal"}]},
    84: {"homeScore":3,"awayScore":0,"winner":"ESP","events":[{"type":"goal","minute":12,"teamId":"ESP","player":"Lamine Yamal","detail":"Goal"},{"type":"goal","minute":48,"teamId":"ESP","player":"Nico Williams","detail":"Goal"},{"type":"goal","minute":81,"teamId":"ESP","player":"Dani Olmo","detail":"Goal"}]},
    85: {"homeScore":2,"awayScore":0,"winner":"SUI","events":[{"type":"goal","minute":33,"teamId":"SUI","player":"Breel Embolo","detail":"Goal"},{"type":"goal","minute":68,"teamId":"SUI","player":"Ruben Vargas","detail":"Goal"}]},
    86: {"homeScore":3,"awayScore":2,"winner":"ARG","events":[{"type":"goal","minute":21,"teamId":"ARG","player":"Lionel Messi","detail":"Goal"},{"type":"goal","minute":39,"teamId":"CPV","player":"Ryan Mendes","detail":"Goal"},{"type":"goal","minute":64,"teamId":"ARG","player":"Julian Alvarez","detail":"Goal"},{"type":"goal","minute":87,"teamId":"CPV","player":"Bebé","detail":"Goal"},{"type":"goal","minute":112,"teamId":"ARG","player":"Lionel Messi","detail":"Goal"}]},
    87: {"homeScore":1,"awayScore":0,"winner":"COL","events":[{"type":"goal","minute":42,"teamId":"COL","player":"Luis Diaz","detail":"Goal"}]},
    88: {"homeScore":1,"awayScore":1,"penHome":2,"penAway":4,"penWinner":"EGY","winner":"EGY","events":[{"type":"goal","minute":25,"teamId":"AUS","player":"Nestory Irankunda","detail":"Goal"},{"type":"goal","minute":63,"teamId":"EGY","player":"Mohamed Salah","detail":"Goal"}]},
    89: {"homeScore":0,"awayScore":1,"winner":"FRA","events":[{"type":"goal","minute":68,"teamId":"FRA","player":"Kylian Mbappe","detail":"Goal"}]},
    90: {"homeScore":0,"awayScore":3,"winner":"MAR","events":[{"type":"goal","minute":15,"teamId":"MAR","player":"Youssef En-Nesyri","detail":"Goal"},{"type":"goal","minute":41,"teamId":"MAR","player":"Hakim Ziyech","detail":"Goal"},{"type":"goal","minute":73,"teamId":"MAR","player":"Achraf Hakimi","detail":"Goal"}]},
    91: {"homeScore":1,"awayScore":2,"winner":"NOR","events":[{"type":"goal","minute":29,"teamId":"BRA","player":"Vinicius Junior","detail":"Goal"},{"type":"goal","minute":54,"teamId":"NOR","player":"Erling Haaland","detail":"Goal"},{"type":"goal","minute":82,"teamId":"NOR","player":"Erling Haaland","detail":"Goal"}]},
    92: {"homeScore":2,"awayScore":3,"winner":"ENG","events":[{"type":"goal","minute":11,"teamId":"MEX","player":"Santiago Gimenez","detail":"Goal"},{"type":"goal","minute":34,"teamId":"ENG","player":"Harry Kane","detail":"Goal"},{"type":"goal","minute":59,"teamId":"ENG","player":"Bukayo Saka","detail":"Goal"},{"type":"goal","minute":71,"teamId":"MEX","player":"Edson Alvarez","detail":"Goal"},{"type":"goal","minute":88,"teamId":"ENG","player":"Jude Bellingham","detail":"Goal"}]},
    93: {"homeScore":0,"awayScore":1,"winner":"ESP","events":[{"type":"goal","minute":74,"teamId":"ESP","player":"Lamine Yamal","detail":"Goal"}]},
    94: {"homeScore":1,"awayScore":4,"winner":"BEL","events":[{"type":"goal","minute":9,"teamId":"USA","player":"Christian Pulisic","detail":"Goal"},{"type":"goal","minute":27,"teamId":"BEL","player":"Romelu Lukaku","detail":"Goal"},{"type":"goal","minute":43,"teamId":"BEL","player":"Kevin De Bruyne","detail":"Goal"},{"type":"goal","minute":61,"teamId":"BEL","player":"Romelu Lukaku","detail":"Goal"},{"type":"goal","minute":80,"teamId":"BEL","player":"Leandro Trossard","detail":"Goal"}]},
    95: {"homeScore":3,"awayScore":2,"winner":"ARG","events":[{"type":"goal","minute":19,"teamId":"ARG","player":"Lionel Messi","detail":"Goal"},{"type":"goal","minute":36,"teamId":"EGY","player":"Mohamed Salah","detail":"Goal"},{"type":"goal","minute":58,"teamId":"ARG","player":"Lautaro Martinez","detail":"Goal"},{"type":"goal","minute":75,"teamId":"EGY","player":"Omar Marmoush","detail":"Goal"},{"type":"goal","minute":86,"teamId":"ARG","player":"Lionel Messi","detail":"Goal"}]},
    96: {"homeScore":0,"awayScore":0,"penHome":4,"penAway":3,"penWinner":"SUI","winner":"SUI","events":[]},
    97: {"homeScore":2,"awayScore":0,"winner":"FRA","events":[{"type":"goal","minute":31,"teamId":"FRA","player":"Kylian Mbappe","detail":"Goal"},{"type":"goal","minute":79,"teamId":"FRA","player":"Bradley Barcola","detail":"Goal"}]},
    98: {"homeScore":2,"awayScore":1,"winner":"ESP","events":[{"type":"goal","minute":23,"teamId":"ESP","player":"Nico Williams","detail":"Goal"},{"type":"goal","minute":55,"teamId":"BEL","player":"Romelu Lukaku","detail":"Goal"},{"type":"goal","minute":84,"teamId":"ESP","player":"Dani Olmo","detail":"Goal"}]},
    99: {"homeScore":1,"awayScore":2,"winner":"ENG","events":[{"type":"goal","minute":38,"teamId":"NOR","player":"Erling Haaland","detail":"Goal"},{"type":"goal","minute":71,"teamId":"ENG","player":"Harry Kane","detail":"Goal"},{"type":"goal","minute":108,"teamId":"ENG","player":"Phil Foden","detail":"Goal"}]},
    100: {"homeScore":3,"awayScore":1,"winner":"ARG","events":[{"type":"goal","minute":25,"teamId":"ARG","player":"Lionel Messi","detail":"Goal"},{"type":"goal","minute":62,"teamId":"SUI","player":"Breel Embolo","detail":"Goal"},{"type":"goal","minute":98,"teamId":"ARG","player":"Julian Alvarez","detail":"Goal"},{"type":"goal","minute":114,"teamId":"ARG","player":"Lautaro Martinez","detail":"Goal"}]},
    101: {"homeScore":0,"awayScore":2,"winner":"ESP","events":[{"type":"goal","minute":36,"teamId":"ESP","player":"Lamine Yamal","detail":"Goal"},{"type":"goal","minute":71,"teamId":"ESP","player":"Nico Williams","detail":"Goal"}]},
    102: {"homeScore":1,"awayScore":2,"winner":"ARG","events":[{"type":"goal","minute":19,"teamId":"ENG","player":"Harry Kane","detail":"Goal"},{"type":"goal","minute":44,"teamId":"ARG","player":"Lionel Messi","detail":"Goal"},{"type":"goal","minute":81,"teamId":"ARG","player":"Lautaro Martinez","detail":"Goal"}]},
    103: {"homeScore":4,"awayScore":6,"winner":"ENG","events":[{"type":"goal","minute":8,"teamId":"FRA","player":"Kylian Mbappe","detail":"Goal"},{"type":"goal","minute":15,"teamId":"ENG","player":"Harry Kane","detail":"Goal"},{"type":"goal","minute":27,"teamId":"FRA","player":"Bradley Barcola","detail":"Goal"},{"type":"goal","minute":34,"teamId":"ENG","player":"Bukayo Saka","detail":"Goal"},{"type":"goal","minute":49,"teamId":"ENG","player":"Jude Bellingham","detail":"Goal"},{"type":"goal","minute":60,"teamId":"FRA","player":"Antoine Griezmann","detail":"Goal"},{"type":"goal","minute":68,"teamId":"ENG","player":"Phil Foden","detail":"Goal"},{"type":"goal","minute":77,"teamId":"FRA","player":"Kylian Mbappe","detail":"Goal"},{"type":"goal","minute":83,"teamId":"ENG","player":"Cole Palmer","detail":"Goal"},{"type":"goal","minute":90,"teamId":"ENG","player":"Ollie Watkins","detail":"Goal"}]},
    104: {"homeScore":1,"awayScore":0,"winner":"ESP","events":[{"type":"goal","minute":112,"teamId":"ESP","player":"Lamine Yamal","detail":"Goal"}]},
  };

  if (realResults[match.matchId]) {
    const res = realResults[match.matchId];
    events.push(...res.events);
    if (realWorldEvents[match.matchId]) {
      events.push(...realWorldEvents[match.matchId]);
    }
    events.sort((a, b) => a.minute - b.minute);

    let winner = null;
    if (res.homeScore > res.awayScore) {
      winner = match.homeTeamId;
    } else if (res.awayScore > res.homeScore) {
      winner = match.awayTeamId;
    } else if (res.penWinner) {
      // Penalty shootout — penWinner is the winning team's ID (e.g. 'PAR')
      winner = res.penWinner;
    }

    return {
      homeScore: res.homeScore,
      awayScore: res.awayScore,
      winner,
      homePenalties: res.penHome,
      awayPenalties: res.penAway,
      events
    };
  }

  // Fallback: Deterministic outcome calculation for other matches
  const seed = match.matchId;
  const rawHomeScore = (seed * 7 + 1) % 4; // 0, 1, 2, 3
  const rawAwayScore = (seed * 13 + 2) % 3; // 0, 1, 2
  
  const getScorer = (teamId) => {
    const roster = playersData[teamId] || [];
    if (roster.length === 0) return 'Unknown Player';
    const attackers = roster.filter(p => p.position === 'FW' || p.position === 'MF');
    const list = attackers.length > 0 ? attackers : roster;
    const idx = (seed * 17) % list.length;
    const name = list[idx].name;
    return name.replace(/^(GK|DF|MF|FW):\s*/, '');
  };

  for (let i = 0; i < rawHomeScore; i++) {
    const min = ((seed * 19 + i * 29) % 88) + 1;
    events.push({
      type: 'goal',
      minute: min,
      teamId: match.homeTeamId,
      player: getScorer(match.homeTeamId),
      detail: 'Goal'
    });
  }

  for (let i = 0; i < rawAwayScore; i++) {
    const min = ((seed * 23 + i * 31) % 88) + 1;
    events.push({
      type: 'goal',
      minute: min,
      teamId: match.awayTeamId,
      player: getScorer(match.awayTeamId),
      detail: 'Goal'
    });
  }

  if (realWorldEvents[match.matchId]) {
    events.push(...realWorldEvents[match.matchId]);
  }

  events.sort((a, b) => a.minute - b.minute);

  let finalHomeScore = rawHomeScore;
  let finalAwayScore = rawAwayScore;
  const isKnockout = match.stage !== 'Group Stage';

  if (isKnockout && finalHomeScore === finalAwayScore) {
    const extraSeed = seed + 100;
    if (extraSeed % 2 === 0) {
      if (extraSeed % 4 === 0) {
        finalHomeScore += 1;
        events.push({
          type: 'goal',
          minute: 105 + (extraSeed % 15),
          teamId: match.homeTeamId,
          player: getScorer(match.homeTeamId),
          detail: 'Goal'
        });
      } else {
        finalAwayScore += 1;
        events.push({
          type: 'goal',
          minute: 105 + (extraSeed % 15),
          teamId: match.awayTeamId,
          player: getScorer(match.awayTeamId),
          detail: 'Goal'
        });
      }
    }
  }

  let winner = null;
  if (finalHomeScore > finalAwayScore) {
    winner = match.homeTeamId;
  } else if (finalAwayScore > finalHomeScore) {
    winner = match.awayTeamId;
  } else if (isKnockout) {
    winner = (seed % 2 === 0) ? match.homeTeamId : match.awayTeamId;
  }

  return { homeScore: finalHomeScore, awayScore: finalAwayScore, winner, events };
};

// Automatically update match statuses based on current time (automated for match time itself)
export const syncFixturesWithCurrentTime = (fixtures, forceSync = false) => {
  if (!fixtures) return [];
  const now = Date.now();

  return fixtures.map(match => {
    // If the match is already Finished, preserve it.
    if (match.status === 'Finished') {
      return match;
    }



    const matchTime = new Date(match.dateTimeISO).getTime();
    
    // If the match is scheduled in the future, it is Upcoming
    if (now < matchTime) {
      return {
        ...match,
        status: 'Upcoming',
        minute: null,
        homeScore: 0,
        awayScore: 0,
        events: [],
        winner: null,
        stats: {
          possession: [50, 50],
          shots: [0, 0],
          shotsOnTarget: [0, 0],
          fouls: [0, 0]
        }
      };
    }

    const elapsedMs = now - matchTime;
    const elapsedMins = Math.floor(elapsedMs / 60000);

    const isKnockout = match.stage !== 'Group Stage';

    let status = 'Finished';
    let matchMin = 90;

    // Timeline stages of match (in wall-clock time after kickoff):
    // 0 to 45 mins: 1st Half LIVE
    // 45 to 60 mins: Half Time (15 min break)
    // 60 to 105 mins: 2nd Half LIVE (runs from min 46 to 90)
    // 105+ mins: If group stage, Finished. If knockout and draw, goes to Extra Time:
    //   105 to 110 mins: Break before Extra Time (min 90)
    //   110 to 125 mins: Extra Time 1st Half (min 91-105)
    //   125 to 130 mins: Break (min 105)
    //   130 to 145 mins: Extra Time 2nd Half (min 106-120)
    //   145 to 155 mins: Penalty Shootout
    //   155+ mins: Finished

    const fullOutcome = generateDeterministicResult(match);

    if (elapsedMins < 45) {
      status = 'LIVE';
      matchMin = elapsedMins + 1;
    } else if (elapsedMins < 60) {
      status = 'Half Time';
      matchMin = 45;
    } else if (elapsedMins < 105) {
      status = 'LIVE';
      matchMin = 45 + (elapsedMins - 60) + 1;
      if (matchMin > 90) matchMin = 90;
    } else {
      // It has been 90 minutes.
      if (isKnockout && fullOutcome.homeScore === fullOutcome.awayScore) {
        if (elapsedMins < 110) {
          status = 'LIVE';
          matchMin = 90;
        } else if (elapsedMins < 125) {
          status = 'Extra Time';
          matchMin = 90 + (elapsedMins - 110) + 1;
        } else if (elapsedMins < 130) {
          status = 'Extra Time';
          matchMin = 105;
        } else if (elapsedMins < 145) {
          status = 'Extra Time';
          matchMin = 105 + (elapsedMins - 130) + 1;
          if (matchMin > 120) matchMin = 120;
        } else if (elapsedMins < 155) {
          status = 'Penalties';
          matchMin = 120;
        } else {
          status = 'Finished';
          matchMin = 120;
        }
      } else {
        status = 'Finished';
        matchMin = 90;
      }
    }

    // Filter events based on current match minute
    let activeEvents = (fullOutcome.events || []).filter(e => {
      if (status === 'Finished') return true;
      if (status === 'Penalties') return e.minute <= 120;
      return e.minute <= matchMin;
    });

    // Compute live scores based on active events
    let homeScore = 0;
    let awayScore = 0;
    activeEvents.forEach(e => {
      if (e.type === 'goal') {
        if (e.teamId === match.homeTeamId) homeScore++;
        else if (e.teamId === match.awayTeamId) awayScore++;
      }
    });

    // Determine winner & penalties
    let winner = null;
    let homePenalties = undefined;
    let awayPenalties = undefined;

    if (status === 'Finished') {
      winner = fullOutcome.winner;
    }

    const seed = match.matchId;

    if (isKnockout && fullOutcome.homeScore === fullOutcome.awayScore) {
      if (status === 'Penalties' || status === 'Finished') {
        const pSeed = seed + 200;
        const baseHomePen = (pSeed % 3) + 3; // 3, 4, or 5
        const isHomeWinner = fullOutcome.winner === match.homeTeamId;
        
        if (isHomeWinner) {
          homePenalties = baseHomePen;
          awayPenalties = baseHomePen - 1 - (pSeed % 2);
          if (awayPenalties < 0) awayPenalties = 0;
        } else {
          awayPenalties = baseHomePen;
          homePenalties = baseHomePen - 1 - (pSeed % 2);
          if (homePenalties < 0) homePenalties = 0;
        }
      }
    }

    // Generate realistic, deterministic stats
    const homePossession = 35 + ((seed * 3) % 31);
    const awayPossession = 100 - homePossession;
    
    const rawHomeShots = homeScore * 3 + (seed % 6) + 4;
    const rawAwayShots = awayScore * 3 + ((seed * 2) % 6) + 4;
    
    const rawHomeSOT = homeScore + (seed % 3);
    const rawAwaySOT = awayScore + ((seed * 2) % 3);
    
    const rawHomeFouls = ((seed * 4) % 12) + 6;
    const rawAwayFouls = ((seed * 7) % 12) + 6;
    
    const progressFactor = status === 'Finished' ? 1 : Math.min(1, matchMin / 90);
    
    const homeShots = Math.round(rawHomeShots * progressFactor);
    const awayShots = Math.round(rawAwayShots * progressFactor);
    
    const homeSOT = Math.min(homeShots, Math.max(homeScore, Math.round(rawHomeSOT * progressFactor)));
    const awaySOT = Math.min(awayShots, Math.max(awayScore, Math.round(rawAwaySOT * progressFactor)));
    
    const homeFouls = Math.round(rawHomeFouls * progressFactor);
    const awayFouls = Math.round(rawAwayFouls * progressFactor);

    const stats = {
      possession: [homePossession, awayPossession],
      shots: [homeShots, awayShots],
      shotsOnTarget: [homeSOT, awaySOT],
      fouls: [homeFouls, awayFouls]
    };

    return {
      ...match,
      status,
      minute: (status === 'LIVE' || status === 'Extra Time') ? matchMin : (status === 'Upcoming' ? null : matchMin),
      homeScore,
      awayScore,
      events: activeEvents,
      winner,
      homePenalties,
      awayPenalties,
      stats
    };
  });
};

// Initialize localStorage databases if not present
export const initDatabase = () => {
  // Force reset local database to start fresh with clean (Upcoming) 104-match fixtures schedule
  const needsReset = localStorage.getItem('wc_db_clean_start_v21') !== 'true';
  if (needsReset) {
    localStorage.setItem('wc_fixtures', JSON.stringify(initialFixtures));
    localStorage.setItem('wc_teams', JSON.stringify(initialTeams));
    localStorage.setItem('wc_db_clean_start_v21', 'true');
  }

  if (!localStorage.getItem('wc_fixtures')) {
    localStorage.setItem('wc_fixtures', JSON.stringify(initialFixtures));
  }
  if (!localStorage.getItem('wc_teams')) {
    localStorage.setItem('wc_teams', JSON.stringify(initialTeams));
  }
  if (!localStorage.getItem('wc_favorites')) {
    localStorage.setItem('wc_favorites', JSON.stringify([]));
  }
  if (!localStorage.getItem('wc_reminders')) {
    localStorage.setItem('wc_reminders', JSON.stringify([]));
  }
};

// Automatically resolve knockout match team details dynamically based on group stage standings and previous round winners
export const resolveDynamicKnockoutTeams = (fixtures, standings) => {
  if (!fixtures) return [];

  const clonedFixtures = JSON.parse(JSON.stringify(fixtures));

  // Helper to resolve group standings (e.g. 1E, 2A, 3ABCDF)
  const resolveFormulaTeam = (formula) => {
    const existingTeam = standings.find(t => t.id === formula);
    if (existingTeam) {
      return { id: existingTeam.id, name: existingTeam.name };
    }

    const match = formula.match(/^([123])([A-L]+)$/);
    if (!match) return { id: formula, name: `${formula} (TBD)` };

    const rank = parseInt(match[1]); // 1, 2, or 3
    const groupsStr = match[2]; // e.g. "E", "ABCDF", etc.

    if (groupsStr.length === 1) {
      // Single group (e.g. 1E or 2A)
      const groupTeams = standings.filter(t => t.group === groupsStr);
      const allPlayed = groupTeams.every(t => t.played >= 3);
      if (allPlayed) {
        const team = groupTeams[rank - 1];
        if (team) {
          return { id: team.id, name: team.name };
        }
      }
      return { id: formula, name: `${rank}${groupsStr} (TBD)` };
    } else {
      // Best 3rd placed team from a set of groups (e.g. 3ABCDF)
      const allThirdTeams = [];
      const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      groups.forEach(g => {
        const groupTeams = standings.filter(t => t.group === g);
        const allPlayed = groupTeams.every(t => t.played >= 3);
        if (allPlayed && groupTeams[2]) {
          allThirdTeams.push(groupTeams[2]);
        }
      });

      // Sort third teams
      allThirdTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
      });

      // Filter to third teams belonging to the formula groups
      const validThirds = allThirdTeams.filter(t => groupsStr.includes(t.group));
      const team = validThirds[0];
      if (team) {
        return { id: team.id, name: team.name };
      }
      return { id: formula, name: `3rd ${groupsStr} (TBD)` };
    }
  };

  const findMatch = (id) => clonedFixtures.find(m => m.matchId === id);

  const resolveWinner = (matchId, fallbackLabel) => {
    const m = findMatch(matchId);
    if (m && m.status === 'Finished' && m.winner) {
      const team = standings.find(t => t.id === m.winner);
      return { id: m.winner, name: team ? team.name : m.winner };
    }
    return { id: `W${matchId}`, name: fallbackLabel };
  };

  const resolveLoser = (matchId, fallbackLabel) => {
    const m = findMatch(matchId);
    if (m && m.status === 'Finished' && m.winner) {
      const loserId = m.winner === m.homeTeamId ? m.awayTeamId : m.homeTeamId;
      const team = standings.find(t => t.id === loserId);
      return { id: loserId, name: team ? team.name : loserId };
    }
    return { id: `L${matchId}`, name: fallbackLabel };
  };

  // Process the matches
  clonedFixtures.forEach(match => {
    if (match.stage === 'Group Stage') return;

    const oldHomeId = match.homeTeamId;
    const oldAwayId = match.awayTeamId;

    if (match.stage === 'Round of 32') {
      const homeResolved = resolveFormulaTeam(match.homeTeamId);
      const awayResolved = resolveFormulaTeam(match.awayTeamId);
      
      // Update teamId and name dynamically if resolved, otherwise keep placeholder
      match.homeTeamId = homeResolved.id;
      match.homeTeam = homeResolved.name;
      match.awayTeamId = awayResolved.id;
      match.awayTeam = awayResolved.name;
    }

    else if (match.stage === 'Round of 16') {
      const homeWinner = resolveWinner(parseInt(match.homeTeamId.substring(1)) || 73, match.homeTeam);
      const awayWinner = resolveWinner(parseInt(match.awayTeamId.substring(1)) || 74, match.awayTeam);

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Quarter Finals') {
      const homeWinner = resolveWinner(parseInt(match.homeTeamId.substring(1)) || 89, match.homeTeam);
      const awayWinner = resolveWinner(parseInt(match.awayTeamId.substring(1)) || 90, match.awayTeam);

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Semi Finals') {
      const homeWinner = resolveWinner(parseInt(match.homeTeamId.substring(1)) || 97, match.homeTeam);
      const awayWinner = resolveWinner(parseInt(match.awayTeamId.substring(1)) || 98, match.awayTeam);

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Third Place Match') {
      const homeWinner = resolveLoser(101, 'SF 1 Loser');
      const awayWinner = resolveLoser(102, 'SF 2 Loser');

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    else if (match.stage === 'Final') {
      const homeWinner = resolveWinner(101, 'SF 1 Winner');
      const awayWinner = resolveWinner(102, 'SF 2 Winner');

      match.homeTeamId = homeWinner.id;
      match.homeTeam = homeWinner.name;
      match.awayTeamId = awayWinner.id;
      match.awayTeam = awayWinner.name;
    }

    // Dynamic winner calculation for finished matches based on score/penalties
    if (match.status === 'Finished') {
      if (match.homeScore > match.awayScore) {
        match.winner = match.homeTeamId;
      } else if (match.awayScore > match.homeScore) {
        match.winner = match.awayTeamId;
      } else if (match.stage !== 'Group Stage') {
        const homePen = match.homePenalties || 0;
        const awayPen = match.awayPenalties || 0;
        if (homePen > awayPen) {
          match.winner = match.homeTeamId;
        } else if (awayPen > homePen) {
          match.winner = match.awayTeamId;
        }
      }
    }

    // Update winner and events team IDs if they match the old placeholder ID
    if (match.winner) {
      if (match.winner === oldHomeId) {
        match.winner = match.homeTeamId;
      } else if (match.winner === oldAwayId) {
        match.winner = match.awayTeamId;
      }
    }

    if (match.events) {
      match.events.forEach(e => {
        if (e.teamId === oldHomeId) {
          e.teamId = match.homeTeamId;
        } else if (e.teamId === oldAwayId) {
          e.teamId = match.awayTeamId;
        }
      });
    }
  });

  return clonedFixtures;
};

// Retrieve data
export const getFixtures = (forceSync = false) => {
  initDatabase();
  const raw = JSON.parse(localStorage.getItem('wc_fixtures')) || [];
  const synced = syncFixturesWithCurrentTime(raw, forceSync);
  const standings = calculateStandingsFromRaw(synced, getTeams());
  const resolved = resolveDynamicKnockoutTeams(synced, standings);
  return resolved;
};

export const getTeams = () => {
  initDatabase();
  return JSON.parse(localStorage.getItem('wc_teams'));
};

// Update fixtures in localStorage
export const saveFixtures = (fixtures) => {
  const fixturesToSave = fixtures.map(match => {
    if (match.stage !== 'Group Stage') {
      const initialMatch = initialFixtures.find(m => m.matchId === match.matchId);
      if (initialMatch) {
        return {
          ...match,
          homeTeamId: initialMatch.homeTeamId,
          homeTeam: initialMatch.homeTeam,
          awayTeamId: initialMatch.awayTeamId,
          awayTeam: initialMatch.awayTeam
        };
      }
    }
    return match;
  });
  localStorage.setItem('wc_fixtures', JSON.stringify(fixturesToSave));
};

export const calculateStandingsFromRaw = (fixtures, teams) => {
  const standings = teams.map(team => ({
    ...team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0
  }));

  fixtures.forEach(match => {
    if (match.stage !== 'Group Stage') return;
    if (match.status === 'Finished' || match.status === 'LIVE' || match.status === 'Half Time' || match.status === 'Extra Time' || match.status === 'Penalties') {
      const home = standings.find(t => t.id === match.homeTeamId);
      const away = standings.find(t => t.id === match.awayTeamId);

      if (home && away) {
        home.played += 1;
        away.played += 1;
        home.goalsFor += match.homeScore;
        home.goalsAgainst += match.awayScore;
        away.goalsFor += match.awayScore;
        away.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          home.wins += 1;
          home.points += 3;
          away.losses += 1;
        } else if (match.homeScore < match.awayScore) {
          away.wins += 1;
          away.points += 3;
          home.losses += 1;
        } else {
          home.draws += 1;
          away.draws += 1;
          home.points += 1;
          away.points += 1;
        }
      }
    }
  });

  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) {
      return gdB - gdA;
    }
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    return a.name.localeCompare(b.name);
  });

  return standings;
};

// Calculate Standings dynamically based on raw fixtures
export const calculateStandings = (forceSync = false) => {
  const teams = getTeams();
  const rawFixtures = JSON.parse(localStorage.getItem('wc_fixtures')) || [];
  const synced = syncFixturesWithCurrentTime(rawFixtures, forceSync);
  return calculateStandingsFromRaw(synced, teams);
};


