(function () {
  'use strict';

  /**
   * **EventEmitter** in Leistrap
   * 
   * The `EventEmitter` is a core utility in Leistrap designed to create unique, bidirectional communication channels.
   * It facilitates asynchronous and fluid information sharing between various UI components and elements within the application. 
   * Thanks to its core methods, **`handle`** and **`invoke`**, the EventEmitter enables seamless event-driven communication 
   * between objects, promoting better decoupling and reusability.
   * 
   * - **Key Features**:
   *   - **`handle`**: Define a channel and attach a listener to it.
   *   - **`invoke`**: Trigger a channel, executing its attached listener if it exists.
   *   - **`removeEvent`**: Remove a channel if it's removable.
   *   - **`hasEvent`**: Check if a channel exists.
   *   - **`eventsList`**: Get a list of all registered channels.
   *   - **`clear`**: Cleanup all registered channels and events.
   */
  const lsEmitter = function (obj) {

      let channels = {};
      let inWaitChannel = {};
      let data = null;
      let isDestroyed = false;

      const event_ = { send: (d) => { data = d; } };

      function validateChannelName(channel) {
          if (!channel || typeof channel !== "string" || channel.trim() === "") {
              throw new EventEmitterError(
                  "Invalid channel name: The channel name must be a non-empty string.",
                  "INVALID_CHANNEL_NAME"
              );
          }
       }
      

       function checkState(){
          if(isDestroyed){
              throw new EventEmitterError(
                  "Operation failed: The EventEmitter instance has been destroyed.\n " +
                  "No further actions can be performed on this instance.\n " +
                  "Ensure you are not referencing a cleared or invalid EventEmitter object.\n",
                  "EVENT_DESTROYED"
              );
          }
       }

      class EventEmitterError extends Error {
          constructor(message, code) {
              super(message);
              this.name = "EventEmitterError";
              this.code = code; 
          }
      }


          
      /**
       * **`invoke`**: Trigger a channel and execute its listener.
       * 
       * This method is used to invoke a channel. If the channel does not exist yet, it is added to a queue 
       * and invoked as soon as it is defined via **`handle`**.
       * 
       * @param {string} channel - The name of the channel to invoke.
       * @param {function|null} [listener=null] - A callback function to execute immediately after the channel's listener 
       *                                          is invoked. This callback receives data sent from the channel's listener 
       *                                          through **`event.send(data)`**. Can be `null` if no additional processing is needed.
       * @param {...any} args - Additional arguments to pass to the channel's listener. These can include strings, arrays, 
       *                        objects, or asynchronous callbacks.
       * 
       * **Note**: It is recommended to use asynchronous callbacks if you need to handle complex operations.
       * 
       * **Example Usage**:
       * ```javascript
       * eventEmitter.invoke("myChannel", (data) => {
       *     console.log("Response from listener:", data);
       * }, "arg1", { key: "value" });
       * ```
       */
      async function invoke(channel, listener, ...args) {

          validateChannelName(channel);
      
          async function exe() {
              if ( !isDestroyed  && channels[channel]) {
                  await channels[channel].listener(event_, ...args);
              }
              if ( !isDestroyed && listener) listener(data);
              data = null;
          }
      
          if (!isDestroyed && obj.has(channel, channels)) {
              obj.after(1, exe);
          } else {
              if(!inWaitChannel[channel]) inWaitChannel[channel] = [];
              inWaitChannel[channel].push(() => obj.after(1, exe));
          }
      }



       /**
       * **`handle`**: Define a new channel and attach a listener to it.
       * 
       * This method is used to create a channel and listen for invocations on it via **`invoke`**.
       * 
       * @param {string} channel - The name of the channel to create.
       * @param {function} listener - The handler function to be called when the channel is invoked. 
       *                              The first parameter of this function must always be **`event`**, 
       *                              which is used to send immediate data to the listener via **`event.send(data)`**.
       *                              Additional parameters can be passed through **`...args`**.
       * @param {boolean} [removable=true] - Indicates whether the channel can be removed later using **`removeEvent`**. 
       *                                     Default is `true`. If set to `false`, the channel cannot be removed.
       * @param {boolean} [writable=true] - Defines whether the channel can be overwritten. Default is `true`. 
       *                                    If set to `false`, the channel becomes immutable and cannot be modified.
       * 
       * **Example Usage**:
       * ```javascript
       * eventEmitter.handle("myChannel", (event, data) => {
       *     console.log("Data received:", data);
       *     event.send({ success: true });
       * }, true, true);
       * ```
       */
      async function handle(channel, listener, removable = true, writable = true) {
          checkState();
          validateChannelName(channel);
      
          if (obj.has(channel, channels) && !channels[channel].writable) {
              throw new EventEmitterError(
                  `Cannot redefine the channel "${channel}" because it is marked as non-writable.`,
                  "NON_WRITABLE_CHANNEL"
              );
          }
      
          if (obj.has(channel, inWaitChannel)) {
              inWaitChannel[channel].forEach(function(item){
                  item();
              });
              delete inWaitChannel[channel];
          }

          channels[channel] = { listener, removable, writable };
      }
      

      
      /**
       * **`removeEvent`**: Remove a registered channel.
       * 
       * This method removes a channel from the EventEmitter. If the channel is not marked as **`removable`**, 
       * it will throw an error.
       * 
       * @param {string} channel - The name of the channel to remove.
       * @throws {Error} If the channel is not removable.
       * 
       * **Example Usage**:
       * ```javascript
       * eventEmitter.removeEvent("myChannel");
       * ```
       */
      function removeChannel(channel) {
          checkState();
          validateChannelName(channel);
      
          if (!obj.has(channel, channels)) {
              throw new EventEmitterError(
                  `Cannot remove the channel "${channel}" because it does not exist.`,
                  "CHANNEL_NOT_FOUND"
              );
          }
      
          if (!channels[channel].removable) {
              throw new EventEmitterError(
                  `Cannot remove the channel "${channel}" because it is marked as non-removable.`,
                  "NON_REMOVABLE_CHANNEL"
              );
          }
      
          delete channels[channel];
      

          if (obj.has(channel, inWaitChannel)) {
              delete inWaitChannel[channel];
          }
      
          if (data && data.channel === channel) {
              data = null;
          }
          
      }
      
      /**
       * **`clear`**: Cleanup all registered channels and events.
       * 
       * This method removes all channels, listeners, and pending events from the EventEmitter. 
       * It ensures that no memory leaks occur and that the EventEmitter can be safely discarded.
       * 
       * **Example Usage**:
       * ```javascript
       * eventEmitter.clear();
       * ```
       */

      function clear() {
          checkState();
          Object.keys(channels).forEach(channel => {
              delete channels[channel];
          });
      
    
          Object.keys(inWaitChannel).forEach(channel => {
              delete inWaitChannel[channel];
          });
          
          Object.keys(EVENTS).forEach(meth => {
              EVENTS[meth] = checkState;
          });

          data = null;
          EVENTS = null;
          channels = null;
          inWaitChannel = null;
          isDestroyed = true;
          return true
      }
      
      
       /**
       * **`eventsList`**: Get a list of all registered channels.
       * 
       * This method returns an array containing the names of all currently registered channels.
       * 
       * @returns {string[]} - Array of channel names.
       * 
       * **Example Usage**:
       * ```javascript
       * console.log("Registered channels:", eventEmitter.eventsList());
       * ```
       */
      let  eventsList  = ()=> Object.keys(channels);


          /**
       * **`hasEvent`**: Check if a channel exists.
       * 
       * This method verifies whether a channel is registered in the EventEmitter.
       * 
       * @param {string} channel - The name of the channel to check.
       * @returns {boolean} - Returns `true` if the channel exists, otherwise `false`.
       * 
       * **Example Usage**:
       * ```javascript
       * if (eventEmitter.hasEvent("myChannel")) {
       *     console.log("Channel exists!");
       * }
       * ```
       */
      let  hasEvent = (channel) => obj.has(channel, channels);


      let EVENTS =  {
          invoke,
          handle,
          removeEvent: removeChannel,
          removeChannel,
          hasEvent,
          eventsList,
          clear
      };

      return EVENTS
  };

  // maths operators

  function generateId(min = 0, max = 1) {
      const sy = "dh5263ayLogl";
      const num = "0123456789";
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const lettUpc = letters.toLocaleUpperCase();
      const allItem = [sy, num, letters, lettUpc];
      let [res, i, y] = ["", 0, 0];
      const len = randint(min, max);

      while (y < len) {
          for (i = 0; i < allItem.length; i++) {
              let _c = allItem[Math.floor(Math.random() * allItem.length)];
              res += _c[Math.floor(Math.random() * _c.length)];
          }
          y++;
      }
      return res
  }

  function choice(obj) {

      if (typeof obj === "object") {
          const _bj = Object.keys(obj);
          return (obj[_bj[Math.floor(Math.random() * _bj.length)]]);
      }
      else if (
          typeof obj === "function"
          || typeof obj === "boolean"
          || typeof obj === "undefined"
          || typeof obj === "symbol"
      ) {
          throw new Error(`can not execute a ${typeof obj}`)
      }
      else if (typeof obj === "number") {
          const _n = [];
          for (let i = 0; i < obj; i++) { _n.push(i); }
          return _n[Math.floor(Math.random() * _n.length)]
      }
      else if (typeof obj === "string") {
          return obj[Math.floor(Math.random() * obj.length)]
      }
  }

  function randint(min, max) {

      if (typeof min === "number" && typeof max === "number") {
          const _p = [];
          for (let _x = min; _x < max; _x++) {
              _p.push(_x);
          }
          return choice(_p)

      }
      else {
          throw new Error(`can not execute ${typeof min !== "number" ? typeof min : typeof max}`)
      }
  }


  function inverseObject(_obj) {
      const result = {};
      loopObject(_obj, function (value, key) {
          result[value] = key;
      });
      return result
  }

  function rangeList(num, offset = 0, step = 1) {
      const result = [];
      for (let x = offset; x < num; x++) {
          if (x % step == 0) result.push(x);
      }
      return result
  }


  function isArray(obj) {
      return obj.constructor.toString().indexOf("Array") > -1
  }
  function isObject(obj) {
      return obj.constructor.toString().indexOf("Object") > -1;
  }

  function isString(obj) {
      if (typeof obj === "string") {
          return true
      }
      return obj instanceof String
  }

  function isFunction(obj) {
      return typeof obj === "function";
  }

  function isEmpty(obj) {
      return obj.length === 0 || Object.keys(obj).length === 0
  }

  function has(prop, obj) {
      return obj.indexOf ? obj.indexOf(prop) > -1 : obj.hasOwnProperty(prop)
  }
  function isTypeOf(prop, obj) {
      return prop instanceof obj
  }

  function copyObject(obj, target, overwrite = false, ...exp) {
      if (!target) { target = {}; }    if (!obj) { obj = {}; }    Object.keys(obj).forEach(item => {
          if (!(has(item, target) && !overwrite)) {
              if (!has(item, exp)) {
                  target[item] = obj[item];
                  if (isArray(target)) { target[item] = obj[item]; }
              }
          }
      });
      return target
  }

  function tryCode(callback, error) {
      try { callback(); } catch (e) { }
  }

  function after(s, func, ...args) {
      return setTimeout(func, s, args)
  }


  function loopObject(obj, callback = (value, key, index, finished) => value) {
      const result = [];
      if (obj) {
          let c = 0; let f = false;
          for (var x in obj) {
              c++;
              c === Object.keys(obj).length ? f = true :
                  f = false;
              callback(obj[x], x, c - 1, f);
              result.push(obj[x]);
          }
      }
      return result
  }

  function _EventEmitter(){
      return lsEmitter({ has, after, copyObject })
  }

  const processNotReady = "the process is not ready";
  class LeisError extends Error { }
  class LeisProcessNotReady extends Error { }
  class UniqueType extends Error { }

  const errors = {
      LeisError,
      LeisProcessNotReady,
      UniqueType
  };
  const typeError = {
      listenerError: {
          exe: (type) => `type of ${typeof type} is not a callback function`
      },
      processNotReady: {
          name: processNotReady
      },
      uniqueTypeError: {
          exe: (type) => `the ${type.split(',')[0]} must be unique, the key ${type.split(',')[1]} already exists`
      }

  };
  /**
   * 
   * @param {'LeisError'|"LeisProcessNotReady"|"UniqueType"} error 
       * @param {'listenerError'|"processNotReady"|'uniqueTypeError' } message 
   */
  function DisplayError(error, message, type) {
      throw new errors[error](typeError[message].exe(type))
  }

  /**
   * 
   * @param {HTMLElement} parent 
   * @param {BaseElement} element 
   */
  function Render(parent, element) {

      setTimeout(function () {
          parent.append(element.render());
      }, 300);

  }

  const hooks = {

      // these hooks will be executed when an instance of leistrap is created
      useInit: [],
      // these hooks  will be executed when  we pass options to the new leistrap
      // instance just created
      useOption: [],
      // hooks which will be executed before an element rending
      useRender: [],
      /**
       * call a hook
       * @param { "useInit" |"useOption"|"useRender"} name 
       */
      callHook: function (name, DisplayError, ...argv) {
          this[name].forEach(hook => {
              if (isFunction(hook)) hook(...argv);
              else { DisplayError("LeisError", "listenerError", hook); }
          });
      }
  };

  function SetOptions(element, options, getObjectByIndexName) {
      if (!options.data) options.data = {};

      // get all eventType , all properties which begin with on
      const exp = ["data", "text", "content", "parent", "id", "autoClick"];
      loopObject(copyObject(options, false, false, ...exp), function (value, key) {
          if (key.startsWith("on") && typeof value == "function") {
              // split the key for getting the eventName and options passed
              let eventType = key.slice(2, key.length).split("$");
              element.addEvent(eventType[0], value, eventType[1], eventType[2]);
          }
          else {
              // now let assign all html properties not method
              // let begin we the string type, for example id, className etc...
              if (typeof element._conf[key] != "function") {
                  element._conf[key] = value;
              }
              
              //call a native function
              else {
                  if(typeof value == "object"){
                      if(isArray(value)) element._conf[key](...value);
                  }
                  else {element._conf[key](value);}
              }
              // get all css styles definition an other html properties require object as value
              if (isObject(value)) {
                  loopObject(value, (v, k) => element._conf[key][k] = v);
              }
          }
      });
      // const copyOptions = copyObject(options, false, false, '')
      if (options.content) {
          element.content = options.content;
          options.content.forEach((item, index) => item.parent = element);
      }

      if (options.parent) {
          if (isString(options.parent)) {
              getObjectByIndexName(options.parent,
                  true, parent => parent.add(element));
          }
          else { options.parent.add(element); }
      }

      if (options.text) element.setText(options.text);

      if (options.data.id) element.data.id = options.data.id;
      if(options.autoClick) element._conf.click();

      // clear all options  and save space
      setTimeout(() => {
          loopObject(options, function (value, key, i, end) {
              try {
                  delete options[key];
              } catch (error) {
              }

          });
      }, 2000);

  }

  var leistrapCss = "\r\n\r\n:root {\r\n\r\n    --leis-baseColor: #28a745;\r\n    --leis-chat-card-bg-cl: #f4eff8;\r\n    --leis-body-cl: #f8f8f8;\r\n      \r\n    --leis-sideNav-cl: hsla(0, 0%, 100%, 0.942);\r\n    --leis-sideNav-bx-sh: 0 2px 9px rgba(0, 0, 0, .16);\r\n    \r\n    --leis-highlight-cl: var(--leis-body-cl);\r\n    \r\n    --leis-txt-cl: hsla(0, 0%, 0%, 0.962);\r\n    --leis-txt-z-size : var(--leis-font-size);\r\n\r\n    \r\n    --leis-line-separator-cl: #d4d4da;\r\n    \r\n    --leis-default-cl: #f8f7fc;\r\n    --leis-default-selector: #f6f6f6;\r\n    \r\n    --leis-img-cd-cl: #f1f1f1;\r\n    --leis-subtitle-cl: rgb(152, 150, 150);\r\n    --leis-img-outline-cl: #aeaeae;\r\n\r\n    --leis-nav-cl: #fcfbfbcf;\r\n    --leis-nav-bx-sh: rgba(0, 0, 0, .16) 0px 1px 4px;\r\n\r\n  \r\n    \r\n    \r\n    --leis-effect-img: contrast(1.5) brightness(1.02) saturate(108%);\r\n    --leis-border-width: 1.2px;\r\n    --leis-border : var(--leis-border-width) solid #ddd; \r\n    --leis-heading-color: inherit;\r\n    --leis-font-sans-serif: system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", \"Noto Sans\", \"Liberation Sans\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\r\n    --leis-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\r\n    --leis-font-size: 1rem;\r\n    --leis-resize-cl: var(--leis-primary-cl);\r\n    --leis-select-cl: #f6f3f3a3;\r\n\r\n    --leis-title-cl : var(--leis-heading-color);\r\n    --leis-title-font-family : var(--leis-font-sans-serif);\r\n}\r\n\r\n\r\n/* reset padding and marging */\r\n.leis::before,\r\n.leisie::before,\r\n.leis::after,\r\n.leisie::after,\r\n.ls::after,\r\n.ls::before,\r\n.leis,\r\n.leisie,\r\n\r\n.ls {\r\n    padding: 0;\r\n    margin: 0;\r\n    box-sizing: border-box;\r\n}\r\n\r\nbutton,\r\ninput,\r\noptgroup,\r\nselect,\r\ntextarea {\r\n    margin: 0;\r\n    font-family: inherit;\r\n    font-size: inherit;\r\n    line-height: inherit\r\n}\r\n\r\nbutton,\r\nselect {\r\n    text-transform: none\r\n}\r\n\r\nhr {\r\n    margin: 1rem 0;\r\n    color: inherit;\r\n    border: 0;\r\n    border-top: var(--leis-border-width) solid;\r\n    opacity: .25\r\n}\r\n\r\nh1,\r\nh2,\r\nh3,\r\nh4,\r\nh5,\r\nh6,\r\nth {\r\n    margin-top: 0;\r\n    margin-bottom: .5rem;\r\n    font-weight: 500;\r\n    line-height: 1.2;\r\n    font-family: var(--leis-title-font-family);\r\n    color: var(--leis-title-cl)\r\n}\r\n\r\nth {\r\n    padding: 0 10px;\r\n}\r\n\r\n*,\r\n::after,\r\n::before {\r\n    box-sizing: border-box\r\n}\r\n\r\n* {\r\n    padding: 0;\r\n    margin: 0;\r\n    box-sizing: border-box;\r\n    position: relative;\r\n}\r\n/* *::-webkit-scrollbar {\r\n    height: 4px;\r\n    width: 10px;\r\n    cursor: default !important;\r\n\r\n} */\r\n/* *::-webkit-scrollbar-button{\r\n    background-color: var(--leis-baseColor);\r\n    width: 7px;\r\n    width: 7px;\r\n} */\r\n/* *::-webkit-scrollbar-thumb {\r\n    background-color: rgba(222, 217, 217, 0.541);\r\n    background-color: var(--leis-baseColor);\r\n} */\r\n\r\n\r\n\r\nbody {\r\n    color: var(--leis-txt-cl);\r\n    background-color: var(--leis-body-cl);\r\n    font-family: var(--leis-font-sans-serif);\r\n    font-weight: 400;\r\n    line-height: 1.5;\r\n    font-size: var(--leis-font-size);\r\n    -webkit-text-size-adjust: 100%;\r\n    text-size-adjust: 100%;\r\n    -webkit-tap-highlight-color: transparent;\r\n\r\n}\r\n\r\n[type=search] {\r\n    outline-offset: -2px;\r\n    -webkit-appearance: textfield\r\n}\r\n\r\n::-webkit-search-decoration {\r\n    -webkit-appearance: none\r\n}\r\n\r\n::-webkit-color-swatch-wrapper {\r\n    padding: 0\r\n}\r\n\r\n::-webkit-file-upload-button {\r\n    font: inherit;\r\n    -webkit-appearance: button\r\n}\r\n\r\nhtml {\r\n    scroll-behavior: smooth;\r\n}\r\n\r\n/* layout*/\r\n\r\n.leis-layout {\r\n    min-width: 100%;\r\n    min-height: 100%;\r\n\r\n}\r\n\r\n\r\n.leis-hbox-item {\r\n    position: relative;\r\n    font-size: inherit;\r\n    text-align: inherit;\r\n    min-height: 100%;\r\n}\r\n\r\n.leis-vbox-item {\r\n    position: relative;\r\n    min-width: 100%;\r\n    font-size: inherit;\r\n}\r\n\r\n/* flexbox */\r\n\r\n.leis-flex {\r\n    position: relative;\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    -webkit-box-orient: vertical;\r\n    -webkit-box-direction: normal;\r\n    -ms-flex-direction: column;\r\n    flex-direction: column;\r\n    min-width: 0;\r\n    word-wrap: break-word;\r\n    background-clip: border-box;\r\n    margin-bottom: 0.5em;\r\n\r\n}\r\n\r\n.leis-flex.leis-row,\r\n.leis-row {\r\n    -webkit-box-orient: horizontal;\r\n    -ms-flex-direction: row;\r\n    flex-direction: row;\r\n}\r\n\r\n.leis-flex.leis-column,\r\n.leis-colunm {\r\n    -webkit-box-orient: vertical;\r\n    -ms-flex-direction: column;\r\n    flex-direction: column;\r\n}\r\n\r\n.l-g-s {\r\n    gap: 0.5rem;\r\n}\r\n\r\n.l-g-n {\r\n    gap: 1rem;\r\n}\r\n\r\n.l-g-n {\r\n    gap: 1.5rem;\r\n}\r\n\r\n\r\n\r\n/* lines */\r\n\r\n.leis-line-h {\r\n    height: 0.5px;\r\n    outline: none;\r\n    border: none;\r\n    background-color: var(--leis-line-separator-cl);\r\n}\r\n\r\n/* cards */\r\n\r\n.leis-card,\r\n.leis-card-sms,\r\n.leis-dropdown,\r\n.leis-dropdown-content,\r\n.leis-alert-card,\r\n.leis-slideshow-container {\r\n    position: relative;\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    -webkit-box-orient: vertical;\r\n    -webkit-box-direction: normal;\r\n    -ms-flex-direction: column;\r\n    flex-direction: column;\r\n    min-width: 0;\r\n    word-wrap: break-word;\r\n    background-clip: border-box;\r\n    border: var(--leis-card-bd);\r\n    border-radius: 6px;\r\n    -webkit-box-shadow: var(--leis-card-bx-sh);\r\n    box-shadow: var(--leis-card-bx-sh);\r\n    margin-bottom: 0.5em;\r\n}\r\n\r\n\r\n\r\n/* calendar*/\r\n.leis-calendar-container {\r\n    position: relative;\r\n    width: 350px;\r\n    min-height: 350px;\r\n\r\n    padding: 0.5rem 0.5rem;\r\n    padding-top: 1rem;\r\n    margin: 0;\r\n    outline: none;\r\n    border: 1px solid #ddd;\r\n    background-color: #fff;\r\n    border-radius: 6px;\r\n    -webkit-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);\r\n    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);\r\n}\r\n\r\n.leis-calendar {\r\n    position: relative;\r\n    left: -2px;\r\n    width: 100%;\r\n    padding: 0;\r\n\r\n}\r\n\r\n.leis-date {\r\n    text-align: center;\r\n    font-size: inherit;\r\n\r\n}\r\n\r\n.leis-date p {\r\n    width: 40px;\r\n    padding: 0.5rem 0;\r\n    border-radius: 5px;\r\n    font-weight: 500;\r\n    cursor: pointer;\r\n}\r\n\r\n.leis-date p.active {\r\n    background-color: #b9d6fcb2;\r\n}\r\n\r\n.leis-date p:hover {\r\n    background-color: #7f8d9e4d\r\n}\r\n\r\n.leis-date.active {\r\n    background-color: transparent;\r\n    color: inherit;\r\n}\r\n\r\n.leis-date.active.today p {\r\n    background-color: transparent;\r\n    color: inherit;\r\n    border: 2px solid rgba(255, 46, 46, 0.743);\r\n}\r\n\r\n.leis-calendar-day {\r\n    font-weight: 400;\r\n    text-align: left;\r\n}\r\n\r\n.leis-year-info {\r\n    position: relative;\r\n    margin-bottom: 1.5rem;\r\n    width: 100%;\r\n    display: flex;\r\n    justify-content: center;\r\n    align-content: flex-start;\r\n    gap: 0.5rem;\r\n    font-weight: 500;\r\n}\r\n\r\n.leis-date.today p {\r\n    background-color: rgba(255, 46, 46, 0.743);\r\n    color: #fff;\r\n    border-radius: 6px;\r\n}\r\n\r\n.calendar-next,\r\n.calendar-prev {\r\n    position: absolute;\r\n    top: 5px;\r\n    z-index: 1;\r\n    font-weight: 500;\r\n    outline: none;\r\n    border: none;\r\n    background-color: inherit;\r\n    color: inherit;\r\n    padding: 0.2rem 0.5rem;\r\n    cursor: pointer;\r\n}\r\n\r\n.calendar-next:hover,\r\n.calendar-prev:hover {\r\n    color: #0062cc;\r\n}\r\n\r\n.calendar-next {\r\n    right: 6px;\r\n}\r\n\r\n.calendar-prev {\r\n    left: 6px;\r\n}\r\n\r\n.leis-calendar-cover {\r\n    position: relative;\r\n    width: -moz-fit-content;\r\n    width: fit-content;\r\n    overflow: hidden;\r\n\r\n}\r\n\r\n/*\r\ncustom calendar\r\n*/\r\n\r\n.custom-calendar-container {\r\n    position: relative;\r\n    width: 320px;\r\n    height: auto;\r\n    overflow: hidden;\r\n    border: none;\r\n    outline: none;\r\n    padding: 0;\r\n    margin: 0;\r\n    -webkit-user-select: none;\r\n    user-select: none;\r\n\r\n    background-color: inherit;\r\n\r\n}\r\n\r\n.custom-calendar-card {\r\n    position: relative;\r\n    width: 100%;\r\n    overflow: hidden;\r\n    border: 1px solid #ccc;\r\n    border-radius: 6px;\r\n    background-color: #fff;\r\n    padding: 1rem 0.5rem;\r\n}\r\n\r\n\r\n\r\n.custom-Date,\r\n.daysOff,\r\n.custom-header Div {\r\n    border: none;\r\n    outline: none;\r\n    width: 50px;\r\n    padding: 8px 5px;\r\n    border-radius: 5px;\r\n    font-weight: 500;\r\n    color: inherit;\r\n}\r\n\r\n.custom-Date {\r\n    cursor: pointer;\r\n}\r\n\r\n.custom-Date.active-date {\r\n    background-color: #287be9;\r\n    color: #fff;\r\n}\r\n\r\n.custom-Date:hover {\r\n    background-color: #abc9f0a4;\r\n}\r\n\r\n.custom-Date,\r\n.daysOff {\r\n    background-color: #ffffffa8;\r\n}\r\n\r\n.daysOff {\r\n    pointer-events: none;\r\n    color: #a39999;\r\n    opacity: 0.5;\r\n}\r\n\r\n.custom-body {\r\n    padding: 0;\r\n    width: 100%;\r\n    gap: 3px;\r\n    overflow: hidden;\r\n}\r\n\r\n.custom-row,\r\n.custom-header {\r\n    padding: 0;\r\n    margin: 0;\r\n    gap: 3px;\r\n\r\n}\r\n\r\n.custom-header Div {\r\n    font-weight: 400;\r\n}\r\n\r\n.custom-yearinfo {\r\n    width: 100%;\r\n    gap: 0.5rem;\r\n    justify-content: center;\r\n    font-weight: 500;\r\n}\r\n\r\n\r\n/* inputs*/\r\n\r\n\r\n\r\n/* leis group button*/\r\n\r\n.leis-groupBtn-container {\r\n    width: -moz-fit-content;\r\n    width: fit-content;\r\n    position: relative;\r\n}\r\n\r\n.leis-groupBtn-card,\r\n.leis-groupBtn-card.dark-group {\r\n    width: 100%;\r\n    padding: 5px 5px;\r\n    background-color: #2b3a49dc;\r\n    display: flex;\r\n    flex-direction: row;\r\n    flex-wrap: wrap;\r\n    gap: 0.255rem;\r\n    color: rgb(235, 225, 225);\r\n    border-radius: 6px;\r\n}\r\n\r\n.leis-groupBtn-item {\r\n    border-radius: none;\r\n    padding: 0 8px;\r\n    background-color: inherit;\r\n    font-size: inherit;\r\n    color: inherit;\r\n    outline: none;\r\n    border: none;\r\n    cursor: pointer;\r\n    border-radius: 4px;\r\n    white-space: nowrap;\r\n    -webkit-user-select: none;\r\n    user-select: none;\r\n    transition: .3s ease;\r\n}\r\n\r\n.leis-groupBtn-item:hover,\r\n.leis-groupBtn-item.dark-group .leis-groupBtn-item:hover {\r\n    background-color: #6e6d6d;\r\n}\r\n\r\n.leis-groupBtn-item:focus,\r\n.leis-groupBtn-item.dark-group .leis-groupBtn-item:focus {\r\n    background-color: #fff;\r\n    background-color: #969292;\r\n    box-shadow: 0 0px 0px 2px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n.leis-groupBtn-card.light-group {\r\n    background-color: var(--leis-light-cl);\r\n    color: #000;\r\n    border: 1px solid #ddddddb5;\r\n}\r\n\r\n.leis-groupBtn-card.light-group .leis-groupBtn-item:not(:last-child) {\r\n    border-right: 1px solid #ddddddad;\r\n}\r\n\r\n.leis-groupBtn-card.light-group .leis-groupBtn-item:hover {\r\n    background-color: #e1dadaca;\r\n}\r\n\r\n.leis-groupBtn-card.light-group .leis-groupBtn-item:focus {\r\n    background-color: #e1dadab9;\r\n    box-shadow: 0 0px 0px 2px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n\r\n\r\n.leis-groupBtn-card.secondary-group {\r\n    background-color: var(--leis-secondary-hover-cl);\r\n    color: rgb(235, 225, 225);\r\n    border: 1px solid #ddddddb5;\r\n}\r\n\r\n.leis-groupBtn-card.secondary-group .leis-groupBtn-item:not(:last-child) {\r\n    border-right: 1px solid #bebcbcdf;\r\n}\r\n\r\n.leis-groupBtn-card.secondary-group .leis-groupBtn-item:hover {\r\n    background-color: rgb(183, 179, 179);\r\n    color: #fff;\r\n}\r\n\r\n.leis-groupBtn-card.secondary-group .leis-groupBtn-item:focus {\r\n    background-color: rgb(183, 179, 179);\r\n    color: #fff;\r\n    box-shadow: 0 0px 0px 2px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n\r\n\r\n.leis-groupBtn-card.primary-group {\r\n    background-color: var(--leis-primary-hover-cl);\r\n    color: rgb(235, 225, 225);\r\n    border: 1px solid #ddddddb5;\r\n}\r\n\r\n.leis-groupBtn-card.primary-group .leis-groupBtn-item:not(:last-child) {\r\n    border-right: 1px solid #bebcbcdf;\r\n}\r\n\r\n.leis-groupBtn-card.primary-group .leis-groupBtn-item:hover {\r\n    background-color: #4f8dd0;\r\n    color: #fff;\r\n}\r\n\r\n.leis-groupBtn-card.primary-group .leis-groupBtn-item:focus {\r\n    background-color: #4f8dd0;\r\n    color: #fff;\r\n    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n.leis-groupBtn-card.success-group {\r\n    background-color: var(--leis-success-hover-cl);\r\n    color: #fff;\r\n    border: 1px solid #70d988;\r\n}\r\n\r\n.leis-groupBtn-card.success-group .leis-groupBtn-item:not(:last-child) {\r\n    border-right: 1px solid #70d988;\r\n}\r\n\r\n.leis-groupBtn-card.success-group .leis-groupBtn-item:hover {\r\n    background-color: #8deba2c4;\r\n    color: #000;\r\n}\r\n\r\n.leis-groupBtn-card.success-group .leis-groupBtn-item:focus {\r\n    background-color: #8deba2c4;\r\n    color: #000;\r\n    box-shadow: 0 0px 0px 2px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n\r\n.leis-groupBtn-card.warning-group {\r\n    background-color: hsla(45, 95%, 66%, 0.939);\r\n    color: #000;\r\n    border: 1px solid hsla(45, 95%, 66%, 0.939);\r\n}\r\n\r\n.leis-groupBtn-card.warning-group .leis-groupBtn-item:not(:last-child) {\r\n    border-right: 1px solid hsl(45, 64%, 82%);\r\n}\r\n\r\n.leis-groupBtn-card.warning-group .leis-groupBtn-item:hover {\r\n    background-color: hsla(45, 84%, 42%, 0.939);\r\n    color: #fff;\r\n}\r\n\r\n.leis-groupBtn-card.warning-group .leis-groupBtn-item:focus {\r\n    background-color: hsla(45, 84%, 42%, 0.939);\r\n    color: #fff;\r\n    box-shadow: 0 0px 0px 2px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n.leis-groupBtn-card.info-group {\r\n    background-color: #a6eaf5e9;\r\n    color: #000;\r\n    border: 1px solid #a6eaf5e9;\r\n}\r\n\r\n.leis-groupBtn-card.info-group .leis-groupBtn-item:not(:last-child) {\r\n    border-right: 1px solid #a6eaf5e9;\r\n}\r\n\r\n.leis-groupBtn-card.info-group .leis-groupBtn-item:hover {\r\n    background-color: #589faad1;\r\n    color: #fff;\r\n}\r\n\r\n.leis-groupBtn-card.info-group .leis-groupBtn-item:focus {\r\n    background-color: #589faad1;\r\n    color: #fff;\r\n    box-shadow: 0 0px 0px 2px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n\r\n.leis-groupBtn-card.danger-group {\r\n    background-color: #cf5662db;\r\n    color: #fff;\r\n    border: 1px solid #cf5662db;\r\n}\r\n\r\n.leis-groupBtn-card.danger-group .leis-groupBtn-item:not(:last-child) {\r\n    border-right: 1px solid #ddb2b6;\r\n}\r\n\r\n.leis-groupBtn-card.danger-group .leis-groupBtn-item:hover {\r\n    background-color: #a6464edb;\r\n    color: #fff;\r\n}\r\n\r\n.leis-groupBtn-card.danger-group .leis-groupBtn-item:focus {\r\n    background-color: #a6464edb;\r\n    color: #fff;\r\n    box-shadow: 0 0px 0px 2px rgba(0, 0, 0, 0.136);\r\n}\r\n\r\n/* Modal */\r\n\r\n.leis-modal-container {\r\n    display: none;\r\n    position: fixed;\r\n    top: 0;\r\n    left: 0;\r\n    width: 100%;\r\n    height: 100%;\r\n    background-color: hsla(0, 2%, 8%, 0.372);\r\n    overflow-x: hidden;\r\n    outline: 0;\r\n    z-index: 1000;\r\n}\r\n\r\n.leis-modal-dialog {\r\n    position: absolute;\r\n    top: 25%;\r\n    left: 50%;\r\n    padding: 0.5rem;\r\n    background-clip: padding-box;\r\n    background-color: #fff;\r\n    /* background-color: var(--leis-card-cl); */\r\n    border: 1px solid rgba(255, 255, 255, 0.15);\r\n    border-radius: 0.5rem;\r\n    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);\r\n    outline: none;\r\n    animation: modal .3s ease;\r\n    width: 500px;\r\n    min-height: 250px;\r\n    height: 250px;\r\n\r\n\r\n}\r\n\r\n.modal-transform {\r\n    transform: translate(-50%, -25%);\r\n}\r\n\r\n.leis-modal-content {\r\n    width: 100%;\r\n    height: 100%;\r\n    padding: 10px 0;\r\n    position: relative;\r\n    background-color: inherit;\r\n\r\n}\r\n\r\n.leis-modal-container.show .leis-modal-dialog {\r\n    top: 25%;\r\n    transition: 1s ease;\r\n}\r\n\r\n.leis-modal-header {\r\n    display: flex;\r\n    flex-shrink: 0;\r\n    align-items: center;\r\n    justify-content: space-between;\r\n    border-bottom: 1px solid var(--leis-line-separator-cl);\r\n}\r\n\r\n.leis-modal-header .leis-modal-title {\r\n    padding: 5px 10px;\r\n}\r\n\r\n.leis-modal-header .leis-btn-close {\r\n    border: none;\r\n    font-size: 2rem;\r\n    top: -0.5rem;\r\n    left: -5px;\r\n    color: #999;\r\n    cursor: pointer;\r\n}\r\n\r\n.leis-modal-header .leis-btn-close:hover {\r\n    color: #000;\r\n}\r\n\r\n.leis-modal-body {\r\n    position: relative;\r\n    margin-left: 7px;\r\n    width: 100%;\r\n    height: calc(100% - 6rem - 4px);\r\n    position: relative;\r\n    overflow: hidden;\r\n    overflow-x: hidden;\r\n    overflow-y: auto;\r\n}\r\n\r\n.leis-modal-footer {\r\n    padding: 10px;\r\n    width: 100%;\r\n    position: absolute;\r\n    bottom: 0;\r\n    left: 0;\r\n    padding: 0;\r\n}\r\n\r\n.leis-modal-footer-card {\r\n    position: relative;\r\n\r\n    display: flex;\r\n    flex-shrink: 0;\r\n    flex-wrap: wrap;\r\n    align-items: center;\r\n    justify-content: flex-end;\r\n    padding: 0.6rem 1rem;\r\n    border-top: 1px solid var(--leis-line-separator-cl);\r\n    gap: 0.5rem;\r\n\r\n\r\n}\r\n\r\n.leis-modal-dafault {\r\n    padding: 3% 8%;\r\n}\r\n\r\n.leis-modal-dafault .leis-tooltip.bottom {\r\n    top: 80%;\r\n    left: 10%;\r\n}\r\n\r\n@keyframes modal {\r\n    from {\r\n        opacity: 0.1;\r\n        top: -320px;\r\n\r\n\r\n    }\r\n\r\n    top {\r\n        opacity: 1;\r\n        top: 25%;\r\n    }\r\n}\r\n\r\n@keyframes modal-zoom-in {\r\n    from {\r\n        opacity: 0.1;\r\n        transform: scale(2.5);\r\n    }\r\n\r\n    top {\r\n        opacity: 1;\r\n        transform: scale(1);\r\n    }\r\n}\r\n\r\n@keyframes modal-zoom-out {\r\n    from {\r\n        opacity: 0.1;\r\n        transform: scale(0.2);\r\n\r\n    }\r\n\r\n    top {\r\n        opacity: 1;\r\n        transform: scale(1);\r\n    }\r\n}\r\n\r\n/* slider*/\r\n\r\n.leis-slider-container {\r\n    position: relative;\r\n    background-color: var(--leis-dark-cl);\r\n    color: #fff;\r\n    height: 100vh;\r\n    width: 200px;\r\n}\r\n\r\n.leis-slider-content {\r\n    width: 100%;\r\n}\r\n\r\n.leis-slider-slider {\r\n    position: absolute;\r\n    top: 0;\r\n    right: 0;\r\n    background-color: inherit;\r\n    height: inherit;\r\n    width: 8px;\r\n    cursor: w-resize;\r\n    transition: background-color 1s ease;\r\n}\r\n\r\n.leis-slider-slider:hover {\r\n    background-color: #0069d9;\r\n\r\n}\r\n\r\n/* alerts*/\r\n\r\n.leis-alert-card {\r\n    position: relative;\r\n    box-shadow: none;\r\n    padding-right: 25px;\r\n}\r\n\r\n.leis-alert-card a {\r\n    white-space: nowrap;\r\n}\r\n\r\n.leis-alert-card .leis-btn-close {\r\n    position: absolute;\r\n    right: 10px;\r\n    top: 0px;\r\n    font-size: 2.5rem;\r\n    background-color: transparent;\r\n    border: none !important;\r\n}\r\n\r\n.leis-alert-card.leis-alert-primary {\r\n    background-color: #9ec8ff64;\r\n    border: 1.5px solid #74b0ff;\r\n\r\n\r\n}\r\n\r\n.leis-alert-card.leis-alert-success {\r\n    background-color: #96fbae6a;\r\n    border: 1.5px solid #51ff7abf;\r\n}\r\n\r\n.leis-alert-card.leis-alert-danger {\r\n    background-color: #fa919b77;\r\n    border: 1.5px solid #ff485ab2;\r\n}\r\n\r\n.leis-alert-card.leis-alert-info {\r\n    background-color: #a6f1fcae;\r\n    border: 1.5px solid #51a6b3a7;\r\n}\r\n\r\n.leis-alert-card.leis-alert-warning {\r\n    background-color: #ffdd7781;\r\n    border: 1.5px solid #ffce3ad5;\r\n}\r\n\r\n.leis-alert-card.leis-alert-dark {\r\n    background-color: #3f41437e;\r\n    color: rgb(250, 245, 245);\r\n}\r\n\r\n.leis-alert-card.leis-alert-light {\r\n    background-color: #fefeffb1;\r\n}\r\n\r\n.leis-alert-card.leis-alert-secondary {\r\n    background-color: #a0a1a25c;\r\n}\r\n\r\n.leis-alert-card .leis-alert-text {\r\n    padding: 16px;\r\n\r\n}\r\n\r\n/* groups */\r\n\r\n.leis-list-group,\r\n.leis-group,\r\n.leis-accordion-card {\r\n    display: -webkit-box;\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    -webkit-box-orient: vertical;\r\n    -webkit-box-direction: normal;\r\n    -ms-flex-direction: column;\r\n    flex-direction: column;\r\n    padding-left: 0;\r\n    margin-bottom: 0;\r\n}\r\n\r\n.leis-list-group {\r\n    list-style: none;\r\n}\r\n\r\n.leis-child-group {\r\n    padding: 2.5px 5px;\r\n    position: relative;\r\n\r\n}\r\n\r\n.leis-child-group:not(:last-child) {\r\n    border-bottom: 0.5px solid rgb(216, 212, 212);\r\n}\r\n\r\n.leis-group-head {\r\n    background-color: rgba(230, 227, 227, 0.744);\r\n    border-top-left-radius: 2px;\r\n    border-top-right-radius: 2px;\r\n}\r\n\r\n.leis-img-group-left {\r\n    display: block;\r\n    float: left;\r\n    width: 40px;\r\n    height: 40px;\r\n    border: none;\r\n    outline: none;\r\n    border-radius: 50%;\r\n    overflow: hidden;\r\n}\r\n\r\n.leis-img-group-left>.leis-img {\r\n    display: block;\r\n    width: 100%;\r\n    height: auto;\r\n    min-height: 40px !important;\r\n    border: none;\r\n    outline: none;\r\n    filter: var(--leis-effect-img);\r\n}\r\n\r\n.leis-img-group-left~.leis-group-txt {\r\n    padding: 12px 14px;\r\n    margin-left: 2.5rem;\r\n}\r\n\r\n/* -------------------------- badge---------------------------- */\r\n.leis-bg-primary {\r\n    background-color: var(--leis-primary-cl);\r\n}\r\n\r\n.leis-bg-secondary {\r\n    background-color: var(--leis-secondary-cl);\r\n}\r\n\r\n.leis-bg-succes {\r\n    background-color: var(--leis-success-cl);\r\n}\r\n\r\n.leis-bg-danger {\r\n    background-color: var(--leis-danger-cl);\r\n}\r\n\r\n.leis-bg-warning {\r\n    background-color: var(--leis-warning-cl);\r\n}\r\n\r\n.leis-bg-info {\r\n    background-color: var(--leis-info-cl);\r\n}\r\n\r\n.leis-bg-light {\r\n    background-color: var(--leis-light-cl);\r\n}\r\n\r\n.leis-bg-dark {\r\n    background-color: var(--leis-dark-cl);\r\n}\r\n\r\n\r\n/* web elements */\r\n\r\n\r\n\r\n\r\n.leis-accordion-btn::after,\r\n.leis-btn-controler::before,\r\n.leis-arrow-down::after {\r\n    position: relative;\r\n    content: \"\";\r\n    width: 10px;\r\n    height: 10px;\r\n    float: right;\r\n    top: 5px;\r\n    font-weight: 500;\r\n    font-size: 16px;\r\n    border-bottom: 1.8px solid;\r\n    border-left: 1.8px solid;\r\n    transform: rotateY(180deg) rotateZ(-40deg);\r\n    transition: .16s;\r\n}\r\n\r\n.leis-btn-controler {\r\n    color: #0069d9 !important;\r\n    position: absolute;\r\n    top: 8px;\r\n    left: 8px;\r\n    border: none;\r\n    z-index: 1;\r\n    background-color: inherit;\r\n}\r\n\r\n.leis-btn-controler.hide {\r\n    display: none;\r\n}\r\n\r\n.DA-close-modal {\r\n    position: absolute;\r\n    top: 15px;\r\n    left: 15px;\r\n    font-size: 1.5rem;\r\n    border-radius: 50%;\r\n}\r\n\r\n.DA-close-modal:hover {\r\n    background-color: #d31b2d;\r\n}\r\n\r\n.leis-btn-controler::before {\r\n    position: relative;\r\n    top: -1px;\r\n    border-bottom: 2.8px solid;\r\n    border-left: 2.8px solid;\r\n    transform: rotateY(180deg) rotateZ(-140deg);\r\n}\r\n\r\n.leis-accordion-btn.active::after,\r\n.leis-dropBtn.activeD .leis-arrow-down::after {\r\n    transform: rotateY(180deg) rotateZ(138deg);\r\n}\r\n\r\n.leis-accordion-btn:hover,\r\n.leis-accordion-btn.active {\r\n    background-color: var(--leis-light-hover-cl);\r\n}\r\n\r\n.leis-accordion-btn.active {\r\n    font-size: 18px;\r\n}\r\n\r\n\r\n.leis-accordion-btn:not(:last-child) {\r\n    border-bottom: 1.2px solid var(--leis-line-separator-cl);\r\n}\r\n\r\n\r\n.leis-accordion-panel {\r\n    position: relative;\r\n    background-color: inherit;\r\n    max-height: 0;\r\n    overflow: hidden;\r\n    transition: max-height 1s ease-in-out;\r\n}\r\n\r\n.leis-accordion-txt {\r\n    padding: 5px 14px;\r\n}\r\n\r\n.leis-accordion-panel.active {\r\n    max-height: 200vh;\r\n    overflow: visible;\r\n    background-color: #fff;\r\n}\r\n\r\n.leis-accordion-head {\r\n    width: 100%;\r\n    display: -webkit-box;\r\n    display: -moz-box;\r\n    display: block;\r\n    font-weight: 500;\r\n    background-color: var(--leis-accordion-head-cl);\r\n    padding: 12px 14px;\r\n    border-bottom: 1.5px solid var(--leis-line-separator-cl);\r\n    border-radius: 5px 5px 0px 0px;\r\n    color: var(--leis-accordion-head-txt-cl);\r\n}\r\n\r\n.leis-accordion-footer {\r\n    width: 100%;\r\n    display: -webkit-box;\r\n    display: -moz-box;\r\n    display: block;\r\n    padding: 5px 6px;\r\n    font-weight: 500;\r\n    border-radius: 0px 0px 5px 5px;\r\n    color: #000;\r\n    text-align: center;\r\n    -webkit-box-shadow: var(--leis-accordion-footer-bx-sh);\r\n    box-shadow: var(--leis-accordion-footer-bx-sh);\r\n    background-color: var(--leis-accordion-footer-cl);\r\n}\r\n\r\n/* collapsible*/\r\n\r\n.leis-collapsing-container {\r\n    position: relative;\r\n    border: none;\r\n    margin: 0;\r\n\r\n}\r\n\r\n.leis-collapse-btn {\r\n    border: none;\r\n    font-weight: 500;\r\n    text-align: left;\r\n    padding: 0;\r\n}\r\n\r\n.leis-collapse-btn::before {\r\n    position: absolute;\r\n    left: -15px;\r\n    top: 8px;\r\n    content: \"\";\r\n    width: 10px;\r\n    height: 10px;\r\n    border-bottom: 2px solid;\r\n    border-left: 2px solid;\r\n    transform: rotateY(-180deg) rotateZ(40deg);\r\n    transition: .16s;\r\n}\r\n\r\n.leis-collapsing {\r\n    max-height: 0;\r\n    overflow: hidden;\r\n    transition: max-height .45s ease\r\n}\r\n\r\n.leis-collapsing.callo-show {\r\n    max-height: 100%;\r\n\r\n}\r\n\r\n.leis-collapse-btn.colla-btn-show::before {\r\n    transform: rotateY(-180deg) rotateZ(-40deg);\r\n}\r\n\r\n\r\n\r\n\r\n\r\n/*ToolTip*/\r\n.leis-tooltip {\r\n    visibility: hidden;\r\n    position: absolute;\r\n    border-radius: 8px;\r\n    opacity: 0;\r\n    padding: 10px;\r\n    border: 1px solid #ddd;\r\n    background-color: var(--leis-body-cl);\r\n    width: -moz-fit-content;\r\n    width: fit-content;\r\n    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);\r\n    transition: opacity .3s ease;\r\n    -webkit-user-select: none;\r\n    user-select: none;\r\n}\r\n\r\n.leis-tooltip::after {\r\n    content: \"\";\r\n    position: absolute;\r\n    width: 12px;\r\n    height: 12px;\r\n    background-color: inherit;\r\n    top: 100%;\r\n    left: 50%;\r\n    margin-top: -5px;\r\n    border-left: inherit;\r\n    border-top: inherit;\r\n    transform: rotateY(180deg) rotateZ(-140deg);\r\n}\r\n\r\n.leis-tooltip.top {\r\n    bottom: calc(100% + 10px);\r\n    left: 50%;\r\n}\r\n\r\n.leis-tooltip.bottom {\r\n    top: calc(100% + 10px);\r\n    left: calc(100% - 60%);\r\n}\r\n\r\n.leis-tooltip.bottom::after {\r\n    top: -3px;\r\n    left: calc(100% - 60%);\r\n    width: 15px;\r\n    height: 15px;\r\n    transform: rotateY(180deg) rotateZ(40deg);\r\n}\r\n\r\n.leis-tooltip.right {\r\n    bottom: calc(50% - 10px);\r\n    left: calc(100% + 10px);\r\n    min-width: 140px;\r\n}\r\n\r\n.leis-tooltip.right::after {\r\n    top: 50%;\r\n    left: -8px;\r\n    width: 14px;\r\n    transform: rotateY(180deg) rotateZ(130deg);\r\n}\r\n\r\n.leis-tooltip.left {\r\n    bottom: calc(50% - 10px);\r\n    right: calc(100% + 10px);\r\n    min-width: 140px;\r\n}\r\n\r\n.leis-tooltip.left::after {\r\n    top: 50%;\r\n    left: 100%;\r\n    margin-left: -5px;\r\n    transform: rotateY(180deg) rotateZ(-50deg);\r\n}\r\n\r\n.leis-tooltip .leis-tooltip-content {\r\n    max-width: 350px;\r\n    max-height: 50vh;\r\n    overflow: hidden;\r\n    overflow-x: hidden;\r\n    overflow-y: auto;\r\n}\r\n\r\n.leis-tooltip * {\r\n    padding: 0;\r\n    margin: 0;\r\n}\r\n\r\n\r\n/*search Bar*/\r\n\r\n.leis-searchBar,\r\n.leis-textinput {\r\n    width: 100%;\r\n    outline: none;\r\n    border: 1px solid #ddd;\r\n    padding: 3px 12px;\r\n    border-radius: 6px;\r\n\r\n}\r\n\r\n.leis-searchBar:focus,\r\n.leis-textinput:focus {\r\n    -webkit-box-shadow: 0 0 0 .25rem rgba(13, 110, 253, .25);\r\n    box-shadow: 0 0 0 .25rem rgba(13, 110, 253, .25);\r\n    filter: brightness(100%);\r\n}\r\n\r\n\r\n/*autocomplate*/\r\n\r\n.leis-autoComplate,\r\n.leis-textbox-container {\r\n    width: -moz-fit-content;            \r\n    width: fit-content;\r\n    padding: none;\r\n    margin: 0;\r\n}\r\n\r\n.leis-autoComplate .leis-group * {\r\n    border: none;\r\n    padding: 0;\r\n}\r\n\r\n.leis-autoComplate .leis-group .leis-child-group {\r\n    padding: 6px 10px;\r\n    cursor: pointer;\r\n    border: 1px solid #f6f3f3a3;\r\n    display: flex;\r\n    gap: 10px;\r\n}\r\n\r\n.aut-item-subTitle {\r\n    color: var(--leis-subtitle-cl);\r\n    font-size: calc(var(--leis-font-size) - 1px);\r\n}\r\n\r\n.leis-autoComplate .leis-group .leis-child-group:hover {\r\n    background-color: var(--leis-select-cl)\r\n}\r\n\r\n.leis-autoComplateCard {\r\n    visibility: hidden;\r\n}\r\n\r\n\r\n.leis-autoComplateCard.clicked:hover {\r\n    visibility: visible;\r\n}\r\n\r\n.leis-autoComplateCard.empty {\r\n    padding: 0;\r\n    border: 0;\r\n    margin: 0;\r\n}\r\n\r\n.leis-searchBar:focus+.leis-autoComplateCard,\r\n.leis-autoInput:focus+.leis-autoComplateCard {\r\n    visibility: visible;\r\n}\r\n\r\n.leis-autComplate-container {\r\n    width: 100%;\r\n    position: absolute;\r\n    border: 1px solid #ddd;\r\n    background-color: #fff;\r\n    border-radius: 6px;\r\n    z-index: 1000;\r\n    -webkit-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);\r\n    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15)\r\n}\r\n\r\n/* TopNav */\r\n.leis-icon-menu {\r\n    position: relative;\r\n    display: inline-block;\r\n    width: 20px;\r\n    height: 2.5px;\r\n    left: -0.5px;\r\n    padding: 0;\r\n    margin: 0;\r\n    background-color: var(--leis-txt-cl);\r\n    transition: .5s ease-in;\r\n}\r\n\r\n.leis-icon-menu::after {\r\n    position: absolute;\r\n    top: -4px;\r\n    left: -0px;\r\n    margin-left: -0.5px;\r\n    display: inline-block;\r\n    content: \"\";\r\n    width: inherit;\r\n    height: inherit;\r\n    margin-bottom: 0.5px;\r\n    background-color: inherit;\r\n}\r\n\r\n.leis-icon-menu::before {\r\n    position: absolute;\r\n    display: inline-block;\r\n    top: -8px;\r\n    left: -0.5px;\r\n    content: \"\";\r\n    width: inherit;\r\n    height: inherit;\r\n    margin-bottom: 0.5px;\r\n    background-color: inherit;\r\n}\r\n\r\n.leis-icon-menu.clicked {\r\n    transform: rotateZ(-150deg);\r\n}\r\n\r\n.leis-icon-menu.clicked::after {\r\n    transform: rotateZ(90deg);\r\n    top: 0px;\r\n    left: 0.5px;\r\n}\r\n\r\n.leis-icon-menu.clicked::before {\r\n    transform: rotateZ(40deg);\r\n    background-color: transparent;\r\n}\r\n\r\n.leis-topnav {\r\n    position: relative;\r\n    font-size: 18px;\r\n    width: 100%;\r\n    height: 50px;\r\n    border-bottom: 1px solid #eee;\r\n    -webkit-box-shadow: var(--leis-nav-bx-sh);\r\n    box-shadow: var(--leis-nav-bx-sh);\r\n    margin: 0;\r\n}\r\n\r\n\r\n.leis-topnav.primary,\r\n.leis-topnav.primary .leis-dropBtn {\r\n    background-color: var(--leis-primary-hover-cl);\r\n    color: rgba(230, 227, 227, 0.991) !important;\r\n}\r\n\r\n\r\n\r\n.leis-topnav .leis-dropBtn,\r\n.leis-topnav .leis-dropBtn.activeD {\r\n    width: auto;\r\n    border: none;\r\n    outline: none;\r\n    box-shadow: none;\r\n    font-size: 18px;\r\n    text-align: left;\r\n    padding: 0;\r\n    margin: 0;\r\n    display: inline-block;\r\n    padding-top: 4px;\r\n    font-weight: 300;\r\n}\r\n\r\n.leis-topnav .leis-dropdown-content.show {\r\n    z-index: 1000;\r\n    min-width: 200px;\r\n    color: #000 !important;\r\n}\r\n\r\n.leis-topnav .leis-dropBtn {\r\n    display: flex;\r\n    gap: 10px;\r\n}\r\n\r\n.leis-topnav .leis-dropBtn.activeD .leis-arrow-down::after {\r\n    left: 10px;\r\n}\r\n\r\n.leis-topnav .leis-dropBtn .leis-arrow-down::after {\r\n    height: 6px;\r\n    width: 6px;\r\n\r\n}\r\n\r\n.leis-topnav.primary .leis-child-group:hover,\r\n.leis-topnav.primary .leis-dropBtn:hover {\r\n    color: #fff !important\r\n}\r\n\r\n.leis-topnav.secondary,\r\n.leis-topnav.secondary .leis-dropBtn {\r\n    background-color: var(--leis-secondary-cl);\r\n    color: rgba(230, 227, 227, 0.991) !important;\r\n}\r\n\r\n.leis-topnav.secondary .leis-child-group:hover,\r\n.leis-topnav.secondary .leis-dropBtn {\r\n    color: #fff !important\r\n}\r\n\r\n.leis-topnav.warning,\r\n.leis-topnav.warning .leis-dropBtn {\r\n    background-color: var(--leis-warning-cl);\r\n    color: #221e1e !important\r\n}\r\n\r\n.leis-topnav.warning .leis-child-group:hover,\r\n.leis-topnav.warning .leis-dropBtn:hover {\r\n    color: #000 !important\r\n}\r\n\r\n.leis-topnav.dark,\r\n.leis-topnav.dark .leis-dropBtn {\r\n    background-color: var(--leis-dark-cl);\r\n    color: rgb(216, 212, 212) !important\r\n}\r\n\r\n.leis-topnav.dark .leis-child-group:hover,\r\n.leis-topnav.dark .leis-dropBtn:hover {\r\n    color: #fff !important\r\n}\r\n\r\n\r\n.leis-topnav.light,\r\n.leis-topnav.light .leis-dropBtn {\r\n    background-color: var(--leis-light-cl);\r\n    color: #3c3939 !important\r\n}\r\n\r\n.leis-topnav.light .leis-child-group:hover,\r\n.leis-topnav.light .leis-dropBtn:hover {\r\n    color: var(--leis-primary-cl) !important\r\n}\r\n\r\n\r\n.leis-topnav.success,\r\n.leis-topnav.success .leis-dropBtn {\r\n    background-color: var(--leis-success-cl);\r\n    color: rgb(216, 212, 212) !important\r\n}\r\n\r\n.leis-topnav.success .leis-child-group:hover,\r\n.leis-topnav.success .leis-dropBtn:hover {\r\n    color: #fff\r\n}\r\n\r\n.leis-topnav.danger,\r\n.leis-topnav.danger .leis-dropBtn {\r\n    background-color: var(--leis-danger-cl);\r\n    color: rgb(216, 212, 212) !important\r\n}\r\n\r\n.leis-topnav.danger .leis-child-group:hover,\r\n.leis-topnav.danger .leis-dropBtn:hover {\r\n    color: #fff\r\n}\r\n\r\n.leis-topnav.info,\r\n.leis-topnav.info .leis-dropBtn {\r\n    background-color: var(--leis-info-cl);\r\n    color: #333 !important\r\n}\r\n\r\n.leis-topnav.info .leis-child-group:hover,\r\n.leis-topnav.info .leis-dropBtn:hover {\r\n    color: #000 !important\r\n}\r\n\r\n.leis-topnav-cd-profil-right {\r\n    display: block;\r\n    float: right;\r\n}\r\n\r\n.leis-topnav .leis-list-group {\r\n    display: inline-block;\r\n    padding: 10px 16px;\r\n    margin: 0;\r\n    display: flex;\r\n    flex-direction: row;\r\n    gap: 0.8rem;\r\n}\r\n\r\n.leis-topnav .leis-list-group .leis-img-group-left {\r\n    display: inline-block;\r\n    width: 30px;\r\n    height: 30px;\r\n    margin: 5 auto;\r\n}\r\n\r\n.leis-topnav .leis-group .leis-dropdown {\r\n    background-color: red;\r\n}\r\n\r\n\r\n\r\n.profil {\r\n    padding: 0 !important;\r\n    margin: 0 !important;\r\n}\r\n\r\n.leis-topnav .leis-list-group .leis-img-group-left img {\r\n    min-height: 30px;\r\n}\r\n\r\n.leis-topnav .leis-list-group .leis-child-group {\r\n    margin: 0;\r\n    border: none;\r\n    outline: none;\r\n    padding: 2.5px 2.5px 0 0;\r\n}\r\n\r\n.leis-topnav .leis-list-group .leis-child-group * {\r\n    text-decoration: none;\r\n    color: inherit;\r\n\r\n}\r\n\r\n@media screen and (max-width:600px) {\r\n\r\n    .leis-topnav a:not(:first-child) {\r\n        display: none;\r\n    }\r\n\r\n    .leis-topnav a.icon {\r\n        float: right;\r\n        display: block;\r\n\r\n    }\r\n\r\n    .leis-topnav.responsive a.icon {\r\n        position: absolute;\r\n        top: 0;\r\n        right: 0;\r\n    }\r\n\r\n    .leis-topnav.responsive a {\r\n        float: none;\r\n        display: block;\r\n        text-align: left;\r\n    }\r\n}\r\n\r\n/* SideNav */\r\n.leis-sideNav {\r\n    padding: 10px;\r\n    height: 100%;\r\n    width: 250px;\r\n    position: fixed;\r\n    overflow: hidden;\r\n    z-index: 100;\r\n    top: 0;\r\n    left: 0;\r\n    background-color: var(--leis-dark-cl);\r\n    overflow-x: hidden;\r\n    transition: 0.5s;\r\n    -webkit-box-shadow: var(--leis-sideNav-bx-sh);\r\n    box-shadow: var(--leis-sideNav-bx-sh);\r\n    border-right: 1.8px solid var(--leis-default-cl);\r\n}\r\n\r\n.leis-sideNav .leis-collapsing-container * {\r\n    color: inherit;\r\n}\r\n\r\n.leis-sideNav .leis-list-group * {\r\n    font-weight: 400;\r\n}\r\n\r\n.leis-sideNav .leis-collapsing-container .leis-collapse-btn {\r\n    padding-left: 20px;\r\n    font-size: inherit;\r\n    font-weight: inherit;\r\n}\r\n\r\n.leis-sideNav .leis-collapsing-container .leis-collapse-btn::before {\r\n    left: 0;\r\n}\r\n\r\n.leis-sideNav .leis-collapsing-container .leis-collapse-btn.colla-btn-show {\r\n    font-weight: 400;\r\n    color: #dad6d6e8;\r\n}\r\n\r\n.leis-sideNav .leis-collapsing-container .leis-collapse-btn:hover {\r\n    color: #ede7e7;\r\n}\r\n\r\n.leis-sideNav a {\r\n    text-decoration: none;\r\n    color: inherit;\r\n    font-size: inherit;\r\n    font-family: inherit;\r\n}\r\n\r\n.leis-sideNav .leis-list-group.links {\r\n    max-height: 75vh;\r\n    overflow: hidden;\r\n    overflow-x: hidden;\r\n    overflow-y: auto;\r\n}\r\n\r\n.leis-sideNav .leis-list-group::-webkit-scrollbar {\r\n    height: 4px;\r\n    width: 8px;\r\n    cursor: default !important;\r\n\r\n}\r\n\r\n.leis-sideNav .leis-list-group::-webkit-scrollbar-thumb {\r\n    background-color: rgba(222, 217, 217, 0.541);\r\n}\r\n\r\n.leis-sideNav .leis-list-group .leis-child-group {\r\n    padding: 8.5px 6px;\r\n    font-size: 1.1rem;\r\n    font-family: inherit;\r\n    border-radius: 8px;\r\n    border: none;\r\n    color: rgb(216, 212, 212);\r\n    cursor: pointer;\r\n    -webkit-user-select: none;\r\n    user-select: none;\r\n    display: flex;\r\n    justify-content: start;\r\n    gap: 13px;\r\n}\r\n\r\n.leis-sideNav .leis-list-group .leis-child-group.active {\r\n    background-color: inherit;\r\n\r\n}\r\n\r\n.leis-sideNav .leis-collapsing-container .leis-list-group .leis-child-group {\r\n    padding: 3px 1.5px;\r\n}\r\n\r\n.leis-sideNav .leis-collapsing-container .leis-list-group {\r\n    padding-left: 15px;\r\n}\r\n\r\n.leis-sideNav .sideNavHeader {\r\n    padding: 5px 5px;\r\n    color: #fff;\r\n    font-size: 1.5rem;\r\n    margin-bottom: 1rem;\r\n    padding-bottom: 1.5rem;\r\n    border-bottom: 1.5px solid #6860609f;\r\n}\r\n\r\n.leis-sideNav .sideNavFooter {\r\n    position: absolute;\r\n    bottom: 0;\r\n    left: 0;\r\n    width: 100%;\r\n    padding: 10px 10px;\r\n    color: #fff;\r\n    font-size: 1.5rem;\r\n    padding-top: 1rem;\r\n    border-top: 1.5px solid #6860609f;\r\n\r\n}\r\n\r\n\r\n\r\n.leis-sideNav .leis-list-group .leis-child-group:not(.colla-item):hover {\r\n    background-color: #98c3f16b;\r\n}\r\n\r\n.leis-sideNav .leis-list-group .leis-child-group.sideItemActive {\r\n    background-color: #0069d9;\r\n    color: #fff;\r\n}\r\n\r\n\r\n.leis-sideNav a:hover {\r\n    background-color: var(--leis-light-hover-cl);\r\n}\r\n\r\n.leis-sideNav .leis-close-btn {\r\n    position: absolute;\r\n    top: 0;\r\n    right: 0;\r\n    font-size: 35px;\r\n    margin-left: 50px;\r\n}\r\n\r\n\r\n.leis-openSide,\r\n.leis-Closeside {\r\n    position: relative;\r\n    display: inline-block\r\n}\r\n\r\n@media screen and(max-height:450px) {\r\n    .leis-sideNav {\r\n        padding: 15px;\r\n    }\r\n\r\n    .leis-sideNav a {\r\n        font-size: 18px;\r\n    }\r\n}\r\n\r\n/* dropdown btn */\r\n\r\n\r\n.leis-dropdown,\r\n.leis-slideshow-container {\r\n    position: relative;\r\n    border: none;\r\n    outline: none;\r\n    box-shadow: none;\r\n}\r\n\r\n.leis-dropdown {\r\n    display: inline-block;\r\n}\r\n\r\n.leis-dropdown-content {\r\n    display: none;\r\n    position: absolute;\r\n    top: -8px;\r\n    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, .2) !important;\r\n    z-index: 1;\r\n    animation: fade .16s ease-in;\r\n}\r\n\r\n.leis-dropdwn-content-card {\r\n    position: relative;\r\n    max-height: 350px;\r\n    min-width: 100px;\r\n    overflow-y: auto;\r\n    overflow-x: hidden;\r\n}\r\n\r\n.leis-content {\r\n    width: 100%;\r\n    position: relative;\r\n}\r\n\r\n.leis-content>.leis-dropdown-content {\r\n    width: 100%;\r\n}\r\n\r\n.leis-dropdown-content a {\r\n    color: black;\r\n    padding: 12px 16px;\r\n    display: block;\r\n}\r\n\r\n.leis-dropdwn-content-card>* {\r\n    display: block;\r\n}\r\n\r\n.hide {\r\n    display: none;\r\n}\r\n\r\n.show {\r\n    display: block;\r\n}\r\n\r\n/* Page */\r\n\r\n.leis-mainPage {\r\n    position: relative;\r\n    padding-top: 30px;\r\n    min-width: 100%;\r\n}\r\n\r\n.leis-page-content {\r\n    position: relative;\r\n    display: none;\r\n    animation: fr .4s ease-in-out\r\n}\r\n\r\n@keyframes fr {\r\n    from {\r\n        transform: scale(0.5);\r\n        opacity: 0;\r\n    }\r\n\r\n    to {\r\n        transform: scale(1);\r\n        opacity: 1;\r\n    }\r\n}\r\n\r\n.leis-page-legende {\r\n    cursor: pointer;\r\n}\r\n\r\n/* slideshow/ carousel */\r\n\r\n.leis-slideshow-container {\r\n    padding: 0;\r\n    margin: 0;\r\n    max-width: 1000px;\r\n    margin: auto;\r\n    overflow: hidden;\r\n}\r\n\r\n.leis-slideshow-container .leis-img-card {\r\n    width: 100%;\r\n    height: inherit;\r\n    padding: 0;\r\n    margin: 0;\r\n    position: relative;\r\n    display: none;\r\n\r\n}\r\n\r\n.leis-slideshow-container .leis-img-card .leis-img {\r\n    width: 100%;\r\n    height: auto;\r\n    max-height: calc(100%);\r\n}\r\n\r\n.leis-slideshow-prev-btn,\r\n.leis-slideshow-next-btn {\r\n    cursor: pointer;\r\n    position: absolute;\r\n    top: 50%;\r\n    padding: 10px;\r\n    color: white;\r\n    font-weight: bold;\r\n    font-size: 18px;\r\n    transition: 0.6s ease;\r\n    border-radius: 0 3px 3px 0;\r\n    -webkit-user-select: none;\r\n    user-select: none;\r\n    z-index: 1;\r\n}\r\n\r\n.leis-slideshow-prev-btn {\r\n    left: 0;\r\n}\r\n\r\n.leis-slideshow-next-btn {\r\n    right: 0;\r\n    border-radius: 3px 0 0 3px;\r\n}\r\n\r\n.leis-slideshow-next-btn:hover,\r\n.leis-slideshow-prev-btn:hover {\r\n    background-color: rgba(0, 0, 0, 0.8);\r\n}\r\n\r\n.leis-slideshow-txt {\r\n    color: #f2f2f2;\r\n    font-size: 18px;\r\n    position: absolute;\r\n    padding: 8px;\r\n    left: 0;\r\n    bottom: 0;\r\n    width: 100%;\r\n    text-align: center;\r\n    background-color: rgba(0, 0, 0, 0.479);\r\n    z-index: 1;\r\n}\r\n\r\n.leis-slideshowNumTxt {\r\n    position: absolute;\r\n    color: #f2f2f2;\r\n    font-size: 17px;\r\n    padding: 8px 12px;\r\n    top: 0;\r\n}\r\n\r\n.leis-slideshow-dot {\r\n    cursor: pointer;\r\n    height: 15px;\r\n    width: 15px;\r\n    margin: 0 2px;\r\n    background-color: #bbb;\r\n    border-radius: 50%;\r\n    display: inline-block;\r\n    transition: background-color 0.6s ease\r\n}\r\n\r\n.active,\r\n.leis-slideshow-dot:hover {\r\n    background-color: #717171;\r\n}\r\n\r\n.fade {\r\n    animation-name: fade;\r\n    animation-duration: 1.5s;\r\n}\r\n\r\n.leis-firstSlideShow {\r\n    word-wrap: break-word;\r\n}\r\n\r\n@keyframes fade {\r\n    from {\r\n        opacity: .4;\r\n    }\r\n\r\n    to {\r\n        opacity: 1;\r\n    }\r\n}\r\n\r\n\r\n/* slideshow gallery */\r\n/* ---------------------- */\r\n\r\n/* modal image */\r\n\r\n\r\n/* dispay */\r\n.leis-flex {\r\n    display: flex;\r\n}\r\n\r\n.leis-gap-5 {\r\n    gap: 5px;\r\n}\r\n\r\n*:hover>.leis-tooltip {\r\n    visibility: visible;\r\n    opacity: 1;\r\n    z-index: 1001;\r\n}";

  const leistrap = (function () {

      // checks if the document is created before to execute any code
      let state = false;

      // all extensions 
      let extensionMap = {};

      // all leistrap configurations
      let setting = {};

      //elements to hide when the window is click
      let hideWin = [];

      // the main leistrap  event channels
      const mainEvent = _EventEmitter();
      const indexedElementEvent = _EventEmitter();
      // contains all leistrap object 
      let leisElementMap = {};

      class BaseElement {
          constructor(element) {
              /*** @type {HTMLLinkElement}*/
              this._conf = element;

              // the unique leistrap object key
              this.key = generateId(5, 10);

              // contains all children
              /**@type{Array<BaseElement>}*/
              this.content = [];
              this.contentMap = {};
              /**
               * thes element state
               * @type {{
               * rendered : boolean, 
               * }}
               */
              this.state = {visible: true};
              /**@type {BaseElement} */
              this.parent = null;
              this.eventMap = {};
              /** the local data  */
              this.data = {
                  indexName: null,
                  element: this,
                  get id() { return this.indexName },
                  set id(value) {
                      indexedElementEvent.handle(value, e => e.send(this.element), true, false)
                          .then(() => this.indexName = value);
                  }
              };
              // the object eventEmiter interface
              this.event = _EventEmitter();
              this.eventListeners = {};

              //handle all event 
              this.once = function (e, listener) {
                  if (!has(e, this.eventListeners)) this.eventListeners[e] = [];
                  this.eventListeners[e].push(listener);
                  return this
              };
              // associate the leistrap object to the htmlElement
              this._conf.currentElement = this;

              // call all useInit Hooks and pass the this as parameter
              hooks.callHook("useInit", DisplayError, this);


          }


          render() {

              if (!this.state.rendered) {
                  // render all children
                  this.content.forEach(child => {
                      if (child.parent.key === this.key) {
                          this.contentMap[child.key] = child;
                          this._conf.append(child.render());
                      }

                  });


                  //  execute all  useRender hoos
                  hooks.callHook("useRender", DisplayError, this);

                  // set the object key as id to the element 
                  this._conf.id = this.key;
                  this.state.rendered = true;

                  // call all render eventListeners
                  handleAllEvent("render", this.eventListeners, this);
             
                  
              }

              return this._conf
          }

          /**
           * 
           * @param {BaseElement} element 
           * @returns this
           */
          add(elementObject) {
              let element = getObjectByIndexName(elementObject, true, (e) => this.add(e));
              handleAllEvent("add", this.eventListeners, this, 10, element);
              if (isTypeOf(element, BaseElement)) {
                  element.parent = this;
                  this.contentMap[element.key] = element;
                  this._conf.append(element.render());
                  this.content.push(element);
                  return this
              }
              return this
          }

          // destroy the leistrap object and remove the element from the DOM
          destroy() {
              setTimeout(() => {

                  // call all destroy events listeners
                  handleAllEvent("destroy", this.eventListeners, this);

                  // check if the object has a indexedElementEvent channel and then
                  // remove this channel from the indexedElementEvent object 
                  if (this.data.id) indexedElementEvent.removeEvent(this.data.id);

                  // remove the object from leisElementMap object 
                  delete leisElementMap[this.key];

                  // remove the leistrap object from the parent object
                  if (has(this.key, this.parent.contentMap)) {
                      delete this.parent.contentMap[this.key];
                      this.parent.content = loopObject(this.parent.contentMap);

                      // remove the object from the DOM
                      this.parent._conf.removeChild(this._conf);

                      // clear the object and save memory
                      setTimeout(() => {
                          loopObject(this, (value, key) => { delete this[key]; });
                      }, 1000);
                  }
              }, 100);
              return this
          }

          /**
           * allows to remove a child object
           * @param {BaseElement} element 
           */
          remove(element) {
              if (isString(element)) {
                  getObjectByIndexName(element, true, child => child.destroy());
              }
              else { element.destroy(); }
              return this
          }

          removeAll(listener) {
              setTimeout(() => {
                  let counter = 0;
                  let len = this.content.length;
                  let allElem = loopObject(this.contentMap);
                  let timer = setInterval(() => {
                      allElem[counter++].destroy();
                      if (counter === len){
                          if(listener) listener();
                          clearInterval(timer);
                      }
                  }, 100);
              }, 100);
              return this
          }
          addElements(...elements) {
              let counter = 0;
              let timer = setInterval(() => {
                  this.add(elements[counter++]);
                  if (counter === elements.length) clearInterval(timer);
              }, 100);

              return this
          }

          /**
           * 
           * @param {keyof WindowEventMap} eventType 
           * @param  {(e : Event)=> void} listener 
           * @param { string} eventName 
           * @param {*} options 
           */
          addEvent(eventType, listener, eventName, options) {

              const element = this;
              if (typeof listener === "function") {

                  const copyListener = listener;

                  function callback(target) {
                      // the target.currentElement represents the leistrap object 
                      // associated to the html target
                      copyListener.call(element, target);
                      // call any hooks here to fire and catch all events passed to
                      // an element ......
                  }

                  // verify iff the eventType already exists in the eventMap object
                  if (!this.eventMap[eventType]) { this.eventMap[eventType] = {}; }

                  // set a id to listener if the eventName is not set we generate an auto id
                  // and save it into the eventMap[eventType] object 
                  if (!eventName) eventName = !isEmpty(listener.name) ? listener.name : generateId(3, 8);

                  // the event listener id must be unique, let verify the eventName 
                  if (has(eventName, this.eventMap[eventType]))
                      DisplayError("UniqueType", "uniqueTypeError", "listenerName," + eventName);

                  // now let save the listener in to the eventMap[eventType] object
                  // this will helps to automatically remove a given eventType lister 
                  this.eventMap[eventType][eventName] = callback;

                  // finally, add an eventListener to the element
                  this._conf.addEventListener(eventType, callback, options);


              }
              return this
          }

          removeEvent(eventType, eventName, options) {
              if (!isEmpty(eventType) && !isEmpty(eventName) && this.eventMap[eventType]) {
                  if (this.eventMap[eventType][eventName]) {
                      this._conf.removeEventListener(eventType,
                          this.eventMap[eventType][eventName], options
                      );
                      delete this.eventMap[eventType][eventName];
                  }
              }
              return this
          }

          setStyleSheet(cssDefinition) {
              if (isString(cssDefinition)) this._conf.style = cssDefinition;
              if (isObject(cssDefinition)) loopObject(cssDefinition, (value, key) => {
                  this._conf.style[key] = value;
              });
              return this
          }

          setText(value) { this._conf.innerText = value; return this }
          getText() { return this._conf.textContent || this._conf.innerText }
          setClassName(classNames) {
              accessClassList(classNames, this._conf, "add");
              return this
          }
          removeClassName(classNames) {
              accessClassList(classNames, this._conf, "remove");
              return this
          }
          toggleClassName(classNames) {
              accessClassList(classNames, this._conf, "toggle");
              return this
          }
          replaceClassName(classNames, newClassNames) {
              accessClassList(classNames, this._conf, "replace", newClassNames);
              return this
          }
          addAttr(attrName, value) {
              if (isString(attrName) && isString(value)) {
                  this._conf.setAttribute(attrName, value);
              }
              else if (isObject(attrName)) {
                  loopObject(attrName, (value, key) => this._conf.setAttribute(key, value));
              }
              return this
          }

          getAttr(attrName) {
              if (isString(attrName)) return this._conf.getAttribute(attrName)

              if (isArray(attrName)) {
                  const result = {};
                  attrName.forEach(item => result[item] = this._conf.getAttribute(item));
                  return result
              }
              return null
          }

          removeAttr(attrName) {
              if (isString(attrName)) this._conf.removeAttribute(attrName);
              if (isArray(attrName)) {
                  attrName.forEach(item => this._conf.removeAttribute(item));
              }
              return this
          }
          hide() { this.addAttr('hidden', "true"); return this }
          show() { this.removeAttr('hidden'); }
      }

      // this function creates an htmlElement and you can  
      // pass some properties by the option parameter
      function create(TagName, options = {}) {
          const element = new BaseElement(document.createElement(TagName));
          SetOptions(element, options, getObjectByIndexName);
          hooks.callHook("useOption", DisplayError, element, options);
          leisElementMap[element.key] = element;
          setTimeout(() => options = null, 4000);
          return element

      }

      // the main parent!
      const main = new BaseElement(document.createElement("div"));
      main.data.id = "main";

      // set the default style
      document.head.append(
          new BaseElement(document.createElement("style")).setText(leistrapCss).render()
      );

      // executes and create our app once the DOM is loaded
      function whenReady(listener) {
          if (isFunction(listener)) {
              listener.call(main);
          }
          else { DisplayError("LeisError", "listenerError", listener); }

          state = true;
      }

      // indicate the HtmlElement's entry point of the application
      // defines where all elements will be added
      async function render(id) {
          setTimeout(function () {
              if (state) Render(document.getElementById(id), main);
              else { DisplayError("LeisProcessNotReady", "processNotReady"); }
          }, 500);
      }

      /**
       *  this function allows the definition of the extension 
       * note : the extension name must be unique otherwise an error will be thrown
       * the functionalities (hooks) tat an extension can access :
       *  1. setting : access all settings passed 
       *  2. leistrap : access the leistrap object
       *  3. hooks : access and add the new functionality which will added into the 
       *      the hook chosen
       */

      function defineExtension(extensionName, listener) {
          if (isFunction(listener)) {
              executeExtension(extensionName, listener);
          }
          else { DisplayError("LeisError", "listenerError", listener); }

      }
      function executeExtension(extensionName, listener) {
          if (!has(extensionName, extensionMap)) {
              const extensionResult = listener(setting, leistrap, hooks);
              if (extensionResult) leistrap[extensionName] = extensionResult;
              extensionMap[extensionName] = extensionName;
          }
          else { DisplayError("UniqueType", "uniqueTypeError", "extensionName," + extensionName); }
      }

      // allows to get the object indexed via the data.id property
      function getObjectByIndexName(indexName, waitFor, clb) {
          if (isString(indexName) && waitFor) {
              indexedElementEvent.invoke(indexName, clb);
          }
          return indexName
      }

      // adds an element to other by using localId syntax
      function addTo(parentId, child) {
          if (isString(parentId)) {
              getObjectByIndexName(parentId, true, function (parentElement) {
                  parentElement.add(child);
              });
          }
      }

      // find a leistrap object and apply some methods to it
      function getElement(name, method, ...args) {
          return new Promise(function (resolve, reject) {
              getObjectByIndexName(name, true, element => {
                  if (typeof element[method] == "function")
                      element[method](...args);
                  resolve(element);
              });
          })
      }

      function accessClassList(classNames, element, method, tokes) {
          if (tokes && method == "replace") {
              tokes = tokes.trim().split(String.fromCharCode(32));
              classNames.trim().split(String.fromCharCode(32))
                  .forEach((item, index) => {
                      if (!isEmpty(item) && tokes[index])
                          element.classList.replace(item, tokes[index]);
                  });
          }
          else {
              if (isString(classNames)) classNames.trim().split(String.fromCharCode(32))
                  .forEach((item, index) => { if (!isEmpty(item)) element.classList[method](item); });
          }
          return this
      }

      function addCss(cssDeclaration, force) {
          if (cssDeclaration || force) {
              const style = create("style", { text: cssDeclaration });
              document.head.append(style.render());
              return style
          }
          return null
      }
      function leistrap(configurations = copyObject(setting)) {
          setting = configurations;
      }

      function handleAllEvent(eventName, evObject, element, timeout, ...argv) {
          if (has(eventName, evObject)) {
              evObject[eventName].forEach(item => {
                  if (timeout) setTimeout(item, timeout, element, ...argv);
                  else { item(element, ...argv); }
              });
          }
      }

      leistrap.main = main;
      leistrap.event = mainEvent;
      leistrap.create = create;
      leistrap.whenReady = whenReady;
      leistrap.render = render;
      leistrap.defineExtension = defineExtension;
      leistrap.event.handle("main", (e) => e.send(main));
      leistrap.addTo = addTo;
      leistrap.get = getElement;
      leistrap.addCss = addCss;
      leistrap.hideWhenWinClick = function (element) { hideWin.push(element); };
      leistrap.lorem = "    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Culpa dolor aliquid quibusdam. Optio mollitia fugit nulla culpa, provident placeat unde iure eveniet earum nam, laborum hic autem? Rem, tenetur odio!";
      leistrap.Colors = ["primary", "secondary", "info", "dark", "danger", "light", "success", "warning"];
      leistrap.MLorem = function (num) { return rangeList(num).map(function (item) { return leistrap.lorem }).join(' ') };
      // init all default extensions, functionalities

      // hide all elements inside the hideWin Array

      window.addEventListener('click', function (event) {
          hideWin.forEach(item => item(event));
      });
      leistrap.map = leisElementMap;
    
      return leistrap
  })();

  function shortCut(element, objLeis) {
      
      // create event emitter to handle a given combination of 
      // key or characters
      const event_ = _EventEmitter();

      //object to save all keydown keyCode
      let shortcuts = {};

      // the counter variable is for sorting the keys save into the shortcuts object
      //in order asc
      let counter = 0;
      
      // listening to key key and get this one
      element.addEventListener("keydown", function (e) {
          // checkKey(e)
      
          if (!has(e.key.toLowerCase(), shortcuts)) {
              shortcuts[e.key.toLowerCase()] = counter++;      
          }
          getResult(e);
      });

      function getResult(e){
          const invers = inverseObject(shortcuts);
          let result = Object.keys(invers);
          let len = result.length;
          result = result.sort().map(item => invers[item]).join("");
    
          
          if (has(result, event_.eventsList()) && len <= 3 ) {
                e.preventDefault();
              event_.invoke(result, null, e);

          }
      }



      //remove the key released
      element.addEventListener("keyup", function (e) {
          // e.preventDefault()

          // if the shortcut has 4 or more characters
          //call the shortcut handle
          if(Object.keys(shortcuts).length >= 4 ) getResult(e);
        
          delete shortcuts[e.key.toLowerCase()];
          if (isEmpty(shortcuts)) {
              counter = 0;
          }
      });

      // empty the shortcuts object 
      element.addEventListener("blur", function (e) {
         shortcuts = {};
      });

      
       function bind (token, listener) {
          const tokenTyped = keyMap(token);
          event_.handle(tokenTyped.result, (evt, evtKey) => {
              listener(evtKey);
          });
      }
      function  reShortcut (token) {
          const short = keyMap(token).result;
          event_.removeEvent(short);
      }

      element.bind = bind;
      element.reShortcut = reShortcut;
  }




  function keyMap(keys) {
      let keyTyped = keys.replace(/ /gi, "").split("+")
          .map(item => {
              if (isEmpty(item)) return "+"
              else { return item }

          });
      const maps = {
          "tab": "tab",
          "ctrl": "control",
          "control": "control",
          "cmd": "command",
          "escape": "escape",
          "esc": "escape",
          "capslock": "capslock",
          "shift": "shift",
          "alt": "alt",
          "enter": "enter",
          "contextmenu": "contextmenu",
          "backspace": " ",
          "arrowup": "arrowup",
          "arrowdown": "arrowdown",
          "arrowleft": "arrowleft",
          "arrowright": "arrowright"
      };

      keyTyped = keyTyped.map(item => {
          item = item.toLowerCase();
          if (maps[item]) return maps[item]
          else { return item }

      });

      return {
          result: keyTyped.join("").replace("++", '+'),
          length: keyTyped.length
      }

  }

  var popCss = ".leis-pop{\r\n    position: fixed;\r\n    left: 25%;\r\n    top: 10px;\r\n    width: 500px;\r\n    height: 400px;\r\n    background-color: #fff;\r\n    border: var(--border);\r\n    border-radius: 8px;\r\n    padding: 20px;\r\n    overflow: hidden;\r\n    overflow-y: auto;\r\n    -webkit-user-select: none;\r\n    user-select: none;\r\n\r\n}\r\n\r\n.pop-title{\r\n    font-weight: 500;\r\n    padding-bottom: 0.5rem;\r\n    border-bottom: var(--leis-border);\r\n    margin-bottom: 1rem;\r\n    justify-content: space-between;\r\n}\r\n\r\n.pop-body{\r\n\r\n    position: relative;\r\n    width: 100%;\r\n    height: calc(100% - 5rem);\r\n    overflow:hidden ;\r\n    overflow-y: auto;\r\n}\r\n\r\n.pop-title+.pop-header{\r\n    top: -0.5rem;\r\n    margin-bottom: 0.2rem;\r\n}\r\n\r\n.zoom-out{\r\n    animation: zoom-out .3s ease-in-out;\r\n}\r\n\r\n\r\n@keyframes zoom-out {\r\n    from {\r\n        opacity: 0.1;\r\n        transform: scale(0.2);\r\n\r\n    }\r\n\r\n    top {\r\n        opacity: 1;\r\n        transform: scale(0);\r\n    }\r\n}";

  /**
   * 
   * @param {'absolute'} position 
   * @param {{
   * container: HTMLElement,
   * popUp : HTMLElement,
   * side  : Array<"top"|"bottom"|'left'|'right'>,
   * rect? : {x: number, y : number, top: number, left : number, width: number, height : number} 
   * popUpRect? : {x: number, y : number, top: number, left : number, width: number, height : number} 
   * }} option 
   */
  function setPopPosition(position, option) {

      // check if the  popup dialog is visible or not
      let show = false;

      if (!option) option = {};
      if (!option.side) option.side = ["top", 'bottom'];
      absolutePosition(option.container, option.popUp, option.rect, option.popUpRect);


      /**
       * @param {HTMLElement} container 
       * @param {HTMLElement} popUp 
       */
      function absolutePosition(container, popUp, defRct, popUpRect) {
          show = false;
          // check left side
          const rect = defRct || container.getClientRects()[0];
          const popRect = popUpRect || popUp.getClientRects()[0];
          const gap = option.gap || 10;
          const SIDE = { TOP, BOTTOM, LEFT, RIGHT };

          if (option.side) {
              option.side.forEach(item => {
                  if (SIDE[item.toUpperCase()] && !show) {
                      SIDE[item.toUpperCase()]();
                  }

              });

          }
          function LEFT() {
              // left side
              if (rect.left + gap >= popRect.width) {
                  if (rect.top + gap >= popRect.height) {
                      popUp.style.left = (rect.left - popRect.width).toString() + "px";
                      popUp.style.top = ((rect.top - popRect.height) + rect.height).toString() + "px";
                      show = true;
                  }
                  else if (window.innerHeight - (rect.top + gap + rect.height) >= popRect.height) {
                      popUp.style.left = (rect.left - popRect.width).toString() + "px";
                      popUp.style.top = (rect.top).toString() + "px";
                      show = true;
                  }

              }
          }

          function BOTTOM() {
              // bottom side

              if (window.innerHeight - (rect.top + rect.height + gap) >= popRect.height) {
                  //bottom right
                  if (window.innerWidth - (rect.x + gap) >= popRect.width) {
                      popUp.style.top = (rect.top + rect.height).toString() + "px";
                      popUp.style.left = (rect.x).toString() + "px";
                      show = true;
                  }
                  else {
                      popUp.style.top = (rect.top + rect.height).toString() + "px";
                      let left = ((rect.x + rect.width) - popRect.width);
                      if (left <= 0) left = gap;
                      popUp.style.left = left.toString() + "px";
                      show = true;
                  }

              }
          }

          function TOP() {
              // top side

              if (rect.top + gap >= popRect.height) {
                  //top right

                  if (window.innerWidth - (rect.x + gap) >= popRect.width) {
                      popUp.style.top = (rect.top - popRect.height).toString() + "px";
                      popUp.style.left = (rect.x).toString() + "px";
                      show = true;
                  }
                  else {
                      popUp.style.top = (rect.top - popRect.height).toString() + "px";
                      let left = ((rect.x + rect.width) - popRect.width);
                      if (left <= 0) left = gap;
                      popUp.style.left = left.toString() + "px";
                      show = true;

                  }

              }
          }


          function RIGHT() {
              // right side

              if (window.innerWidth - (rect.x + rect.width) >= popRect.width) {

                  // right top
                  if (rect.top + gap >= popRect.height) {
                      popUp.style.top = ((rect.top + rect.height) - popRect.height).toString() + "px";
                      popUp.style.left = (rect.x + rect.width).toString() + "px";
                      show = true;
                  }
                  else {
                      let top = (rect.top + rect.height) - gap;
                      if ((top + popRect.height) > window.innerHeight) {
                          let cp = top - ((top + popRect.height + gap) - window.innerHeight);
                          top = cp;
                      }
                      popUp.style.top = top.toString() + "px";
                      popUp.style.left = ((rect.x + rect.width) - gap).toString() + "px";
                      show = true;
                  }

              }

          }
      }

      // when there s no place to play the pop up  let set a default style value
      if (!show) {
          option.popUp.style.top = "10px";
          option.popUp.style.left = "10px";
      }
  }

  /**
   * drag event
   * @param {HTMLElement} element
   * @type {{
   * dx: number,
   * dy:number,
   * startY: number,
   * startX : number,
   * target : HTMLElement
   * }} draggableEvent
   * 
   * @param {{
   * end? : (option : draggableEvent)=> void,
   * move? : (option : draggableEvent)=> void,
   * start? : (option : draggableEvent)=> void,
   * autoDragging? : Boolean,
   * targetBind : HTMLElement,
   * preventDefault : Boolean
   * }} option
   */

  function Draggable(element, option = {}) {

      // Variables to store initial positions
      let startX, startY, initialMouseX, initialMouseY, startWidth, startHeight;
      let targetBind;
      let dx, dy;

      let start, counter;

      // Step 2: Add 'mousedown' event listener to start dragging
      element.addEventListener('mousedown', function (e) {
          if (option.init) option.init(e);
          if (option.preventDefault) e.preventDefault();
          // check the start event
          counter = 1;
          // Record initial mouse position
          initialMouseX = e.clientX;
          initialMouseY = e.clientY;

          // Capture the element's initial position
          startX = element.offsetLeft;
          startY = element.offsetTop;
          startWidth = element.offsetWidth;
          startHeight = element.offsetHeight;
          if (option.targetBind) {
              targetBind = {
                  width: option.targetBind.offsetWidth,
                  height: option.targetBind.offsetHeight,
                  x: option.targetBind.offsetLeft,
                  y: option.targetBind.offsetTop
              };
          }

          // Step 3: Add event listeners for mousemove and mouseup
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
      });

      // Step 4: Define function to handle 'mousemove'
      function onMouseMove(e) {
          if (option.preventDefault) e.preventDefault();
          // Calculate how far the mouse has moved 
          dx = e.clientX - initialMouseX;
          dy = e.clientY - initialMouseY;

          //check the starting drag event
          if (counter) counter++;
          if (counter === 3) {
              counter = null;
              if (option.start) option.start({ target: element, dx, dy, startX, startY });
              start = true;
          }

          if (option.move) option.move({
              target: element,
              dx, dy, startX, startY, startHeight, startWidth,
              initialMouseX, initialMouseY, event: e, targetBind
          });
          if (option.autoDragging && !element.resizable) {
              // Update the element's position
              element.style.left = startX + dx + 'px';
              element.style.top = startY + dy + 'px';
          }
      }

      // Step 5: Define function to stop dragging
      function onMouseUp() {
          // Remove 'mousemove' event when mouse button is released
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          if (start && option.end) {
              option.end({ target: element, dx, dy, startX, startY });
              start = false;
              counter = null;
          }

          element.resizable = false;

      }

  }

  const DROP_MAP = {};
  let ZIndex = 1;
  leistrap.addCss(popCss);

  /**
   * @param {leistrap.Leistrap<HTMLElement>} button the button once clicked show the popup
   * @param {Array<"left" | "right" |"top" |"bottom">} side 
   * @param {boolean} [drag=true] 
   */
  function DropUp(button, side, drag=true, parent) {

      // all eventListeners
      const eventMap = {};
      
      // h custom property
      let action; 
      
      const pop = leistrap.create("div", {
          parent: parent == "sb-m" ? null : "main",
          className: "leis-dropdown-content leis-pop",
          onclick: (e) => {
              e.stopPropagation();
              if (eventMap.click) eventMap.click.forEach(item => item());
          }
      });
      pop.state.visible = false;

      setBtn(button);

      if(drag){
          Draggable(pop._conf, {
              autoDragging : true
          });
      }

      /** 
       * associate a button to the popup container */
      function setBtn(btn) {
          if (btn) {
              btn.addEvent("click", function (e) {
                  tryCode(()=>{
                      if (e) e.stopPropagation();
                          show(btn.popInstance);
                          setPopPosition("absolute", {
                              container: this._conf,
                              popUp: pop._conf,
                              side: side || ["bottom", "top", "right", "left"]
                          });
                          pop.setClassName("zoom-out");
                  });
              });
          }
      }

      /**
       * 
       * @param {{x: number, 
       * y : number,
       *  top: number, 
       * left : number, 
       * width: number, 
       * height : number} } rect the position for moving the popUp
       */
      function move(rect, side) {
          show();
          setPopPosition("absolute", {
              rect,
              popUp: pop._conf,
              side: side || ["bottom", "top", "right", "left"]
          });
      }

      /**
       * @param {"hide" | "show" |"click"} eventName 
       * @param {()=> void} listener 
       */
      function once(eventName, listener) {
          if (!has(eventName, eventMap)) eventMap[eventName] = [];
          eventMap[eventName].push(listener);
      }


      /**
       * show the component
       * @param {Boolean} newInstance 
       */
      function show(newInstance) {
          if (!pop.state.visible || newInstance) {
              pop.setClassName("show");
              pop.setStyleSheet({ zIndex: ZIndex++ });
              if (eventMap.show) eventMap.show.forEach(item => item());
              pop.state.visible = true;
          }
      }

      /**
       * hide the component
       */
      function hide() {
          if (pop.state.visible) {
              pop.removeClassName("show");
              if (eventMap.hide) eventMap.hide.forEach(item => item());
              pop.state.visible = false;
          }

          pop.removeClassName("zoom-out");
      }

      const POP_UP = {
          pop,
          move,
          setBtn,
          show,
          hide,
          once,

          /**
           * this  property listen to the changes and it's overwrite
           * @type {(arg)=> void} 
           */
          action,
          children : []
      };

      // push the dropUp object to the DROP_MAP 
      DROP_MAP[pop.key] = POP_UP;

      return POP_UP
  }



  // hide all popup whn window is clicked
  leistrap.hideWhenWinClick(HIDE);
  shortCut(window);
  window.bind("esc", HIDE);

  leistrap.event.handle("hidepopup", function(e, ...exc){
      if(!exc) exc = [];
      loopObject(copyObject(DROP_MAP, false, false)).forEach(pop => {
          if(!has(pop.pop.key, exc))   pop.hide();
        
      });
      
  });

  function HIDE (e) {
      const exc = e.target.exc || [];

      if(!(e.target.id === "leis-color"))
      
      loopObject(copyObject(DROP_MAP, false, false, ...exc)).forEach(pop => {
          pop.hide();
      });
  }

  var menuCss = ".ls-m-i{\r\n    padding: 6px 10px;\r\n    padding-right: 25px;\r\n    cursor: pointer;\r\n    gap: 10px;\r\n    margin: 0;\r\n    justify-content: space-between;\r\n}\r\n\r\n.ls-m-i:hover{\r\n    background-color: var(--leis-select-cl);\r\n}\r\n.ls-ls-m{\r\n    list-style: none;\r\n    list-style-position: unset;\r\n    overflow: hidden;\r\n    height: 100%;\r\n}\r\n.leis-menu{\r\n    width: 100%;\r\n    padding: 8px 0;\r\n    margin: 0;\r\n}\r\n\r\n.ls-i-0,\r\n.ls-i-1,\r\n.ls-i-2{\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-overflow: ellipsis;\r\n    font-weight: 400;\r\n}\r\n\r\n.ls-i-0{\r\n    width: 10%;\r\n}\r\n.ls-i-1{\r\n    width: 55%;\r\n\r\n}\r\n.ls-i-2{\r\n    width: 35%;\r\n    display: flex;\r\n    justify-content: end;\r\n    color: #474646;\r\n\r\n}\r\n.nI{\r\n    padding-left: 25px;\r\n\r\n}";

  leistrap.addCss(menuCss);

  function leisMenu(useIcon, parent) {
      const pop = DropUp(null, null, false, parent);
      /**
      * @type {leistrap.Leistrap<HTMLElement> | HTMLElement }
      */
      let target = null;

      pop.pop.setClassName("leis-menu");
      const ul = leistrap.create("ul", {
          parent: pop.pop,
          className: "ls-ls-m",
          
      });


      function listen(evName){
          window.addEventListener(evName, function (e) {

              e.preventDefault();
              MENU.target = e.target;
              pop.move({
                  x: e.clientX,
                  y: e.clientY,
                  left: e.clientX,
                  top: e.clientY,
                  height: 10,
                  width: 10
              });
          });
      }

      function addOption(icon, title, subTitle, subMenu_){
          const li = leistrap.create("li", {
              className : "ls-m-i leis-flex leis-row",
              parent : ul,
              content : rangeList(3).map( item => leistrap.create("div", {
                  className : `ls-i-${item}`
              }))
          });

   
          li.content[1].setText(title);
          if(subMenu_){
              li.add(subMenu_.pop.pop);
              
              li.content[2].setText("SubMenu");
              li.addEvent("mouseenter", (e)=> showSubMenu(subMenu_, e, li));
              li.addEvent("mouseleave", ()=> hideSubMenu(subMenu_));
              
          }
          else {
              li.content[2].setText(subTitle);
          }
          
          {
              li.content[0].destroy();
              li.setClassName("nI");
          }
          return li
      }

      let MENU = {
          addOption,
          pop,
          target,
          listen
      };
      return MENU
  }



  let idMenu;
  function showSubMenu(pop, e, elem){
      
      if(idMenu){
          clearTimeout(idMenu);
      }
      
      idMenu = setTimeout(function(){
          pop.pop.move(elem._conf.getBoundingClientRect(), ["left", "right"]);
          clearTimeout(idMenu);
      }, 500);

  }

  function hideSubMenu(menu){
      if(idMenu){
          menu.pop.hide();
          clearTimeout(idMenu);
      }
       

  }

  leistrap.whenReady(function(){
      this.add(leistrap.create("p", {text: "Hello world "}));
      let m = leisMenu();
      let sm = leisMenu(null, "sb-m");
      sm.pop.pop.setStyleSheet({
          width : '200px',
          height : "300px"
      
      });

      let sm2 = leisMenu(null, "sb-m");
      sm2.pop.pop.setStyleSheet({
          width : '200px',
          height : "300px"
      
      });

      let sm3 = leisMenu(null, "sb-m");
      sm3.pop.pop.setStyleSheet({
          width : '200px',
          height : "300px"
      
      });

      sm.addOption(null, "hey", "c",  sm2);
      m.listen("contextmenu");
      m.addOption(null, `menu item`, "copy ", sm);
      sm.addOption(null, `menu item`, "copy ", sm3);
      rangeList(12).forEach(function(item){
          m.addOption(null, `menu item ${item}`, "copy " + item.toString())
          .addEvent("click", ()=> console.log(m.target));
      });

      m.pop.pop.setStyleSheet({
          width : "250px"
      });
  });

  leistrap.render("main");

})();
