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

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
};

const STATES: any = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  jump: 32
};


/**
 * Input to action mapping. Could use more flexibility.
 */
export class Input {
  private _element: Element;
  private _states: any = {};

  private _keysActive: InputState = <InputState>{};
  private _keysDown: InputState = <InputState>{};
  private _keysPreviousActive: InputState = <InputState>{};

  constructor(element: Element) {
    this._element = element;
    window.addEventListener('keydown', this.keydown.bind(this));
    window.addEventListener('keyup', this.keyup.bind(this));
  }

  public update() {
    this._keysActive.left = this._states[37];
    this._keysActive.up = this._states[38];
    this._keysActive.right = this._states[39];
    this._keysActive.down = this._states[40];
    this._keysActive.jump = this._states[32];

    this._keysDown.left = (!this._keysPreviousActive.left && this._keysActive.left);
    this._keysDown.up = (!this._keysPreviousActive.up && this._keysActive.up);
    this._keysDown.right = (!this._keysPreviousActive.right && this._keysActive.right);
    this._keysDown.down = (!this._keysPreviousActive.down && this._keysActive.down);
    this._keysDown.jump = (!this._keysPreviousActive.jump && this._keysActive.jump);

    this._keysPreviousActive.left = this._keysActive.left;
    this._keysPreviousActive.up = this._keysActive.up;
    this._keysPreviousActive.right = this._keysActive.right;
    this._keysPreviousActive.down = this._keysActive.down;
    this._keysPreviousActive.jump = this._keysActive.jump;
  }

  public get keysActive(): InputState {
    return this._keysActive;
  }

  public get keysDown(): InputState {
    return this._keysDown;
  }

  private keydown(event: KeyboardEvent) {
    this._states[event.keyCode] = true;
  }

  private keyup(event: KeyboardEvent) {
    this._states[event.keyCode] = false;
  }
}
