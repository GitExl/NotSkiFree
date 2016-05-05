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

import {SystemID} from 'systems/ids';
import {System, Component} from 'systems/system';
import {Render} from 'render';
import {Input} from 'input';
import {Camera} from 'camera';

import {ENTITY_TEMPLATES} from 'data/entitytemplates';


// An entity template definition.
interface EntityTemplate {
  components: any;
}

// A function handling an entity event.
interface EventHandler { (event: EntityEvent, ...args): void }

// A map for systems keyed by their name.
interface SystemNameMap { [s: string]: System; }

// A map for entity templtes keyed by their name.
interface EntityTemplateMap { [s: string]: EntityTemplate; }

// A map containing event handler lists for each known entity.
interface EventHandlerMap { [s: string]: EventHandler[]; }

// A map of event handlers for a single entity.
interface EventMap { [s: string]: EventHandlerMap; }

// Event data for a single entity event.
export interface EntityEvent {
  sourceID: EntityID;
  targetID: EntityID;
  entities: Entities;
}


// Basic type for an entity ID.
export type EntityID = string;


/**
 * Manages any given entity systems and their components, and provides eventing
 * functionality between systems and entities.
 */
export class Entities {

  // The next available entity ID.
  private _nextId: number = 0;

  // An array of component systems. Needs to be in the order that the systems
  // are updated.
  private _systems: System[] = [];

  // Maps system names to system instances.
  private _systemNames: SystemNameMap = {};

  // Contains entity templates keyed by their name.
  private _templates: EntityTemplateMap = {};

  // Registered event handlers.
  private _events: EventMap = {};

  // A list of entity IDs marked for removal.
  private _remove: EntityID[] = [];

  /**
   * Default constructor.
   */
  constructor() {
    this.createTemplates();
  }

  /**
   * Creates entity templates from an entity template data object.
   */
  private createTemplates() {
    for (let key in ENTITY_TEMPLATES) {
      let template: any = ENTITY_TEMPLATES[key];
      this._templates[key] = <EntityTemplate>{
        components: template
      };
    }
  }

  /**
   * Adds an array of component system instances to this entity list.
   *
   * @param {System[]} systems The array of systems to add.
   */
  public addSystems(systems: System[]) {

    // Add systems to our internal list.
    for (let system of systems) {
      this._systems.push(system);
      this._systemNames[system.name] = system;
    }

    // Sort the internal list of systems in order of their ID, to ensure their
    // execution order.
    this._systems.sort(function(a: System, b: System): number {
      if (a.id < b.id) {
        return -1;
      } else if (a.id > b.id) {
        return 1;
      }

      return 0;
    });
  }

  /**
   * Creates a new entity from a template.
   *
   * @param {string} templateName The name of the template to create a new
   *                              entity from.
   */
  public createFromTemplate(templateName: string, components: any = undefined): EntityID {

    // Validate the template name.
    if (!(templateName in this._templates)) {
      throw new Error(`Unknown entity template "{$templateName}"`);
    }

    let id: string = this.addEntity();

    // Create
    let template: EntityTemplate = this._templates[templateName];
    for (let systemName in template.components) {

      // Validate the component system name.
      if (!(systemName in this._systemNames)) {
        throw new Error(`Cannot instantiate entity from template "{$templateName}", no system named "{$systemName}".`);
      }

      // Create a component for this system.
      let system: System = this._systemNames[systemName];
      let component = system.add(id);

      // Assign the template's properties to the new component.
      let templateComponent: any = template.components[systemName];
      for (let propertyKey in templateComponent) {
        component[propertyKey] = templateComponent[propertyKey];
      }

      // Set creation properties, if any.
      if (components) {
        if (systemName in components) {
          let templateComponent: any = components[systemName];
          for (let propertyKey in templateComponent) {
            component[propertyKey] = templateComponent[propertyKey];
          }
        }
      }
    }

    // Finalize all components in the new entity.
    for (let system of this._systems) {
      if (!(system.name in template.components)) {
        continue;
      }
      system.finalize(id);
    }

    this.triggerEvent(id, id, 'create');

    return id;
  }

  /**
   * Adds a new entity to this list.
   *
   * No components will be created for this entity, but just an ID will be
   * reserved for it.
   *
   * @return {EntityID} The ID of the enwly added entity.
   */
  private addEntity(): EntityID {
    let id: number = this._nextId + 1;
    this._nextId++;
    return id.toString();
  }

  /**
   * Marks an entity for removal after all updating has finished.
   *
   * @param {EntityID} id The ID of the entity to remove.
   */
  public removeEntity(id: EntityID) {
    this._remove.push(id);
  }

  /**
   * Conveniece function to return an entity's component from a system, without
   * having to get a reference to the system itself.
   *
   * @param  {SystemID}  systemID The ID of the system to get the component from.
   * @param  {EntityID}  entityID The ID of the entity to get the component for.
   *
   * @return {Component}          A component.
   */
  public getComponent(systemID: SystemID, entityID: EntityID): Component {
    return this._systems[systemID].get(entityID);
  }

  /**
   * Updates all registered component systems.
   *
   * @param {number} delta The time that has passed since the previous update,
   *                       in seconds.
   */
  public update(delta: number) {
    for (let system of this._systems) {
      system.update(delta);
    }

    // Remove entities and their event handlers that are marked for removal.
    for (let id of this._remove) {
      this.triggerEvent(id, id, 'destroy');
      for (let systemName in this._systems) {
        this._systems[systemName].remove(id);
      }
      delete this._events[id];
    }
    this._remove.length = 0;
  }

  /**
   * Sends input to all registered component systems.
   *
   * @param {number} input The input object to send.
   */
  public input(id: EntityID, input: Input) {
    for (let system of this._systems) {
      system.input(id, input);
    }
  }

  /**
   * Renders all registered component systems.
   *
   * @param {number} lerp The interpolation value to render with.
   */
  public render(render: Render, camera: Camera, lerp: number) {
    for (let system of this._systems) {
      system.render(render, camera, lerp);
    }
  }

  /**
   * Adds an event listener to an entity,
   *
   * @param {EntityID}     id        The ID of the entity to add an event
   *                                 listener to.
   * @param {string}       eventName The name of the event.
   * @param {EventHandler} handler   The event handler function that will
   *                                 be called when the event is triggered.
   */
  public addEventListener(id: EntityID, eventName: string, handler: EventHandler) {
    if (!(id in this._events)) {
      this._events[id] = {};
    }
    if (!(eventName in this._events[id])) {
      this._events[id][eventName] = [];
    }

    this._events[id][eventName].push(handler);
  }

  /**
   * Removes an event listener from an entity.
   *
   * @param {EntityID}     id            The ID of the entity to remove the
   *                                     event listener from.
   * @param {string}       eventName     The name of the event.
   * @param {EventHandler} removeHandler The handler function to remove.
   */
  public removeEventListener(id: EntityID, eventName: string, removeHandler: EventHandler) {
    if (!(id in this._events)) {
      return;
    }
    if (!(eventName in this._events[id])) {
      return;
    }

    // Find the exact event handler function to remove.
    for (let index: number = 0; index < this._events[id][eventName].length; index++) {
      if (this._events[id][eventName][index] === removeHandler) {
        this._events[id][eventName].splice(index, 1);
        return;
      }
    }
  }

  /**
   * Triggers an event on an entity. All listening event handlers will be
   * called.
   *
   * @param {EntityID} sourceID  The ID of the entity that triggered the
   *                             event.
   * @param {string}   eventName The name of the event that is triggered.
   */
  public triggerEvent(targetID: EntityID, sourceID: EntityID, eventName: string, ...args: any[]) {
    if (!(targetID in this._events)) {
      return;
    }
    if (!(eventName in this._events[targetID])) {
      return;
    }

    // Add an event object to the argument list.
    let event: EntityEvent = <EntityEvent>{
      targetID: targetID,
      sourceID: sourceID,
      entities: this
    };
    args.unshift(event);

    for (let handler of this._events[targetID][eventName]) {
      handler.apply(this, args);
    }
  }

  /**
   * Return a component system.
   *
   * @param {SystemID} systemID The ID of the component system to return.
   */
  public getSystem(systemID: SystemID) {
    return this._systems[systemID];
  }
}
