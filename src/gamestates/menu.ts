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

import {Render} from 'render';
import {Input} from 'input';

import {GameState} from '../gamestates/gamestate';

import {MENU_PAGES} from '../data/menupages';


export enum MenuItemType {
  PAGE,
  FUNCTION,
  CHOICE,
  BOOL
}

export interface MenuItemMap { [s: string]: MenuItem; }
export interface MenuItemFunction { () }
export interface MenuPageMap { [s: string]: MenuPage; }

export interface MenuItem {
  name: string;
  type: MenuItemType;
  func?: MenuItemFunction;
  page?: string;
  option?: string;
  choices?: string[];
}

export interface MenuPage {
  name: string;
  items: MenuItemMap;
}


/**
 * Unfinished menu game state.
 */
export class Menu extends GameState {
  private _pages: MenuPageMap = {};

  public constructor(render: Render) {
    super(render);

    this.loadPages();
  }

  private loadPages() {
    for (let pageKey in MENU_PAGES) {
      let pageData: any = MENU_PAGES[pageKey];

      let items: MenuItemMap = {};
      for (let itemKey in pageData.items) {
        let itemData: any = pageData.items[itemKey];
        let item: MenuItem = {
          name: itemData.name,
          type: <MenuItemType>itemData.type,
        };

        if (item.type === MenuItemType.PAGE) {
          item.page = itemData.page;
        } else if (item.type === MenuItemType.FUNCTION) {
          item.func = itemData.func;
        } else if (item.type === MenuItemType.CHOICE) {
          item.option = itemData.option;
          item.choices = itemData.choices;
        } else if (item.type === MenuItemType.BOOL) {
          item.option = itemData.option;
        }

        items[itemKey] = item;
      }

      let page: MenuPage = {
        name: pageData.name,
        items: items
      };

      this._pages[pageKey] = page;
    }
  }

  public render(render: Render, lerp: number) {

  }

  public update(delta: number) {

  }

  public input(input: Input) {

  }
}
