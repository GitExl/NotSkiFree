/*
  Copyright (c) 2016, Dennis Meuwissen
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
  2. Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

enum GameMode {
  FREESTYLE,
  SURVIVAL,
  RACE
}

const HIGHSCORE_COUNT: number = 8;
const HIGHSCORE_KEY: string = 'skifree.highscores';

const HIGHSCORE_DEFAULTS = {
  'freestyle': [
    {name: 'name 1', time: 0, score: 175000},
    {name: 'name 5', time: 0, score: 150000},
    {name: 'name 2', time: 0, score: 125000},
    {name: 'name 8', time: 0, score: 100000},
    {name: 'name 6', time: 0, score: 75000},
    {name: 'name 9', time: 0, score: 50000},
    {name: 'name 3', time: 0, score: 25000},
    {name: 'name 4', time: 0, score: 12500}
  ],
  'survival': [
    {name: 'name 1', time: 360, score: 0},
    {name: 'name 5', time: 320, score: 0},
    {name: 'name 2', time: 280, score: 0},
    {name: 'name 8', time: 240, score: 0},
    {name: 'name 6', time: 200, score: 0},
    {name: 'name 9', time: 160, score: 0},
    {name: 'name 3', time: 120, score: 0},
    {name: 'name 4', time: 80, score: 0}
  ],
  'race': [
    {name: 'name 1', time: 360, score: 0},
    {name: 'name 5', time: 320, score: 0},
    {name: 'name 2', time: 280, score: 0},
    {name: 'name 8', time: 240, score: 0},
    {name: 'name 6', time: 200, score: 0},
    {name: 'name 9', time: 160, score: 0},
    {name: 'name 3', time: 120, score: 0},
    {name: 'name 4', time: 80, score: 0}
  ]
};

export interface Score {
  name: string;
  time: number;
  score: number;
}

export function addHighscore(mode: string, score: number, time: number) {
  var scores: Score[] = getHighscores(mode);

  // TODO
}

export function getHighscores(mode: string): Score[] {
  var data: string = localStorage.getItem(HIGHSCORE_KEY + '.' + mode);

  var scores: Score[];
  if (scores === null) {
    scores = HIGHSCORE_DEFAULTS[mode];
  } else {
    scores = JSON.parse(data);
  }

  return scores;
}

export function putHighscores(mode: string, scores: Score[]) {
  localStorage.setItem(HIGHSCORE_KEY + '.' + mode, JSON.stringify(scores));
}
