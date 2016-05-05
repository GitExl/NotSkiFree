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

import {EntityID, Entities, EntityEvent} from '../entities';
import {Render} from '../render';
import {Input} from '../input';
import {Camera} from '../camera';

import {System, Component} from '../systems/system';
import {SystemID} from '../systems/ids';


export interface ScriptFunc { (id: EntityID, entities: Entities): void };
export interface ScriptUpdateFunc { (id: EntityID, entities: Entities, delta: number): void };
export interface ScriptRenderFunc { (id: EntityID, entities: Entities, render: Render, camera: Camera, lerp: number): void };
export interface ScriptInputFunc { (id: EntityID, entities: Entities, input: Input): void };

export interface ComponentScript extends Component {
  scriptClass?: new(id: EntityID, entities: Entities) => ScriptHandler;
  instance?: ScriptHandler;

  create?: ScriptFunc;
  update?: ScriptUpdateFunc;
  destroy?: ScriptFunc;
  render?: ScriptRenderFunc;
  input?: ScriptInputFunc;

  data?: any;
}


/**
 * Class for more complex entity scripts.
 */
export class ScriptHandler {
  protected _id: EntityID;
  protected _entities: Entities;

  constructor(id: EntityID, entities: Entities) {
    this._id = id;
    this._entities = entities;
  }

  public create() {}
  public update(delta: number) {}
  public destroy() {}
  public render(render: Render, camera: Camera, lerp: number) {}
  public input(input: Input) {}
}


/**
 * Runs scripts at certain events for entities.
 */
export class SystemScript extends System {
  public init(): Component {
    return <ComponentScript>{};
  }

  public finalize(id: EntityID) {
    this._entities.addEventListener(id, 'create', this.create.bind(this));
    this._entities.addEventListener(id, 'destroy', this.destroy.bind(this));

    let script: ComponentScript = <ComponentScript>this._components[id];
    if (script.scriptClass) {
      script.instance = new script.scriptClass(id, this._entities);
    }
  }

  private create(event: EntityEvent) {
    let script: ComponentScript = <ComponentScript>this._components[event.targetID];
    if (script.create) {
      script.create(event.targetID, this._entities);
    } else if (script.instance) {
      script.instance.create();
    }
  }

  private destroy(event: EntityEvent) {
    let script: ComponentScript = <ComponentScript>this._components[event.targetID];
    if (script.destroy) {
      script.destroy(event.targetID, this._entities);
    } else if (script.instance) {
      script.instance.destroy();
    }
  }

  public input(id: EntityID, input: Input) {
    let script: ComponentScript = <ComponentScript>this._components[id];
    if (!script) {
      return;
    }

    if (script.input) {
      script.input(id, this._entities, input);
    } else if (script.instance) {
      script.instance.input(input);
    }
  }

  public update(delta: number) {
    for (let id in this._components) {
      let script: ComponentScript = <ComponentScript>this._components[id];
      if (script.update) {
        script.update(id, this._entities, delta);
      } else if (script.instance) {
        script.instance.update(delta);
      }
    }
  }

  public render(render: Render, camera: Camera, lerp: number) {
    for (let id in this._components) {
      let script: ComponentScript = <ComponentScript>this._components[id];
      if (script.render) {
        script.render(id, this._entities, render, camera, lerp);
      } else if (script.instance) {
        script.instance.render(render, camera, lerp);
      }
    }
  }

  public get name(): string {
    return 'script';
  }

  public get id(): SystemID {
    return SystemID.SCRIPT;
  }
}
