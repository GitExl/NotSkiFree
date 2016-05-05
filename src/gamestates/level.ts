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

import {GameState} from './gamestate';

import {Render, Coords} from '../render';
import {Camera} from '../camera';
import {Input} from '../input';
import {HUD} from '../hud';
import {MapGenerator} from '../mapgenerator';
import {EntityID, Entities} from '../entities';

import {SystemID} from '../systems/ids';
import {SystemAnimation} from '../systems/animation';
import {SystemPosition, ComponentPosition} from '../systems/position';
import {SystemScript, ComponentScript} from '../systems/script';
import {SystemRender} from '../systems/render';
import {SystemPrune} from '../systems/prune';
import {SystemCollision} from '../systems/collision';
import {SystemTracks} from '../systems/tracks';


enum GameMode {
  FREESTYLE,
  SURVIVAL,
  RACE
}


// The distance (* player Y velocity) the camera will look ahead on the Y axis.
const CAMERA_LOOKAHEAD: number = 8.5;


/**
 * GameState for a level and it's subcomponents.
 */
export class GameStateLevel extends GameState {
  private _hud: HUD;
  private _mapGenerator: MapGenerator;
  private _camera: Camera;
  private _entities: Entities;

  private _playerID: EntityID;
  private _yetiID: EntityID;

  private _mode: GameMode;


  public constructor(render: Render) {
    super(render);

    this._mode = GameMode.FREESTYLE;

    this._camera = new Camera(render.scale, render.width, render.height);

    this._entities = new Entities();
    this._entities.addSystems([
      new SystemPosition(this._entities),
      new SystemPrune(this._entities),
      new SystemCollision(this._entities),
      new SystemAnimation(this._entities),
      new SystemScript(this._entities),
      new SystemTracks(this._entities),
      new SystemRender(this._entities)
    ]);

    this.spawnPlayer();

    this._hud = new HUD(this._entities, render);
    this._hud.setTarget(this._playerID);

    this._mapGenerator = new MapGenerator(this._camera, this._entities);
  }

  /**
   * Spawns the player entity for this level.
   */
  private spawnPlayer() {
    this._playerID = this._entities.createFromTemplate('skier');
    let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, this._playerID);
    this._camera.centerOn(pos.x, pos.y);
  }

  /**
   * Updates this level's state.
   */
  public update(delta: number) {

    // Update camera position or camera movement target.
    let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, this._playerID);
    if (pos) {
      this._camera.setTarget(pos.x, pos.y + pos.velY * CAMERA_LOOKAHEAD);
    } else if (this._yetiID) {
      pos = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, this._yetiID);
      this._camera.setTarget(pos.x, pos.y);
    }

    // Yeti time!
    if (!this._yetiID && pos.y >= 666 * 24.24) {
      this._yetiID = this._entities.createFromTemplate('yeti', {
        position: {
          x: (Math.random() < 0.5) ? pos.x - this._camera.scaledWidth / 2 - 64 : pos.x + this._camera.scaledWidth / 2 + 64,
          y: pos.y - 64
        }
      });

      let script: ComponentScript = <ComponentScript>this._entities.getComponent(SystemID.SCRIPT, this._yetiID);
      script.data.targetID = this._playerID;
    }

    // Update level subcomponents.
    this._camera.update(delta);
    this._mapGenerator.update(delta);
    this._entities.update(delta);
    this._hud.update(delta);
  }

  public input (input: Input) {
    this._entities.input(this._playerID, input);
  }

  public render(render: Render, lerp: number) {
    this._camera.setSize(render.width, render.height);
    this._camera.lerp(lerp);

    this._entities.render(render, this._camera, lerp);
    this._hud.render();
    render.render(this._camera, lerp);
  }
}
