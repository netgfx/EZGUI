﻿

//declare var __extends;
module EZGUI.Compatibility {
    export var PIXIVersion =
        (PIXI.VERSION.indexOf('v3.') == 0 || PIXI.VERSION.indexOf('3.') == 0) ? 3 : 2;


    export var isPhaser = (typeof Phaser != 'undefined');

    export class TilingSprite {
        constructor(texture: PIXI.Texture, width: number, height: number) {
        }
    }


    export class GUIContainer extends PIXI.DisplayObjectContainer {}

    if (PIXIVersion == 3) {
        Compatibility['GUIContainer'] = PIXI['Container'];
    }
    else {
        Compatibility['GUIContainer'] = PIXI['DisplayObjectContainer'];
    }


    export class GUIDisplayObjectContainer extends GUIContainer {
        protected phaserGroup;
        public _listeners;
        constructor() {
            super();
            if (typeof Phaser != 'undefined') {
                this.phaserGroup = Phaser.GAMES[0].add.sprite(0, 0);//new Phaser.Group(Phaser.GAMES[0]);
                this.phaserGroup.addChild(this);
            }
            
        }

    }

    //var dummy:any = (function (_super) {
    //    __extends(GUIDisplayObjectContainer, _super);
    //    function GUIDisplayObjectContainer() {
    //        _super.call(this, [Phaser.GAMES[0]]);
    //    }
    //    return GUIDisplayObjectContainer;
    //})(Phaser.Group);
    
    //Compatibility['GUIDisplayObjectContainer'] = dummy;


    export function createRenderTexture(width, height) {
        var texture;
        if (EZGUI.Compatibility.PIXIVersion == 3) {
            texture = new PIXI.RenderTexture(EZGUI.tilingRenderer, width, height);
        }
        else {
            texture = new PIXI.RenderTexture(width, height, EZGUI.tilingRenderer);
        }

        return texture;
    }

}


if (EZGUI.Compatibility.PIXIVersion == 3) {
    //EZGUI.tilingRenderer = new PIXI.WebGLRenderer();
    EZGUI.tilingRenderer = new PIXI.CanvasRenderer();
    EZGUI.Compatibility.TilingSprite = ((<any>PIXI).extras).TilingSprite;
}
else {
    EZGUI.tilingRenderer = new PIXI.CanvasRenderer();
    EZGUI.Compatibility.TilingSprite = PIXI.TilingSprite;
}




if (PIXI.EventTarget) {
    PIXI.EventTarget.mixin(EZGUI.Compatibility.GUIDisplayObjectContainer.prototype);
}
else {
    var proto:any = EZGUI.Compatibility.GUIDisplayObjectContainer.prototype;

    proto.on = function (event, fct) {
        this._listeners = this._listeners || {};
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(fct);
    }
    proto.off = function (event, fct?) {               
        this._listeners = this._listeners || {};
        if (!fct) {
            this._listeners[event] = [];
        }
        else {
            if (event in this._listeners === false || typeof this._listeners[event] != 'array') return;
            this._listeners[event].splice(this._listeners[event].indexOf(fct), 1);
        }
    }
    proto.emit = function(event, ...args: any[]) {
        this._listeners = this._listeners || {};
        if (event in this._listeners !== false) {
            for (var i = 0; i < this._listeners[event].length; i++) {
                var fct = this._listeners[event][i];
                fct.apply(this, args);

                if (fct.__nbcalls__) {
                    fct.__nbcalls__--;
                    if (fct.__nbcalls__ <= 0) this.unbind(event, fct);
                }
            }
        }

    }
}