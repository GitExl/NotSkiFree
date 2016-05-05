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

import {EntityID, Entities} from '../entities';
import {Input} from '../input';
import {Render} from '../render';
import {Camera} from '../camera';

import {SystemID} from '../systems/ids';


// Map of a system's components, keyed by EntityID.
interface ComponentMap { [s: string]: Component; }

// Basic component for a system's data.
export interface Component {}


/**
 * Base class for an entity component system.
 *
 * An entity system contains all the data for entities that have a component
 * registered with it. It contains the functions needed to manipulate it's own
 * data.
 */
export class System {

  // The components registered with this system.
  protected _components: ComponentMap = {};

  // A reference to the Entities instance this system is a part of.
  protected _entities: Entities;

  constructor(entities: Entities) {
    this._entities = entities;
  }

  /**
   * Adds a new component to this system.
   *
   * @param  {EntityID}  id The ID of the entity that the new component
   *                        belongs to.
   *
   * @return {Component}    An empty component object.
   */
  public add(id: EntityID): Component {
    let component: Component = this.init();
    this._components[id] = component;
    return component;
  }

  /**
   * Finalized a component's data. This is intended to be called after all of
   * an entity's components have been initialized, so that they can get
   * references or other data from each other.
   *
   * @param {EntityID} id The entity ID of the component to finalize.
   */
  public finalize(id: EntityID) {}

  /**
   * Removes a component from this system.
   *
   * @param {EntityID} id The entity ID of the component to remove.
   */
  public remove(id: EntityID) {
    delete this._components[id];
  }

  /**
   * Returns a component from this system.
   *
   * @param  {EntityID}  id The entity ID of the component to return.
   *
   * @return {Component}    The component belonging to the requested entity.
   */
  public get(id: EntityID): Component {
    return this._components[id];
  }

  /**
   * Initializes a component. This must set defaults for all the requires
   * values of a system's component interface.
   *
   * @return {Component} The initialized component object.
   */
  public init(): Component {
    return <Component>{}
  }

  /**
   * Updates this system. Component iteration is normally performed inside this function.
   *
   * @param {number} delta The amount of time that passed since the last call to this function.
   */
  public update(delta: number) {}

  /**
   * Renders this system.
   *
   * @param {Render} render A Render object instance to use for rendering.
   * @param {Camera} camera A Camera object instance to use to render to.
   * @param {number} lerp   The interpolation value inbetween ticks to render with.
   */
  public render(render: Render, camera: Camera, lerp: number) {}

  /**
   * Recieved input for this system.
   *
   * @param {EntityID} id    The entity to get input for.
   * @param {Input}    input Input instance containing the input.
   */
  public input(id: EntityID, input: Input) {}

  /**
   * Returns the basic name for this system.
   *
   * @return {string} The name.
   */
  public get name(): string {
    throw new Error('Base System class has no name.');
  }

  /**
   * Returns the SystemID for this system.
   *
   * @return {SystemID} The ID for this system.
   */
  public get id(): SystemID {
    throw new Error('Base System class has no ID.');
  }
}
