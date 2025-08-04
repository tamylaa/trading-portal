/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$2="?"+h,n$1=`<${o$2}>`,r$2=document,l=()=>r$2.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$2.createTreeWalker(r$2,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$2)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$2.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$2).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$2,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$2.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t.litHtmlPolyfillSupport;j?.(N,R),(t.litHtmlVersions??=[]).push("3.3.1");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

/**
 * Tamyla UI Components - Modern Web Components Architecture
 * 
 * This file demonstrates how to move from the current JavaScript class
 * to a proper Web Components architecture that can be used across
 * Trading Portal, Campaign Engine, and future applications.
 */


/**
 * Content Manager Web Component
 * Replaces the ContentManager.js class with a proper web component
 */
class TamylaContentManager extends i {
  static styles = i$3`
    /* Component styles - scoped to this component */
    :host {
      display: block;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .content-manager {
      width: 100%;
      max-width: var(--content-manager-max-width, 1200px);
      margin: 0 auto;
    }

    .cm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color, #e1e5e9);
    }

    .cm-upload-area {
      border: 2px dashed var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      background: var(--upload-bg, #f8fafc);
      transition: all 0.2s ease;
      cursor: pointer;
      margin-bottom: 2rem;
    }

    .cm-upload-area:hover,
    .cm-upload-area.dragover {
      border-color: var(--primary-color, #3b82f6);
      background: var(--upload-hover-bg, #eff6ff);
      transform: translateY(-2px);
    }

    .cm-content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .cm-content-item {
      background: white;
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .cm-content-item:hover {
      border-color: var(--primary-color, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .cm-content-item.selected {
      border-color: var(--success-color, #10b981);
      background: var(--success-bg, #f0fdf4);
    }

    @media (max-width: 768px) {
      .cm-content-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  `;

  // Component properties (attributes)
  @n({ type: String, attribute: 'api-base' })
  apiBase = '/api/content';

  @n({ type: String, attribute: 'auth-token' })
  authToken = '';

  @n({ type: String, attribute: 'user-id' })
  userId = '';

  @n({ type: Boolean, attribute: 'selection-mode' })
  selectionMode = false;

  @n({ type: Boolean, attribute: 'show-upload' })
  showUpload = true;

  @n({ type: Boolean, attribute: 'show-gallery' })
  showGallery = true;

  @n({ type: Boolean, attribute: 'show-search' })
  showSearch = true;

  @n({ type: Number, attribute: 'max-file-size' })
  maxFileSize = 25 * 1024 * 1024; // 25MB

  @n({ type: Object })
  userPreferences = null;

  // Internal state
  @r()
  content = [];

  @r()
  selectedContent = new Set();

  @r()
  isLoading = false;

  @r()
  searchQuery = '';

  @r()
  currentFilter = 'all';

  connectedCallback() {
    super.connectedCallback();
    this.loadUserState();
    this.loadContent();
    
    // Listen for storage events for cross-tab sync
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.saveUserState();
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  // Load user state from localStorage
  loadUserState() {
    if (!this.userId) return;
    
    const stateKey = `tamyla-content-manager-${this.userId}`;
    const savedState = localStorage.getItem(stateKey);
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.searchQuery = state.searchQuery || '';
        this.currentFilter = state.currentFilter || 'all';
        this.selectedContent = new Set(state.selectedContent || []);
        this.userPreferences = state.userPreferences || {};
      } catch (error) {
        console.warn('Failed to load user state:', error);
      }
    }
  }

  // Save user state to localStorage
  saveUserState() {
    if (!this.userId) return;
    
    const stateKey = `tamyla-content-manager-${this.userId}`;
    const state = {
      searchQuery: this.searchQuery,
      currentFilter: this.currentFilter,
      selectedContent: Array.from(this.selectedContent),
      userPreferences: this.userPreferences,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(stateKey, JSON.stringify(state));
      
      // Dispatch state change event
      this.dispatchEvent(new CustomEvent('state-changed', {
        detail: state,
        bubbles: true
      }));
    } catch (error) {
      console.warn('Failed to save user state:', error);
    }
  }

  // Handle cross-tab state synchronization
  handleStorageChange(event) {
    const stateKey = `tamyla-content-manager-${this.userId}`;
    if (event.key === stateKey && event.newValue) {
      try {
        const state = JSON.parse(event.newValue);
        this.searchQuery = state.searchQuery || '';
        this.currentFilter = state.currentFilter || 'all';
        this.selectedContent = new Set(state.selectedContent || []);
        this.userPreferences = state.userPreferences || {};
        this.requestUpdate();
      } catch (error) {
        console.warn('Failed to sync state from storage:', error);
      }
    }
  }

  render() {
    return x`
      <div class="content-manager">
        ${this.renderHeader()}
        ${this.showUpload ? this.renderUploadArea() : ''}
        ${this.showSearch ? this.renderSearchBar() : ''}
        ${this.showGallery ? this.renderGallery() : ''}
        ${this.renderLoadingSpinner()}
      </div>
    `;
  }

  renderHeader() {
    const selectionCount = this.selectedContent.size;
    return x`
      <div class="cm-header">
        <h3>Content Library</h3>
        <div class="cm-header-actions">
          ${this.selectionMode && selectionCount > 0 ? x`
            <span class="cm-selection-count">${selectionCount} selected</span>
            <button @click=${this.useSelectedContent} ?disabled=${selectionCount === 0}>
              Use Selected (${selectionCount})
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderUploadArea() {
    return x`
      <div class="cm-upload-area" 
           @dragover=${this.handleDragOver}
           @dragleave=${this.handleDragLeave}
           @drop=${this.handleDrop}
           @click=${this.openFileDialog}>
        <div class="cm-upload-icon">📁</div>
        <div class="cm-upload-text">
          <p><strong>Drop files here</strong> or <span>Browse Files</span></p>
          <p>Support: Images, Videos, PDFs, Documents (Max 25MB)</p>
        </div>
        <input type="file" 
               multiple 
               accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
               @change=${this.handleFileSelect}
               style="display: none;">
      </div>
    `;
  }

  renderSearchBar() {
    return x`
      <div class="cm-search-bar">
        <input type="text" 
               placeholder="Search content..."
               .value=${this.searchQuery}
               @input=${this.handleSearch}>
        <div class="cm-filter-tabs">
          <button class=${this.currentFilter === 'all' ? 'active' : ''} 
                  @click=${() => this.setFilter('all')}>All</button>
          <button class=${this.currentFilter === 'image' ? 'active' : ''} 
                  @click=${() => this.setFilter('image')}>Images</button>
          <button class=${this.currentFilter === 'video' ? 'active' : ''} 
                  @click=${() => this.setFilter('video')}>Videos</button>
          <button class=${this.currentFilter === 'document' ? 'active' : ''} 
                  @click=${() => this.setFilter('document')}>Documents</button>
        </div>
      </div>
    `;
  }

  renderGallery() {
    const filteredContent = this.getFilteredContent();
    
    if (filteredContent.length === 0) {
      return x`
        <div class="cm-empty-state">
          <div class="cm-empty-icon">📁</div>
          <h4>No content yet</h4>
          <p>Upload your first file to get started</p>
        </div>
      `;
    }

    return x`
      <div class="cm-gallery">
        <div class="cm-content-grid">
          ${filteredContent.map(item => this.renderContentItem(item))}
        </div>
      </div>
    `;
  }

  renderContentItem(content) {
    const isSelected = this.selectedContent.has(content.id);
    return x`
      <div class="cm-content-item ${isSelected ? 'selected' : ''}"
           @click=${() => this.handleContentClick(content)}>
        ${this.selectionMode ? x`
          <div class="cm-content-select">
            <input type="checkbox" .checked=${isSelected}>
          </div>
        ` : ''}
        
        <div class="cm-content-preview">
          ${this.renderContentThumbnail(content)}
        </div>
        
        <div class="cm-content-info">
          <div class="cm-content-name">${content.original_filename}</div>
          <div class="cm-content-meta">
            <span>${this.formatFileSize(content.file_size)}</span>
            <span>${new Date(content.created_at).toLocaleDateString()}</span>
          </div>
          <div class="cm-content-category">${content.category}</div>
        </div>
      </div>
    `;
  }

  renderContentThumbnail(content) {
    if (content.category === 'image') {
      return x`<img src="${content.file_url}" alt="${content.original_filename}">`;
    } else if (content.category === 'video') {
      return x`
        <div class="cm-video-thumbnail">
          <video src="${content.file_url}" preload="metadata"></video>
          <div class="cm-play-overlay">▶️</div>
        </div>
      `;
    } else {
      return x`
        <div class="cm-file-thumbnail">
          <div class="cm-file-icon">${this.getFileIcon(content.category)}</div>
        </div>
      `;
    }
  }

  renderLoadingSpinner() {
    return this.isLoading ? x`
      <div class="cm-loading">
        <div class="cm-spinner"></div>
        <p>Loading content...</p>
      </div>
    ` : '';
  }

  // Event handlers
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }

  handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('dragover');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    this.handleFiles(e.dataTransfer.files);
  }

  openFileDialog() {
    const input = this.shadowRoot.querySelector('input[type="file"]');
    input.click();
  }

  handleFileSelect(e) {
    this.handleFiles(e.target.files);
  }

  handleSearch(e) {
    this.searchQuery = e.target.value;
    this.saveUserState(); // Persist search state
    
    // Dispatch search event
    this.dispatchEvent(new CustomEvent('search-changed', {
      detail: { query: this.searchQuery },
      bubbles: true
    }));
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.saveUserState(); // Persist filter state
    
    // Dispatch filter event
    this.dispatchEvent(new CustomEvent('filter-changed', {
      detail: { filter: this.currentFilter },
      bubbles: true
    }));
  }

  handleContentClick(content) {
    if (this.selectionMode) {
      this.toggleContentSelection(content.id);
    } else {
      this.showContentPreview(content);
    }
  }

  // Business logic methods
  async handleFiles(files) {
    for (const file of Array.from(files)) {
      if (file.size > this.maxFileSize) {
        this.showError(`File ${file.name} is too large. Maximum size is 25MB.`);
        continue;
      }
      await this.uploadFile(file);
    }
  }

  async uploadFile(file) {
    // Check authentication
    if (!this.authToken) {
      this.dispatchEvent(new CustomEvent('auth-required', {
        detail: { action: 'upload', file: file.name },
        bubbles: true
      }));
      this.showError('Authentication required for file upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', this.getFileCategory(file.type));
    formData.append('description', `Uploaded ${file.name} by user ${this.userId}`);

    try {
      this.isLoading = true;
      
      const response = await fetch(`${this.apiBase}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-User-ID': this.userId || 'anonymous'
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccess(`${file.name} uploaded successfully`);
        this.loadContent(); // Refresh content list
        this.dispatchEvent(new CustomEvent('content-uploaded', {
          detail: result.content,
          bubbles: true
        }));
        
        // Save state after successful upload
        this.saveUserState();
      } else {
        // Handle different error types
        if (response.status === 401) {
          this.dispatchEvent(new CustomEvent('auth-required', {
            detail: { action: 'upload', reason: 'token-expired' },
            bubbles: true
          }));
        }
        this.showError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.showError('Upload failed: ' + error.message);
      
      // Dispatch component error event
      this.dispatchEvent(new CustomEvent('component-error', {
        detail: { 
          error: error.message, 
          context: 'upload', 
          file: file.name,
          recoverable: true 
        },
        bubbles: true
      }));
    } finally {
      this.isLoading = false;
    }
  }

  async loadContent() {
    this.isLoading = true;

    try {
      const headers = {};
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      if (this.userId) {
        headers['X-User-ID'] = this.userId;
      }

      const response = await fetch(`${this.apiBase}/library`, {
        headers
      });

      const result = await response.json();

      if (result.success) {
        this.content = result.content;
      } else {
        if (response.status === 401) {
          this.dispatchEvent(new CustomEvent('auth-required', {
            detail: { action: 'load-content', reason: 'token-expired' },
            bubbles: true
          }));
        }
        this.showError('Failed to load content: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Load content error:', error);
      this.showError('Failed to load content: ' + error.message);
      
      // Dispatch component error event
      this.dispatchEvent(new CustomEvent('component-error', {
        detail: { 
          error: error.message, 
          context: 'load-content',
          recoverable: true 
        },
        bubbles: true
      }));
    } finally {
      this.isLoading = false;
    }
  }

  toggleContentSelection(contentId) {
    if (this.selectedContent.has(contentId)) {
      this.selectedContent.delete(contentId);
    } else {
      this.selectedContent.add(contentId);
    }
    this.requestUpdate(); // Trigger re-render
    this.saveUserState(); // Persist selection state
    
    // Dispatch selection change event
    this.dispatchEvent(new CustomEvent('selection-changed', {
      detail: { 
        selectedCount: this.selectedContent.size,
        selectedIds: Array.from(this.selectedContent)
      },
      bubbles: true
    }));
  }

  useSelectedContent() {
    const selectedItems = this.content.filter(item => 
      this.selectedContent.has(item.id)
    );

    this.dispatchEvent(new CustomEvent('content-selected', {
      detail: selectedItems,
      bubbles: true
    }));

    // Clear selection
    this.selectedContent.clear();
    this.requestUpdate();
  }

  getFilteredContent() {
    let filtered = this.content;

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.original_filename.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(item => item.category === this.currentFilter);
    }

    return filtered;
  }

  getFileCategory(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'document';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    return 'other';
  }

  getFileIcon(category) {
    const icons = {
      document: '📄',
      audio: '🎵',
      image: '🖼️',
      video: '🎬',
      other: '📁'
    };
    return icons[category] || '📁';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    this.dispatchEvent(new CustomEvent('show-notification', {
      detail: { message, type },
      bubbles: true
    }));
  }

  showContentPreview(content) {
    this.dispatchEvent(new CustomEvent('content-preview', {
      detail: content,
      bubbles: true
    }));
  }
}

// Register the component
customElements.define('tamyla-content-manager', TamylaContentManager);

export { TamylaContentManager };
//# sourceMappingURL=content-manager.js.map
