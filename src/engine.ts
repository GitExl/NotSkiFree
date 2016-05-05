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

import {Font} from 'font';
import {Input} from 'input';
import {Render} from 'render';
import {isHidden} from 'visibility';

import {GameState} from 'gamestates/gamestate';
import {GameStateLevel} from 'gamestates/level';


const UPDATE_RATE: number = 1000 / 20;
const UPDATE_DELTA_MAX: number = 200;


/**
 * Main Game engine class. Handles game state stack.
 */
export class Engine {
  private _render: Render;
  private _input: Input;

  private _states: GameState[] = [];

  private _previousFrameTimestamp: number = 0;
  private _delta: number = 0;

  constructor() {
    let element: Element = document.querySelector('#canvas');

    this._render = new Render(element);
    this._input = new Input(element);

    this._states.push(new GameStateLevel(this._render));
  }

  public run() {
    requestAnimationFrame(this.frame.bind(this));
  }

  private frame(timeStamp: number) {

    // Get time passed since last frame.
    this._delta += timeStamp - this._previousFrameTimestamp;
    this._previousFrameTimestamp = timeStamp;

    // Skip updates after longer periods of inactivity.
    if (isHidden || this._delta > UPDATE_DELTA_MAX) {
      this._delta = 0;
    }

    // Update as many times as needed to catch up to the current update timestamp.
    while (this._delta >= UPDATE_RATE) {
      this.update(UPDATE_RATE / 1000);
      this._delta -= UPDATE_RATE;
    }

    // Determine render interpolation based on where between the current and next frame we are.
    let lerp: number = this._delta / UPDATE_RATE;

    for (let state of this._states) {
      state.render(this._render, lerp);
    }

    requestAnimationFrame(this.frame.bind(this));
  }

  private update(delta: number) {
    this._input.update();
    this._states[this._states.length - 1].input(this._input);

    for (let state of this._states) {
      if (state.paused) {
        continue;
      }
      state.update(delta);
    }
  }

  public get render(): Render {
    return this._render;
  }
}
