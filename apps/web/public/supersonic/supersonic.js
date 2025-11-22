// js/vendor/osc.js/osc.js
var osc = {};
var osc = osc || {};
(function() {
  "use strict";
  osc.SECS_70YRS = 2208988800;
  osc.TWO_32 = 4294967296;
  osc.defaults = {
    metadata: false,
    unpackSingleArgs: true
  };
  osc.isCommonJS = typeof module !== "undefined" && module.exports ? true : false;
  osc.isNode = osc.isCommonJS && typeof window === "undefined";
  osc.isElectron = typeof process !== "undefined" && process.versions && process.versions.electron ? true : false;
  osc.isBufferEnv = osc.isNode || osc.isElectron;
  osc.isArray = function(obj) {
    return obj && Object.prototype.toString.call(obj) === "[object Array]";
  };
  osc.isTypedArrayView = function(obj) {
    return obj.buffer && obj.buffer instanceof ArrayBuffer;
  };
  osc.isBuffer = function(obj) {
    return osc.isBufferEnv && obj instanceof Buffer;
  };
  osc.Long = typeof Long !== "undefined" ? Long : void 0;
  osc.TextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : typeof util !== "undefined" && typeof (util.TextDecoder !== "undefined") ? new util.TextDecoder("utf-8") : void 0;
  osc.TextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : typeof util !== "undefined" && typeof (util.TextEncoder !== "undefined") ? new util.TextEncoder("utf-8") : void 0;
  osc.dataView = function(obj, offset, length) {
    if (obj.buffer) {
      return new DataView(obj.buffer, offset, length);
    }
    if (obj instanceof ArrayBuffer) {
      return new DataView(obj, offset, length);
    }
    return new DataView(new Uint8Array(obj), offset, length);
  };
  osc.byteArray = function(obj) {
    if (obj instanceof Uint8Array) {
      return obj;
    }
    var buf = obj.buffer ? obj.buffer : obj;
    if (!(buf instanceof ArrayBuffer) && (typeof buf.length === "undefined" || typeof buf === "string")) {
      throw new Error("Can't wrap a non-array-like object as Uint8Array. Object was: " + JSON.stringify(obj, null, 2));
    }
    return new Uint8Array(buf);
  };
  osc.nativeBuffer = function(obj) {
    if (osc.isBufferEnv) {
      return osc.isBuffer(obj) ? obj : Buffer.from(obj.buffer ? obj : new Uint8Array(obj));
    }
    return osc.isTypedArrayView(obj) ? obj : new Uint8Array(obj);
  };
  osc.copyByteArray = function(source, target, offset) {
    if (osc.isTypedArrayView(source) && osc.isTypedArrayView(target)) {
      target.set(source, offset);
    } else {
      var start = offset === void 0 ? 0 : offset, len = Math.min(target.length - offset, source.length);
      for (var i = 0, j = start; i < len; i++, j++) {
        target[j] = source[i];
      }
    }
    return target;
  };
  osc.readString = function(dv, offsetState) {
    var charCodes = [], idx = offsetState.idx;
    for (; idx < dv.byteLength; idx++) {
      var charCode = dv.getUint8(idx);
      if (charCode !== 0) {
        charCodes.push(charCode);
      } else {
        idx++;
        break;
      }
    }
    idx = idx + 3 & ~3;
    offsetState.idx = idx;
    var decoder = osc.isBufferEnv ? osc.readString.withBuffer : osc.TextDecoder ? osc.readString.withTextDecoder : osc.readString.raw;
    return decoder(charCodes);
  };
  osc.readString.raw = function(charCodes) {
    var str = "";
    var sliceSize = 1e4;
    for (var i = 0; i < charCodes.length; i += sliceSize) {
      str += String.fromCharCode.apply(null, charCodes.slice(i, i + sliceSize));
    }
    return str;
  };
  osc.readString.withTextDecoder = function(charCodes) {
    var data = new Int8Array(charCodes);
    return osc.TextDecoder.decode(data);
  };
  osc.readString.withBuffer = function(charCodes) {
    return Buffer.from(charCodes).toString("utf-8");
  };
  osc.writeString = function(str) {
    var encoder = osc.isBufferEnv ? osc.writeString.withBuffer : osc.TextEncoder ? osc.writeString.withTextEncoder : null, terminated = str + "\0", encodedStr;
    if (encoder) {
      encodedStr = encoder(terminated);
    }
    var len = encoder ? encodedStr.length : terminated.length, paddedLen = len + 3 & ~3, arr = new Uint8Array(paddedLen);
    for (var i = 0; i < len - 1; i++) {
      var charCode = encoder ? encodedStr[i] : terminated.charCodeAt(i);
      arr[i] = charCode;
    }
    return arr;
  };
  osc.writeString.withTextEncoder = function(str) {
    return osc.TextEncoder.encode(str);
  };
  osc.writeString.withBuffer = function(str) {
    return Buffer.from(str);
  };
  osc.readPrimitive = function(dv, readerName, numBytes, offsetState) {
    var val = dv[readerName](offsetState.idx, false);
    offsetState.idx += numBytes;
    return val;
  };
  osc.writePrimitive = function(val, dv, writerName, numBytes, offset) {
    offset = offset === void 0 ? 0 : offset;
    var arr;
    if (!dv) {
      arr = new Uint8Array(numBytes);
      dv = new DataView(arr.buffer);
    } else {
      arr = new Uint8Array(dv.buffer);
    }
    dv[writerName](offset, val, false);
    return arr;
  };
  osc.readInt32 = function(dv, offsetState) {
    return osc.readPrimitive(dv, "getInt32", 4, offsetState);
  };
  osc.writeInt32 = function(val, dv, offset) {
    return osc.writePrimitive(val, dv, "setInt32", 4, offset);
  };
  osc.readInt64 = function(dv, offsetState) {
    var high = osc.readPrimitive(dv, "getInt32", 4, offsetState), low = osc.readPrimitive(dv, "getInt32", 4, offsetState);
    if (osc.Long) {
      return new osc.Long(low, high);
    } else {
      return {
        high,
        low,
        unsigned: false
      };
    }
  };
  osc.writeInt64 = function(val, dv, offset) {
    var arr = new Uint8Array(8);
    arr.set(osc.writePrimitive(val.high, dv, "setInt32", 4, offset), 0);
    arr.set(osc.writePrimitive(val.low, dv, "setInt32", 4, offset + 4), 4);
    return arr;
  };
  osc.readFloat32 = function(dv, offsetState) {
    return osc.readPrimitive(dv, "getFloat32", 4, offsetState);
  };
  osc.writeFloat32 = function(val, dv, offset) {
    return osc.writePrimitive(val, dv, "setFloat32", 4, offset);
  };
  osc.readFloat64 = function(dv, offsetState) {
    return osc.readPrimitive(dv, "getFloat64", 8, offsetState);
  };
  osc.writeFloat64 = function(val, dv, offset) {
    return osc.writePrimitive(val, dv, "setFloat64", 8, offset);
  };
  osc.readChar32 = function(dv, offsetState) {
    var charCode = osc.readPrimitive(dv, "getUint32", 4, offsetState);
    return String.fromCharCode(charCode);
  };
  osc.writeChar32 = function(str, dv, offset) {
    var charCode = str.charCodeAt(0);
    if (charCode === void 0 || charCode < -1) {
      return void 0;
    }
    return osc.writePrimitive(charCode, dv, "setUint32", 4, offset);
  };
  osc.readBlob = function(dv, offsetState) {
    var len = osc.readInt32(dv, offsetState), paddedLen = len + 3 & ~3, blob = new Uint8Array(dv.buffer, offsetState.idx, len);
    offsetState.idx += paddedLen;
    return blob;
  };
  osc.writeBlob = function(data) {
    data = osc.byteArray(data);
    var len = data.byteLength, paddedLen = len + 3 & ~3, offset = 4, blobLen = paddedLen + offset, arr = new Uint8Array(blobLen), dv = new DataView(arr.buffer);
    osc.writeInt32(len, dv);
    arr.set(data, offset);
    return arr;
  };
  osc.readMIDIBytes = function(dv, offsetState) {
    var midi = new Uint8Array(dv.buffer, offsetState.idx, 4);
    offsetState.idx += 4;
    return midi;
  };
  osc.writeMIDIBytes = function(bytes) {
    bytes = osc.byteArray(bytes);
    var arr = new Uint8Array(4);
    arr.set(bytes);
    return arr;
  };
  osc.readColor = function(dv, offsetState) {
    var bytes = new Uint8Array(dv.buffer, offsetState.idx, 4), alpha = bytes[3] / 255;
    offsetState.idx += 4;
    return {
      r: bytes[0],
      g: bytes[1],
      b: bytes[2],
      a: alpha
    };
  };
  osc.writeColor = function(color) {
    var alpha = Math.round(color.a * 255), arr = new Uint8Array([color.r, color.g, color.b, alpha]);
    return arr;
  };
  osc.readTrue = function() {
    return true;
  };
  osc.readFalse = function() {
    return false;
  };
  osc.readNull = function() {
    return null;
  };
  osc.readImpulse = function() {
    return 1;
  };
  osc.readTimeTag = function(dv, offsetState) {
    var secs1900 = osc.readPrimitive(dv, "getUint32", 4, offsetState), frac = osc.readPrimitive(dv, "getUint32", 4, offsetState), native = secs1900 === 0 && frac === 1 ? Date.now() : osc.ntpToJSTime(secs1900, frac);
    return {
      raw: [secs1900, frac],
      native
    };
  };
  osc.writeTimeTag = function(timeTag) {
    var raw = timeTag.raw ? timeTag.raw : osc.jsToNTPTime(timeTag.native), arr = new Uint8Array(8), dv = new DataView(arr.buffer);
    osc.writeInt32(raw[0], dv, 0);
    osc.writeInt32(raw[1], dv, 4);
    return arr;
  };
  osc.timeTag = function(secs, now) {
    secs = secs || 0;
    now = now || Date.now();
    var nowSecs = now / 1e3, nowWhole = Math.floor(nowSecs), nowFracs = nowSecs - nowWhole, secsWhole = Math.floor(secs), secsFracs = secs - secsWhole, fracs = nowFracs + secsFracs;
    if (fracs > 1) {
      var fracsWhole = Math.floor(fracs), fracsFracs = fracs - fracsWhole;
      secsWhole += fracsWhole;
      fracs = fracsFracs;
    }
    var ntpSecs = nowWhole + secsWhole + osc.SECS_70YRS, ntpFracs = Math.round(osc.TWO_32 * fracs);
    return {
      raw: [ntpSecs, ntpFracs]
    };
  };
  osc.ntpToJSTime = function(secs1900, frac) {
    var secs1970 = secs1900 - osc.SECS_70YRS, decimals = frac / osc.TWO_32, msTime = (secs1970 + decimals) * 1e3;
    return msTime;
  };
  osc.jsToNTPTime = function(jsTime) {
    var secs = jsTime / 1e3, secsWhole = Math.floor(secs), secsFrac = secs - secsWhole, ntpSecs = secsWhole + osc.SECS_70YRS, ntpFracs = Math.round(osc.TWO_32 * secsFrac);
    return [ntpSecs, ntpFracs];
  };
  osc.readArguments = function(dv, options, offsetState) {
    var typeTagString = osc.readString(dv, offsetState);
    if (typeTagString.indexOf(",") !== 0) {
      throw new Error("A malformed type tag string was found while reading the arguments of an OSC message. String was: " + typeTagString, " at offset: " + offsetState.idx);
    }
    var argTypes = typeTagString.substring(1).split(""), args = [];
    osc.readArgumentsIntoArray(args, argTypes, typeTagString, dv, options, offsetState);
    return args;
  };
  osc.readArgument = function(argType, typeTagString, dv, options, offsetState) {
    var typeSpec = osc.argumentTypes[argType];
    if (!typeSpec) {
      throw new Error("'" + argType + "' is not a valid OSC type tag. Type tag string was: " + typeTagString);
    }
    var argReader = typeSpec.reader, arg = osc[argReader](dv, offsetState);
    if (options.metadata) {
      arg = {
        type: argType,
        value: arg
      };
    }
    return arg;
  };
  osc.readArgumentsIntoArray = function(arr, argTypes, typeTagString, dv, options, offsetState) {
    var i = 0;
    while (i < argTypes.length) {
      var argType = argTypes[i], arg;
      if (argType === "[") {
        var fromArrayOpen = argTypes.slice(i + 1), endArrayIdx = fromArrayOpen.indexOf("]");
        if (endArrayIdx < 0) {
          throw new Error("Invalid argument type tag: an open array type tag ('[') was found without a matching close array tag ('[]'). Type tag was: " + typeTagString);
        }
        var typesInArray = fromArrayOpen.slice(0, endArrayIdx);
        arg = osc.readArgumentsIntoArray([], typesInArray, typeTagString, dv, options, offsetState);
        i += endArrayIdx + 2;
      } else {
        arg = osc.readArgument(argType, typeTagString, dv, options, offsetState);
        i++;
      }
      arr.push(arg);
    }
    return arr;
  };
  osc.writeArguments = function(args, options) {
    var argCollection = osc.collectArguments(args, options);
    return osc.joinParts(argCollection);
  };
  osc.joinParts = function(dataCollection) {
    var buf = new Uint8Array(dataCollection.byteLength), parts = dataCollection.parts, offset = 0;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      osc.copyByteArray(part, buf, offset);
      offset += part.length;
    }
    return buf;
  };
  osc.addDataPart = function(dataPart, dataCollection) {
    dataCollection.parts.push(dataPart);
    dataCollection.byteLength += dataPart.length;
  };
  osc.writeArrayArguments = function(args, dataCollection) {
    var typeTag = "[";
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      typeTag += osc.writeArgument(arg, dataCollection);
    }
    typeTag += "]";
    return typeTag;
  };
  osc.writeArgument = function(arg, dataCollection) {
    if (osc.isArray(arg)) {
      return osc.writeArrayArguments(arg, dataCollection);
    }
    var type = arg.type, writer = osc.argumentTypes[type].writer;
    if (writer) {
      var data = osc[writer](arg.value);
      osc.addDataPart(data, dataCollection);
    }
    return arg.type;
  };
  osc.collectArguments = function(args, options, dataCollection) {
    if (!osc.isArray(args)) {
      args = typeof args === "undefined" ? [] : [args];
    }
    dataCollection = dataCollection || {
      byteLength: 0,
      parts: []
    };
    if (!options.metadata) {
      args = osc.annotateArguments(args);
    }
    var typeTagString = ",", currPartIdx = dataCollection.parts.length;
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      typeTagString += osc.writeArgument(arg, dataCollection);
    }
    var typeData = osc.writeString(typeTagString);
    dataCollection.byteLength += typeData.byteLength;
    dataCollection.parts.splice(currPartIdx, 0, typeData);
    return dataCollection;
  };
  osc.readMessage = function(data, options, offsetState) {
    options = options || osc.defaults;
    var dv = osc.dataView(data, data.byteOffset, data.byteLength);
    offsetState = offsetState || {
      idx: 0
    };
    var address = osc.readString(dv, offsetState);
    return osc.readMessageContents(address, dv, options, offsetState);
  };
  osc.readMessageContents = function(address, dv, options, offsetState) {
    if (address.indexOf("/") !== 0) {
      throw new Error("A malformed OSC address was found while reading an OSC message. String was: " + address);
    }
    var args = osc.readArguments(dv, options, offsetState);
    return {
      address,
      args: args.length === 1 && options.unpackSingleArgs ? args[0] : args
    };
  };
  osc.collectMessageParts = function(msg, options, dataCollection) {
    dataCollection = dataCollection || {
      byteLength: 0,
      parts: []
    };
    osc.addDataPart(osc.writeString(msg.address), dataCollection);
    return osc.collectArguments(msg.args, options, dataCollection);
  };
  osc.writeMessage = function(msg, options) {
    options = options || osc.defaults;
    if (!osc.isValidMessage(msg)) {
      throw new Error("An OSC message must contain a valid address. Message was: " + JSON.stringify(msg, null, 2));
    }
    var msgCollection = osc.collectMessageParts(msg, options);
    return osc.joinParts(msgCollection);
  };
  osc.isValidMessage = function(msg) {
    return msg.address && msg.address.indexOf("/") === 0;
  };
  osc.readBundle = function(dv, options, offsetState) {
    return osc.readPacket(dv, options, offsetState);
  };
  osc.collectBundlePackets = function(bundle, options, dataCollection) {
    dataCollection = dataCollection || {
      byteLength: 0,
      parts: []
    };
    osc.addDataPart(osc.writeString("#bundle"), dataCollection);
    osc.addDataPart(osc.writeTimeTag(bundle.timeTag), dataCollection);
    for (var i = 0; i < bundle.packets.length; i++) {
      var packet = bundle.packets[i], collector = packet.address ? osc.collectMessageParts : osc.collectBundlePackets, packetCollection = collector(packet, options);
      dataCollection.byteLength += packetCollection.byteLength;
      osc.addDataPart(osc.writeInt32(packetCollection.byteLength), dataCollection);
      dataCollection.parts = dataCollection.parts.concat(packetCollection.parts);
    }
    return dataCollection;
  };
  osc.writeBundle = function(bundle, options) {
    if (!osc.isValidBundle(bundle)) {
      throw new Error("An OSC bundle must contain 'timeTag' and 'packets' properties. Bundle was: " + JSON.stringify(bundle, null, 2));
    }
    options = options || osc.defaults;
    var bundleCollection = osc.collectBundlePackets(bundle, options);
    return osc.joinParts(bundleCollection);
  };
  osc.isValidBundle = function(bundle) {
    return bundle.timeTag !== void 0 && bundle.packets !== void 0;
  };
  osc.readBundleContents = function(dv, options, offsetState, len) {
    var timeTag = osc.readTimeTag(dv, offsetState), packets = [];
    while (offsetState.idx < len) {
      var packetSize = osc.readInt32(dv, offsetState), packetLen = offsetState.idx + packetSize, packet = osc.readPacket(dv, options, offsetState, packetLen);
      packets.push(packet);
    }
    return {
      timeTag,
      packets
    };
  };
  osc.readPacket = function(data, options, offsetState, len) {
    var dv = osc.dataView(data, data.byteOffset, data.byteLength);
    len = len === void 0 ? dv.byteLength : len;
    offsetState = offsetState || {
      idx: 0
    };
    var header = osc.readString(dv, offsetState), firstChar = header[0];
    if (firstChar === "#") {
      return osc.readBundleContents(dv, options, offsetState, len);
    } else if (firstChar === "/") {
      return osc.readMessageContents(header, dv, options, offsetState);
    }
    throw new Error("The header of an OSC packet didn't contain an OSC address or a #bundle string. Header was: " + header);
  };
  osc.writePacket = function(packet, options) {
    if (osc.isValidMessage(packet)) {
      return osc.writeMessage(packet, options);
    } else if (osc.isValidBundle(packet)) {
      return osc.writeBundle(packet, options);
    } else {
      throw new Error("The specified packet was not recognized as a valid OSC message or bundle. Packet was: " + JSON.stringify(packet, null, 2));
    }
  };
  osc.argumentTypes = {
    i: {
      reader: "readInt32",
      writer: "writeInt32"
    },
    h: {
      reader: "readInt64",
      writer: "writeInt64"
    },
    f: {
      reader: "readFloat32",
      writer: "writeFloat32"
    },
    s: {
      reader: "readString",
      writer: "writeString"
    },
    S: {
      reader: "readString",
      writer: "writeString"
    },
    b: {
      reader: "readBlob",
      writer: "writeBlob"
    },
    t: {
      reader: "readTimeTag",
      writer: "writeTimeTag"
    },
    T: {
      reader: "readTrue"
    },
    F: {
      reader: "readFalse"
    },
    N: {
      reader: "readNull"
    },
    I: {
      reader: "readImpulse"
    },
    d: {
      reader: "readFloat64",
      writer: "writeFloat64"
    },
    c: {
      reader: "readChar32",
      writer: "writeChar32"
    },
    r: {
      reader: "readColor",
      writer: "writeColor"
    },
    m: {
      reader: "readMIDIBytes",
      writer: "writeMIDIBytes"
    }
    // [] are special cased within read/writeArguments()
  };
  osc.inferTypeForArgument = function(arg) {
    var type = typeof arg;
    switch (type) {
      case "boolean":
        return arg ? "T" : "F";
      case "string":
        return "s";
      case "number":
        return "f";
      case "undefined":
        return "N";
      case "object":
        if (arg === null) {
          return "N";
        } else if (arg instanceof Uint8Array || arg instanceof ArrayBuffer) {
          return "b";
        } else if (typeof arg.high === "number" && typeof arg.low === "number") {
          return "h";
        }
        break;
    }
    throw new Error("Can't infer OSC argument type for value: " + JSON.stringify(arg, null, 2));
  };
  osc.annotateArguments = function(args) {
    var annotated = [];
    for (var i = 0; i < args.length; i++) {
      var arg = args[i], msgArg;
      if (typeof arg === "object" && arg.type && arg.value !== void 0) {
        msgArg = arg;
      } else if (osc.isArray(arg)) {
        msgArg = osc.annotateArguments(arg);
      } else {
        var oscType = osc.inferTypeForArgument(arg);
        msgArg = {
          type: oscType,
          value: arg
        };
      }
      annotated.push(msgArg);
    }
    return annotated;
  };
  ;
})();
var EventEmitter = function() {
};
EventEmitter.prototype.on = function() {
};
EventEmitter.prototype.emit = function() {
};
EventEmitter.prototype.removeListener = function() {
};
(function() {
  "use strict";
  osc.supportsSerial = false;
  osc.firePacketEvents = function(port, packet, timeTag, packetInfo) {
    if (packet.address) {
      port.emit("message", packet, timeTag, packetInfo);
    } else {
      osc.fireBundleEvents(port, packet, timeTag, packetInfo);
    }
  };
  osc.fireBundleEvents = function(port, bundle, timeTag, packetInfo) {
    port.emit("bundle", bundle, timeTag, packetInfo);
    for (var i = 0; i < bundle.packets.length; i++) {
      var packet = bundle.packets[i];
      osc.firePacketEvents(port, packet, bundle.timeTag, packetInfo);
    }
  };
  osc.fireClosedPortSendError = function(port, msg) {
    msg = msg || "Can't send packets on a closed osc.Port object. Please open (or reopen) this Port by calling open().";
    port.emit("error", msg);
  };
  osc.Port = function(options) {
    this.options = options || {};
    this.on("data", this.decodeOSC.bind(this));
  };
  var p = osc.Port.prototype = Object.create(EventEmitter.prototype);
  p.constructor = osc.Port;
  p.send = function(oscPacket) {
    var args = Array.prototype.slice.call(arguments), encoded = this.encodeOSC(oscPacket), buf = osc.nativeBuffer(encoded);
    args[0] = buf;
    this.sendRaw.apply(this, args);
  };
  p.encodeOSC = function(packet) {
    packet = packet.buffer ? packet.buffer : packet;
    var encoded;
    try {
      encoded = osc.writePacket(packet, this.options);
    } catch (err) {
      this.emit("error", err);
    }
    return encoded;
  };
  p.decodeOSC = function(data, packetInfo) {
    data = osc.byteArray(data);
    this.emit("raw", data, packetInfo);
    try {
      var packet = osc.readPacket(data, this.options);
      this.emit("osc", packet, packetInfo);
      osc.firePacketEvents(this, packet, void 0, packetInfo);
    } catch (err) {
      this.emit("error", err);
    }
  };
  osc.SLIPPort = function(options) {
    var that = this;
    var o = this.options = options || {};
    o.useSLIP = o.useSLIP === void 0 ? true : o.useSLIP;
    this.decoder = new slip.Decoder({
      onMessage: this.decodeOSC.bind(this),
      onError: function(err) {
        that.emit("error", err);
      }
    });
    var decodeHandler = o.useSLIP ? this.decodeSLIPData : this.decodeOSC;
    this.on("data", decodeHandler.bind(this));
  };
  p = osc.SLIPPort.prototype = Object.create(osc.Port.prototype);
  p.constructor = osc.SLIPPort;
  p.encodeOSC = function(packet) {
    packet = packet.buffer ? packet.buffer : packet;
    var framed;
    try {
      var encoded = osc.writePacket(packet, this.options);
      framed = slip.encode(encoded);
    } catch (err) {
      this.emit("error", err);
    }
    return framed;
  };
  p.decodeSLIPData = function(data, packetInfo) {
    this.decoder.decode(data, packetInfo);
  };
  osc.relay = function(from, to, eventName, sendFnName, transformFn, sendArgs) {
    eventName = eventName || "message";
    sendFnName = sendFnName || "send";
    transformFn = transformFn || function() {
    };
    sendArgs = sendArgs ? [null].concat(sendArgs) : [];
    var listener = function(data) {
      sendArgs[0] = data;
      data = transformFn(data);
      to[sendFnName].apply(to, sendArgs);
    };
    from.on(eventName, listener);
    return {
      eventName,
      listener
    };
  };
  osc.relayPorts = function(from, to, o) {
    var eventName = o.raw ? "raw" : "osc", sendFnName = o.raw ? "sendRaw" : "send";
    return osc.relay(from, to, eventName, sendFnName, o.transform);
  };
  osc.stopRelaying = function(from, relaySpec) {
    from.removeListener(relaySpec.eventName, relaySpec.listener);
  };
  osc.Relay = function(port1, port2, options) {
    var o = this.options = options || {};
    o.raw = false;
    this.port1 = port1;
    this.port2 = port2;
    this.listen();
  };
  p = osc.Relay.prototype = Object.create(EventEmitter.prototype);
  p.constructor = osc.Relay;
  p.open = function() {
    this.port1.open();
    this.port2.open();
  };
  p.listen = function() {
    if (this.port1Spec && this.port2Spec) {
      this.close();
    }
    this.port1Spec = osc.relayPorts(this.port1, this.port2, this.options);
    this.port2Spec = osc.relayPorts(this.port2, this.port1, this.options);
    var closeListener = this.close.bind(this);
    this.port1.on("close", closeListener);
    this.port2.on("close", closeListener);
  };
  p.close = function() {
    osc.stopRelaying(this.port1, this.port1Spec);
    osc.stopRelaying(this.port2, this.port2Spec);
    this.emit("close", this.port1, this.port2);
  };
})();
(function() {
  "use strict";
  osc.WebSocket = typeof WebSocket !== "undefined" ? WebSocket : void 0;
  osc.WebSocketPort = function(options) {
    osc.Port.call(this, options);
    this.on("open", this.listen.bind(this));
    this.socket = options.socket;
    if (this.socket) {
      if (this.socket.readyState === 1) {
        osc.WebSocketPort.setupSocketForBinary(this.socket);
        this.emit("open", this.socket);
      } else {
        this.open();
      }
    }
  };
  var p = osc.WebSocketPort.prototype = Object.create(osc.Port.prototype);
  p.constructor = osc.WebSocketPort;
  p.open = function() {
    if (!this.socket || this.socket.readyState > 1) {
      this.socket = new osc.WebSocket(this.options.url);
    }
    osc.WebSocketPort.setupSocketForBinary(this.socket);
    var that = this;
    this.socket.onopen = function() {
      that.emit("open", that.socket);
    };
    this.socket.onerror = function(err) {
      that.emit("error", err);
    };
  };
  p.listen = function() {
    var that = this;
    this.socket.onmessage = function(e) {
      that.emit("data", e.data, e);
    };
    this.socket.onclose = function(e) {
      that.emit("close", e);
    };
    that.emit("ready");
  };
  p.sendRaw = function(encoded) {
    if (!this.socket || this.socket.readyState !== 1) {
      osc.fireClosedPortSendError(this);
      return;
    }
    this.socket.send(encoded);
  };
  p.close = function(code, reason) {
    this.socket.close(code, reason);
  };
  osc.WebSocketPort.setupSocketForBinary = function(socket) {
    socket.binaryType = osc.isNode ? "nodebuffer" : "arraybuffer";
  };
})();
var osc_default = osc;
var { readPacket, writePacket, readMessage, writeMessage, readBundle, writeBundle } = osc;

// js/lib/scsynth_osc.js
var ScsynthOSC = class {
  constructor(workerBaseURL = null) {
    this.workerBaseURL = workerBaseURL;
    this.workers = {
      oscOut: null,
      // Scheduler worker (now also writes directly to ring buffer)
      oscIn: null,
      debug: null
    };
    this.callbacks = {
      onRawOSC: null,
      // Raw binary OSC callback
      onParsedOSC: null,
      // Parsed OSC callback
      onDebugMessage: null,
      onError: null,
      onInitialized: null
    };
    this.initialized = false;
    this.sharedBuffer = null;
    this.ringBufferBase = null;
    this.bufferConstants = null;
  }
  /**
   * Initialize all workers with SharedArrayBuffer
   */
  async init(sharedBuffer, ringBufferBase, bufferConstants) {
    if (this.initialized) {
      console.warn("[ScsynthOSC] Already initialized");
      return;
    }
    this.sharedBuffer = sharedBuffer;
    this.ringBufferBase = ringBufferBase;
    this.bufferConstants = bufferConstants;
    try {
      this.workers.oscOut = new Worker(this.workerBaseURL + "osc_out_prescheduler_worker.js", { type: "module" });
      this.workers.oscIn = new Worker(this.workerBaseURL + "osc_in_worker.js", { type: "module" });
      this.workers.debug = new Worker(this.workerBaseURL + "debug_worker.js", { type: "module" });
      this.setupWorkerHandlers();
      const initPromises = [
        this.initWorker(this.workers.oscOut, "OSC SCHEDULER+WRITER"),
        this.initWorker(this.workers.oscIn, "OSC IN"),
        this.initWorker(this.workers.debug, "DEBUG")
      ];
      await Promise.all(initPromises);
      this.workers.oscIn.postMessage({ type: "start" });
      this.workers.debug.postMessage({ type: "start" });
      this.initialized = true;
      if (this.callbacks.onInitialized) {
        this.callbacks.onInitialized();
      }
    } catch (error) {
      console.error("[ScsynthOSC] Initialization failed:", error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      throw error;
    }
  }
  /**
   * Initialize a single worker
   */
  initWorker(worker, name) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${name} worker initialization timeout`));
      }, 5e3);
      const handler = (event) => {
        if (event.data.type === "initialized") {
          clearTimeout(timeout);
          worker.removeEventListener("message", handler);
          resolve();
        }
      };
      worker.addEventListener("message", handler);
      worker.postMessage({
        type: "init",
        sharedBuffer: this.sharedBuffer,
        ringBufferBase: this.ringBufferBase,
        bufferConstants: this.bufferConstants
      });
    });
  }
  /**
   * Set up message handlers for all workers
   */
  setupWorkerHandlers() {
    this.workers.oscIn.onmessage = (event) => {
      const data = event.data;
      switch (data.type) {
        case "messages":
          data.messages.forEach((msg) => {
            if (!msg.oscData) return;
            if (this.callbacks.onRawOSC) {
              this.callbacks.onRawOSC({
                oscData: msg.oscData,
                sequence: msg.sequence
              });
            }
            if (this.callbacks.onParsedOSC) {
              try {
                const options = { metadata: false, unpackSingleArgs: false };
                const decoded = osc_default.readPacket(msg.oscData, options);
                this.callbacks.onParsedOSC(decoded);
              } catch (e) {
                console.error("[ScsynthOSC] Failed to decode OSC message:", e, msg);
              }
            }
          });
          break;
        case "error":
          console.error("[ScsynthOSC] OSC IN error:", data.error);
          if (this.callbacks.onError) {
            this.callbacks.onError(data.error, "oscIn");
          }
          break;
      }
    };
    this.workers.debug.onmessage = (event) => {
      const data = event.data;
      switch (data.type) {
        case "debug":
          if (this.callbacks.onDebugMessage) {
            data.messages.forEach((msg) => {
              this.callbacks.onDebugMessage(msg);
            });
          }
          break;
        case "error":
          console.error("[ScsynthOSC] DEBUG error:", data.error);
          if (this.callbacks.onError) {
            this.callbacks.onError(data.error, "debug");
          }
          break;
      }
    };
    this.workers.oscOut.onmessage = (event) => {
      const data = event.data;
      switch (data.type) {
        case "error":
          console.error("[ScsynthOSC] OSC OUT error:", data.error);
          if (this.callbacks.onError) {
            this.callbacks.onError(data.error, "oscOut");
          }
          break;
      }
    };
  }
  /**
   * Send OSC data (message or bundle)
   * - OSC messages are sent immediately
   * - OSC bundles are scheduled based on audioTimeS (target audio time)
   *
   * @param {Uint8Array} oscData - Binary OSC data (message or bundle)
   * @param {Object} options - Optional metadata (editorId, runTag, audioTimeS, currentTimeS)
   */
  send(oscData, options = {}) {
    if (!this.initialized) {
      console.error("[ScsynthOSC] Not initialized");
      return;
    }
    const { editorId = 0, runTag = "", audioTimeS = null, currentTimeS = null } = options;
    this.workers.oscOut.postMessage({
      type: "send",
      oscData,
      editorId,
      runTag,
      audioTimeS,
      currentTimeS
    });
  }
  /**
   * Send OSC data immediately, ignoring any bundle timestamps
   * - Extracts all messages from bundles
   * - Sends all messages immediately to scsynth
   * - For applications that don't expect server-side scheduling
   *
   * @param {Uint8Array} oscData - Binary OSC data (message or bundle)
   */
  sendImmediate(oscData) {
    if (!this.initialized) {
      console.error("[ScsynthOSC] Not initialized");
      return;
    }
    this.workers.oscOut.postMessage({
      type: "sendImmediate",
      oscData
    });
  }
  /**
   * Cancel scheduled OSC bundles by editor and tag
   */
  cancelEditorTag(editorId, runTag) {
    if (!this.initialized) return;
    this.workers.oscOut.postMessage({
      type: "cancelEditorTag",
      editorId,
      runTag
    });
  }
  /**
   * Cancel all scheduled OSC bundles from an editor
   */
  cancelEditor(editorId) {
    if (!this.initialized) return;
    this.workers.oscOut.postMessage({
      type: "cancelEditor",
      editorId
    });
  }
  /**
   * Cancel all scheduled OSC bundles
   */
  cancelAll() {
    if (!this.initialized) return;
    this.workers.oscOut.postMessage({
      type: "cancelAll"
    });
  }
  /**
   * Clear debug buffer
   */
  clearDebug() {
    if (!this.initialized) return;
    this.workers.debug.postMessage({
      type: "clear"
    });
  }
  /**
   * Set callback for raw binary OSC messages received from scsynth
   */
  onRawOSC(callback) {
    this.callbacks.onRawOSC = callback;
  }
  /**
   * Set callback for parsed OSC messages received from scsynth
   */
  onParsedOSC(callback) {
    this.callbacks.onParsedOSC = callback;
  }
  /**
   * Set callback for debug messages
   */
  onDebugMessage(callback) {
    this.callbacks.onDebugMessage = callback;
  }
  /**
   * Set callback for errors
   */
  onError(callback) {
    this.callbacks.onError = callback;
  }
  /**
   * Set callback for initialization complete
   */
  onInitialized(callback) {
    this.callbacks.onInitialized = callback;
  }
  /**
   * Terminate all workers and cleanup
   */
  terminate() {
    if (this.workers.oscOut) {
      this.workers.oscOut.postMessage({ type: "stop" });
      this.workers.oscOut.terminate();
    }
    if (this.workers.oscIn) {
      this.workers.oscIn.postMessage({ type: "stop" });
      this.workers.oscIn.terminate();
    }
    if (this.workers.debug) {
      this.workers.debug.postMessage({ type: "stop" });
      this.workers.debug.terminate();
    }
    this.workers = {
      oscOut: null,
      oscIn: null,
      debug: null
    };
    this.initialized = false;
    console.log("[ScsynthOSC] All workers terminated");
  }
};

// node_modules/@thi.ng/api/typedarray.js
var GL2TYPE = {
  [
    5120
    /* I8 */
  ]: "i8",
  [
    5121
    /* U8 */
  ]: "u8",
  [
    5122
    /* I16 */
  ]: "i16",
  [
    5123
    /* U16 */
  ]: "u16",
  [
    5124
    /* I32 */
  ]: "i32",
  [
    5125
    /* U32 */
  ]: "u32",
  [
    5126
    /* F32 */
  ]: "f32"
};
var SIZEOF = {
  u8: 1,
  u8c: 1,
  i8: 1,
  u16: 2,
  i16: 2,
  u32: 4,
  i32: 4,
  i64: 8,
  u64: 8,
  f32: 4,
  f64: 8
};
var FLOAT_ARRAY_CTORS = {
  f32: Float32Array,
  f64: Float64Array
};
var INT_ARRAY_CTORS = {
  i8: Int8Array,
  i16: Int16Array,
  i32: Int32Array
};
var UINT_ARRAY_CTORS = {
  u8: Uint8Array,
  u8c: Uint8ClampedArray,
  u16: Uint16Array,
  u32: Uint32Array
};
var BIGINT_ARRAY_CTORS = {
  i64: BigInt64Array,
  u64: BigUint64Array
};
var TYPEDARRAY_CTORS = {
  ...FLOAT_ARRAY_CTORS,
  ...INT_ARRAY_CTORS,
  ...UINT_ARRAY_CTORS
};
var asNativeType = (type) => {
  const t = GL2TYPE[type];
  return t !== void 0 ? t : type;
};
function typedArray(type, ...args) {
  const ctor = BIGINT_ARRAY_CTORS[type];
  return new (ctor || TYPEDARRAY_CTORS[asNativeType(type)])(...args);
}

// node_modules/@thi.ng/binary/align.js
var align = (addr, size) => (size--, addr + size & ~size);

// node_modules/@thi.ng/checks/is-number.js
var isNumber = (x) => typeof x === "number";

// node_modules/@thi.ng/errors/deferror.js
var defError = (prefix, suffix = (msg) => msg !== void 0 ? ": " + msg : "") => class extends Error {
  origMessage;
  constructor(msg) {
    super(prefix(msg) + suffix(msg));
    this.origMessage = msg !== void 0 ? String(msg) : "";
  }
};

// node_modules/@thi.ng/errors/assert.js
var AssertionError = defError(() => "Assertion failed");
var assert = (typeof process !== "undefined" && process.env !== void 0 ? true : import.meta.env ? import.meta.env.MODE !== "production" || !!import.meta.env.UMBRELLA_ASSERTS || !!import.meta.env.VITE_UMBRELLA_ASSERTS : true) ? (test, msg) => {
  if (typeof test === "function" && !test() || !test) {
    throw new AssertionError(
      typeof msg === "function" ? msg() : msg
    );
  }
} : () => {
};

// node_modules/@thi.ng/errors/illegal-arguments.js
var IllegalArgumentError = defError(() => "illegal argument(s)");
var illegalArgs = (msg) => {
  throw new IllegalArgumentError(msg);
};

// node_modules/@thi.ng/malloc/pool.js
var STATE_FREE = 0;
var STATE_USED = 1;
var STATE_TOP = 2;
var STATE_END = 3;
var STATE_ALIGN = 4;
var STATE_FLAGS = 5;
var STATE_MIN_SPLIT = 6;
var MASK_COMPACT = 1;
var MASK_SPLIT = 2;
var SIZEOF_STATE = 7 * 4;
var MEM_BLOCK_SIZE = 0;
var MEM_BLOCK_NEXT = 1;
var SIZEOF_MEM_BLOCK = 2 * 4;
var MemPool = class {
  buf;
  start;
  u8;
  u32;
  state;
  constructor(opts = {}) {
    this.buf = opts.buf ? opts.buf : new ArrayBuffer(opts.size || 4096);
    this.start = opts.start != null ? align(Math.max(opts.start, 0), 4) : 0;
    this.u8 = new Uint8Array(this.buf);
    this.u32 = new Uint32Array(this.buf);
    this.state = new Uint32Array(this.buf, this.start, SIZEOF_STATE / 4);
    if (!opts.skipInitialization) {
      const _align = opts.align || 8;
      assert(
        _align >= 8,
        `invalid alignment: ${_align}, must be a pow2 and >= 8`
      );
      const top = this.initialTop(_align);
      const resolvedEnd = opts.end != null ? Math.min(opts.end, this.buf.byteLength) : this.buf.byteLength;
      if (top >= resolvedEnd) {
        illegalArgs(
          `insufficient address range (0x${this.start.toString(
            16
          )} - 0x${resolvedEnd.toString(16)})`
        );
      }
      this.align = _align;
      this.doCompact = opts.compact !== false;
      this.doSplit = opts.split !== false;
      this.minSplit = opts.minSplit || 16;
      this.end = resolvedEnd;
      this.top = top;
      this._free = 0;
      this._used = 0;
    }
  }
  stats() {
    const listStats = (block) => {
      let count = 0;
      let size = 0;
      while (block) {
        count++;
        size += this.blockSize(block);
        block = this.blockNext(block);
      }
      return { count, size };
    };
    const free = listStats(this._free);
    return {
      free,
      used: listStats(this._used),
      top: this.top,
      available: this.end - this.top + free.size,
      total: this.buf.byteLength
    };
  }
  callocAs(type, num, fill = 0) {
    const block = this.mallocAs(type, num);
    block?.fill(fill);
    return block;
  }
  mallocAs(type, num) {
    const addr = this.malloc(num * SIZEOF[type]);
    return addr ? typedArray(type, this.buf, addr, num) : void 0;
  }
  calloc(bytes, fill = 0) {
    const addr = this.malloc(bytes);
    addr && this.u8.fill(fill, addr, addr + bytes);
    return addr;
  }
  malloc(bytes) {
    if (bytes <= 0) {
      return 0;
    }
    const paddedSize = align(bytes + SIZEOF_MEM_BLOCK, this.align);
    const end = this.end;
    let top = this.top;
    let block = this._free;
    let prev = 0;
    while (block) {
      const blockSize = this.blockSize(block);
      const isTop = block + blockSize >= top;
      if (isTop || blockSize >= paddedSize) {
        return this.mallocTop(
          block,
          prev,
          blockSize,
          paddedSize,
          isTop
        );
      }
      prev = block;
      block = this.blockNext(block);
    }
    block = top;
    top = block + paddedSize;
    if (top <= end) {
      this.initBlock(block, paddedSize, this._used);
      this._used = block;
      this.top = top;
      return __blockDataAddress(block);
    }
    return 0;
  }
  mallocTop(block, prev, blockSize, paddedSize, isTop) {
    if (isTop && block + paddedSize > this.end) return 0;
    if (prev) {
      this.unlinkBlock(prev, block);
    } else {
      this._free = this.blockNext(block);
    }
    this.setBlockNext(block, this._used);
    this._used = block;
    if (isTop) {
      this.top = block + this.setBlockSize(block, paddedSize);
    } else if (this.doSplit) {
      const excess = blockSize - paddedSize;
      excess >= this.minSplit && this.splitBlock(block, paddedSize, excess);
    }
    return __blockDataAddress(block);
  }
  realloc(ptr, bytes) {
    if (bytes <= 0) {
      return 0;
    }
    const oldAddr = __blockSelfAddress(ptr);
    let newAddr = 0;
    let block = this._used;
    let blockEnd = 0;
    while (block) {
      if (block === oldAddr) {
        [newAddr, blockEnd] = this.reallocBlock(block, bytes);
        break;
      }
      block = this.blockNext(block);
    }
    if (newAddr && newAddr !== oldAddr) {
      this.u8.copyWithin(
        __blockDataAddress(newAddr),
        __blockDataAddress(oldAddr),
        blockEnd
      );
    }
    return __blockDataAddress(newAddr);
  }
  reallocBlock(block, bytes) {
    const blockSize = this.blockSize(block);
    const blockEnd = block + blockSize;
    const isTop = blockEnd >= this.top;
    const paddedSize = align(bytes + SIZEOF_MEM_BLOCK, this.align);
    if (paddedSize <= blockSize) {
      if (this.doSplit) {
        const excess = blockSize - paddedSize;
        if (excess >= this.minSplit) {
          this.splitBlock(block, paddedSize, excess);
        } else if (isTop) {
          this.top = block + paddedSize;
        }
      } else if (isTop) {
        this.top = block + paddedSize;
      }
      return [block, blockEnd];
    }
    if (isTop && block + paddedSize < this.end) {
      this.top = block + this.setBlockSize(block, paddedSize);
      return [block, blockEnd];
    }
    this.free(block);
    return [__blockSelfAddress(this.malloc(bytes)), blockEnd];
  }
  reallocArray(array, num) {
    if (array.buffer !== this.buf) {
      return;
    }
    const addr = this.realloc(
      array.byteOffset,
      num * array.BYTES_PER_ELEMENT
    );
    return addr ? new array.constructor(this.buf, addr, num) : void 0;
  }
  free(ptrOrArray) {
    let addr;
    if (!isNumber(ptrOrArray)) {
      if (ptrOrArray.buffer !== this.buf) {
        return false;
      }
      addr = ptrOrArray.byteOffset;
    } else {
      addr = ptrOrArray;
    }
    addr = __blockSelfAddress(addr);
    let block = this._used;
    let prev = 0;
    while (block) {
      if (block === addr) {
        if (prev) {
          this.unlinkBlock(prev, block);
        } else {
          this._used = this.blockNext(block);
        }
        this.insert(block);
        this.doCompact && this.compact();
        return true;
      }
      prev = block;
      block = this.blockNext(block);
    }
    return false;
  }
  freeAll() {
    this._free = 0;
    this._used = 0;
    this.top = this.initialTop();
  }
  release() {
    delete this.u8;
    delete this.u32;
    delete this.state;
    delete this.buf;
    return true;
  }
  get align() {
    return this.state[STATE_ALIGN];
  }
  set align(x) {
    this.state[STATE_ALIGN] = x;
  }
  get end() {
    return this.state[STATE_END];
  }
  set end(x) {
    this.state[STATE_END] = x;
  }
  get top() {
    return this.state[STATE_TOP];
  }
  set top(x) {
    this.state[STATE_TOP] = x;
  }
  get _free() {
    return this.state[STATE_FREE];
  }
  set _free(block) {
    this.state[STATE_FREE] = block;
  }
  get _used() {
    return this.state[STATE_USED];
  }
  set _used(block) {
    this.state[STATE_USED] = block;
  }
  get doCompact() {
    return !!(this.state[STATE_FLAGS] & MASK_COMPACT);
  }
  set doCompact(flag) {
    flag ? this.state[STATE_FLAGS] |= 1 << MASK_COMPACT - 1 : this.state[STATE_FLAGS] &= ~MASK_COMPACT;
  }
  get doSplit() {
    return !!(this.state[STATE_FLAGS] & MASK_SPLIT);
  }
  set doSplit(flag) {
    flag ? this.state[STATE_FLAGS] |= 1 << MASK_SPLIT - 1 : this.state[STATE_FLAGS] &= ~MASK_SPLIT;
  }
  get minSplit() {
    return this.state[STATE_MIN_SPLIT];
  }
  set minSplit(x) {
    assert(
      x > SIZEOF_MEM_BLOCK,
      `illegal min split threshold: ${x}, require at least ${SIZEOF_MEM_BLOCK + 1}`
    );
    this.state[STATE_MIN_SPLIT] = x;
  }
  blockSize(block) {
    return this.u32[(block >> 2) + MEM_BLOCK_SIZE];
  }
  /**
   * Sets & returns given block size.
   *
   * @param block -
   * @param size -
   */
  setBlockSize(block, size) {
    this.u32[(block >> 2) + MEM_BLOCK_SIZE] = size;
    return size;
  }
  blockNext(block) {
    return this.u32[(block >> 2) + MEM_BLOCK_NEXT];
  }
  /**
   * Sets block next pointer to `next`. Use zero to indicate list end.
   *
   * @param block -
   */
  setBlockNext(block, next) {
    this.u32[(block >> 2) + MEM_BLOCK_NEXT] = next;
  }
  /**
   * Initializes block header with given `size` and `next` pointer. Returns `block`.
   *
   * @param block -
   * @param size -
   * @param next -
   */
  initBlock(block, size, next) {
    const idx = block >>> 2;
    this.u32[idx + MEM_BLOCK_SIZE] = size;
    this.u32[idx + MEM_BLOCK_NEXT] = next;
    return block;
  }
  unlinkBlock(prev, block) {
    this.setBlockNext(prev, this.blockNext(block));
  }
  splitBlock(block, blockSize, excess) {
    this.insert(
      this.initBlock(
        block + this.setBlockSize(block, blockSize),
        excess,
        0
      )
    );
    this.doCompact && this.compact();
  }
  initialTop(_align = this.align) {
    return align(this.start + SIZEOF_STATE + SIZEOF_MEM_BLOCK, _align) - SIZEOF_MEM_BLOCK;
  }
  /**
   * Traverses free list and attempts to recursively merge blocks
   * occupying consecutive memory regions. Returns true if any blocks
   * have been merged. Only called if `compact` option is enabled.
   */
  compact() {
    let block = this._free;
    let prev = 0;
    let scan = 0;
    let scanPrev;
    let res = false;
    while (block) {
      scanPrev = block;
      scan = this.blockNext(block);
      while (scan && scanPrev + this.blockSize(scanPrev) === scan) {
        scanPrev = scan;
        scan = this.blockNext(scan);
      }
      if (scanPrev !== block) {
        const newSize = scanPrev - block + this.blockSize(scanPrev);
        this.setBlockSize(block, newSize);
        const next = this.blockNext(scanPrev);
        let tmp = this.blockNext(block);
        while (tmp && tmp !== next) {
          const tn = this.blockNext(tmp);
          this.setBlockNext(tmp, 0);
          tmp = tn;
        }
        this.setBlockNext(block, next);
        res = true;
      }
      if (block + this.blockSize(block) >= this.top) {
        this.top = block;
        prev ? this.unlinkBlock(prev, block) : this._free = this.blockNext(block);
      }
      prev = block;
      block = this.blockNext(block);
    }
    return res;
  }
  /**
   * Inserts given block into list of free blocks, sorted by address.
   *
   * @param block -
   */
  insert(block) {
    let ptr = this._free;
    let prev = 0;
    while (ptr) {
      if (block <= ptr) break;
      prev = ptr;
      ptr = this.blockNext(ptr);
    }
    if (prev) {
      this.setBlockNext(prev, block);
    } else {
      this._free = block;
    }
    this.setBlockNext(block, ptr);
  }
};
var __blockDataAddress = (blockAddress) => blockAddress > 0 ? blockAddress + SIZEOF_MEM_BLOCK : 0;
var __blockSelfAddress = (dataAddress) => dataAddress > 0 ? dataAddress - SIZEOF_MEM_BLOCK : 0;

// js/lib/buffer_manager.js
var BUFFER_POOL_ALIGNMENT = 8;
var BufferManager = class {
  // Private configuration
  #sampleBaseURL;
  #audioPathMap;
  // Private implementation
  #audioContext;
  #sharedBuffer;
  #bufferPool;
  #allocatedBuffers;
  #pendingBufferOps;
  #bufferLocks;
  constructor(options) {
    const {
      audioContext,
      sharedBuffer,
      bufferPoolConfig,
      sampleBaseURL,
      audioPathMap = {},
      maxBuffers = 1024
    } = options;
    if (!audioContext) {
      throw new Error("BufferManager requires audioContext");
    }
    if (!sharedBuffer || !(sharedBuffer instanceof SharedArrayBuffer)) {
      throw new Error("BufferManager requires sharedBuffer (SharedArrayBuffer)");
    }
    if (!bufferPoolConfig || typeof bufferPoolConfig !== "object") {
      throw new Error("BufferManager requires bufferPoolConfig (object with start, size, align)");
    }
    if (!Number.isFinite(bufferPoolConfig.start) || bufferPoolConfig.start < 0) {
      throw new Error("bufferPoolConfig.start must be a non-negative number");
    }
    if (!Number.isFinite(bufferPoolConfig.size) || bufferPoolConfig.size <= 0) {
      throw new Error("bufferPoolConfig.size must be a positive number");
    }
    if (audioPathMap && typeof audioPathMap !== "object") {
      throw new Error("audioPathMap must be an object");
    }
    if (!Number.isInteger(maxBuffers) || maxBuffers <= 0) {
      throw new Error("maxBuffers must be a positive integer");
    }
    this.#audioContext = audioContext;
    this.#sharedBuffer = sharedBuffer;
    this.#sampleBaseURL = sampleBaseURL;
    this.#audioPathMap = audioPathMap;
    this.#bufferPool = new MemPool({
      buf: sharedBuffer,
      start: bufferPoolConfig.start,
      size: bufferPoolConfig.size,
      align: BUFFER_POOL_ALIGNMENT
    });
    this.#allocatedBuffers = /* @__PURE__ */ new Map();
    this.#pendingBufferOps = /* @__PURE__ */ new Map();
    this.#bufferLocks = /* @__PURE__ */ new Map();
    this.GUARD_BEFORE = 3;
    this.GUARD_AFTER = 1;
    this.MAX_BUFFERS = maxBuffers;
    const poolSizeMB = (bufferPoolConfig.size / (1024 * 1024)).toFixed(0);
    const poolOffsetMB = (bufferPoolConfig.start / (1024 * 1024)).toFixed(0);
    console.log(`[BufferManager] Initialized: ${poolSizeMB}MB pool at offset ${poolOffsetMB}MB`);
  }
  #resolveAudioPath(scPath) {
    if (typeof scPath !== "string" || scPath.length === 0) {
      throw new Error(`Invalid audio path: must be a non-empty string`);
    }
    if (scPath.includes("..")) {
      throw new Error(`Invalid audio path: path cannot contain '..' (got: ${scPath})`);
    }
    if (scPath.startsWith("/") || /^[a-zA-Z]:/.test(scPath)) {
      throw new Error(`Invalid audio path: path must be relative (got: ${scPath})`);
    }
    if (scPath.includes("%2e") || scPath.includes("%2E")) {
      throw new Error(`Invalid audio path: path cannot contain URL-encoded characters (got: ${scPath})`);
    }
    if (scPath.includes("\\")) {
      throw new Error(`Invalid audio path: use forward slashes only (got: ${scPath})`);
    }
    if (this.#audioPathMap[scPath]) {
      return this.#audioPathMap[scPath];
    }
    if (!this.#sampleBaseURL) {
      throw new Error(
        'sampleBaseURL not configured. Please set it in SuperSonic constructor options.\nExample: new SuperSonic({ sampleBaseURL: "./dist/samples/" })\nOr use CDN: new SuperSonic({ sampleBaseURL: "https://unpkg.com/supersonic-scsynth-samples@latest/samples/" })\nOr install: npm install supersonic-scsynth-samples'
      );
    }
    return this.#sampleBaseURL + scPath;
  }
  #validateBufferNumber(bufnum) {
    if (!Number.isInteger(bufnum) || bufnum < 0 || bufnum >= this.MAX_BUFFERS) {
      throw new Error(`Invalid buffer number ${bufnum} (must be 0-${this.MAX_BUFFERS - 1})`);
    }
  }
  /**
   * Execute a buffer operation with proper locking, registration, and cleanup
   * @private
   * @param {number} bufnum - Buffer number
   * @param {number} timeoutMs - Operation timeout
   * @param {Function} operation - Async function that performs the actual buffer work
   *                                Should return {ptr, sizeBytes, ...extraProps}
   * @returns {Promise<Object>} Result object with ptr, uuid, allocationComplete, and extra props
   */
  async #executeBufferOperation(bufnum, timeoutMs, operation) {
    let allocatedPtr = null;
    let pendingToken = null;
    let allocationRegistered = false;
    const releaseLock = await this.#acquireBufferLock(bufnum);
    let lockReleased = false;
    try {
      await this.#awaitPendingReplacement(bufnum);
      const { ptr, sizeBytes, ...extraProps } = await operation();
      allocatedPtr = ptr;
      const { uuid, allocationComplete } = this.#registerPending(bufnum, timeoutMs);
      pendingToken = uuid;
      this.#recordAllocation(bufnum, allocatedPtr, sizeBytes, uuid, allocationComplete);
      allocationRegistered = true;
      const managedCompletion = this.#attachFinalizer(bufnum, uuid, allocationComplete);
      releaseLock();
      lockReleased = true;
      return {
        ptr: allocatedPtr,
        uuid,
        allocationComplete: managedCompletion,
        ...extraProps
      };
    } catch (error) {
      if (allocationRegistered && pendingToken) {
        this.#finalizeReplacement(bufnum, pendingToken, false);
      } else if (allocatedPtr) {
        this.#bufferPool.free(allocatedPtr);
      }
      throw error;
    } finally {
      if (!lockReleased) {
        releaseLock();
      }
    }
  }
  async prepareFromFile(params) {
    const {
      bufnum,
      path,
      startFrame = 0,
      numFrames = 0,
      channels = null
    } = params;
    this.#validateBufferNumber(bufnum);
    return this.#executeBufferOperation(bufnum, 6e4, async () => {
      const resolvedPath = this.#resolveAudioPath(path);
      const response = await fetch(resolvedPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${resolvedPath}: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.#audioContext.decodeAudioData(arrayBuffer);
      const start = Math.max(0, Math.floor(startFrame || 0));
      const availableFrames = audioBuffer.length - start;
      const framesRequested = numFrames && numFrames > 0 ? Math.min(Math.floor(numFrames), availableFrames) : availableFrames;
      if (framesRequested <= 0) {
        throw new Error(`No audio frames available for buffer ${bufnum} from ${path}`);
      }
      const selectedChannels = this.#normalizeChannels(channels, audioBuffer.numberOfChannels);
      const numChannels = selectedChannels.length;
      const totalSamples = framesRequested * numChannels + (this.GUARD_BEFORE + this.GUARD_AFTER) * numChannels;
      const ptr = this.#malloc(totalSamples);
      const interleaved = new Float32Array(totalSamples);
      const dataOffset = this.GUARD_BEFORE * numChannels;
      for (let frame = 0; frame < framesRequested; frame++) {
        for (let ch = 0; ch < numChannels; ch++) {
          const sourceChannel = selectedChannels[ch];
          const channelData = audioBuffer.getChannelData(sourceChannel);
          interleaved[dataOffset + frame * numChannels + ch] = channelData[start + frame];
        }
      }
      this.#writeToSharedBuffer(ptr, interleaved);
      const sizeBytes = interleaved.length * 4;
      return {
        ptr,
        sizeBytes,
        numFrames: framesRequested,
        numChannels,
        sampleRate: audioBuffer.sampleRate
      };
    });
  }
  async prepareEmpty(params) {
    const {
      bufnum,
      numFrames,
      numChannels = 1,
      sampleRate = null
    } = params;
    this.#validateBufferNumber(bufnum);
    if (!Number.isFinite(numFrames) || numFrames <= 0) {
      throw new Error(`/b_alloc requires a positive number of frames (got ${numFrames})`);
    }
    if (!Number.isFinite(numChannels) || numChannels <= 0) {
      throw new Error(`/b_alloc requires a positive channel count (got ${numChannels})`);
    }
    const roundedFrames = Math.floor(numFrames);
    const roundedChannels = Math.floor(numChannels);
    return this.#executeBufferOperation(bufnum, 5e3, async () => {
      const totalSamples = roundedFrames * roundedChannels + (this.GUARD_BEFORE + this.GUARD_AFTER) * roundedChannels;
      const ptr = this.#malloc(totalSamples);
      const interleaved = new Float32Array(totalSamples);
      this.#writeToSharedBuffer(ptr, interleaved);
      const sizeBytes = interleaved.length * 4;
      return {
        ptr,
        sizeBytes,
        numFrames: roundedFrames,
        numChannels: roundedChannels,
        sampleRate: sampleRate || this.#audioContext.sampleRate
      };
    });
  }
  #normalizeChannels(requestedChannels, fileChannels) {
    if (!requestedChannels || requestedChannels.length === 0) {
      return Array.from({ length: fileChannels }, (_, i) => i);
    }
    requestedChannels.forEach((channel) => {
      if (!Number.isInteger(channel) || channel < 0 || channel >= fileChannels) {
        throw new Error(`Channel ${channel} is out of range (file has ${fileChannels} channels)`);
      }
    });
    return requestedChannels;
  }
  #malloc(totalSamples) {
    const bytesNeeded = totalSamples * 4;
    const ptr = this.#bufferPool.malloc(bytesNeeded);
    if (ptr === 0) {
      const stats = this.#bufferPool.stats();
      const availableMB = ((stats.available || 0) / (1024 * 1024)).toFixed(2);
      const totalMB = ((stats.total || 0) / (1024 * 1024)).toFixed(2);
      const requestedMB = (bytesNeeded / (1024 * 1024)).toFixed(2);
      throw new Error(
        `Buffer pool allocation failed: requested ${requestedMB}MB, available ${availableMB}MB of ${totalMB}MB total`
      );
    }
    return ptr;
  }
  #writeToSharedBuffer(ptr, data) {
    const heap = new Float32Array(this.#sharedBuffer, ptr, data.length);
    heap.set(data);
  }
  #createPendingOperation(uuid, bufnum, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.#pendingBufferOps.delete(uuid);
        reject(new Error(`Buffer ${bufnum} allocation timeout (${timeoutMs}ms)`));
      }, timeoutMs);
      this.#pendingBufferOps.set(uuid, { resolve, reject, timeout });
    });
  }
  #registerPending(bufnum, timeoutMs) {
    const uuid = crypto.randomUUID();
    const allocationComplete = this.#createPendingOperation(uuid, bufnum, timeoutMs);
    return { uuid, allocationComplete };
  }
  async #acquireBufferLock(bufnum) {
    const prev = this.#bufferLocks.get(bufnum) || Promise.resolve();
    let releaseLock;
    const current = new Promise((resolve) => {
      releaseLock = resolve;
    });
    this.#bufferLocks.set(bufnum, prev.then(() => current));
    await prev;
    return () => {
      if (releaseLock) {
        releaseLock();
        releaseLock = null;
      }
      if (this.#bufferLocks.get(bufnum) === current) {
        this.#bufferLocks.delete(bufnum);
      }
    };
  }
  #recordAllocation(bufnum, ptr, sizeBytes, pendingToken, pendingPromise) {
    const previousEntry = this.#allocatedBuffers.get(bufnum);
    const entry = {
      ptr,
      size: sizeBytes,
      pendingToken,
      pendingPromise,
      previousAllocation: previousEntry ? { ptr: previousEntry.ptr, size: previousEntry.size } : null
    };
    this.#allocatedBuffers.set(bufnum, entry);
    return entry;
  }
  async #awaitPendingReplacement(bufnum) {
    const existing = this.#allocatedBuffers.get(bufnum);
    if (existing && existing.pendingToken && existing.pendingPromise) {
      try {
        await existing.pendingPromise;
      } catch {
      }
    }
  }
  #attachFinalizer(bufnum, pendingToken, promise) {
    if (!promise || typeof promise.then !== "function") {
      this.#finalizeReplacement(bufnum, pendingToken, true);
      return Promise.resolve();
    }
    return promise.then((value) => {
      this.#finalizeReplacement(bufnum, pendingToken, true);
      return value;
    }).catch((error) => {
      this.#finalizeReplacement(bufnum, pendingToken, false);
      throw error;
    });
  }
  #finalizeReplacement(bufnum, pendingToken, success) {
    const entry = this.#allocatedBuffers.get(bufnum);
    if (!entry || entry.pendingToken !== pendingToken) {
      return;
    }
    const previous = entry.previousAllocation;
    if (success) {
      entry.pendingToken = null;
      entry.pendingPromise = null;
      entry.previousAllocation = null;
      if (previous?.ptr) {
        this.#bufferPool.free(previous.ptr);
      }
      return;
    }
    if (entry.ptr) {
      this.#bufferPool.free(entry.ptr);
    }
    entry.pendingPromise = null;
    if (previous?.ptr) {
      this.#allocatedBuffers.set(bufnum, {
        ptr: previous.ptr,
        size: previous.size,
        pendingToken: null,
        previousAllocation: null
      });
    } else {
      this.#allocatedBuffers.delete(bufnum);
    }
  }
  /**
   * Handle /buffer/freed notification from scsynth
   * Called by SuperSonic when /buffer/freed OSC message is received
   * @param {Array} args - [bufnum, freedPtr]
   */
  handleBufferFreed(args) {
    const bufnum = args[0];
    const freedPtr = args[1];
    const bufferInfo = this.#allocatedBuffers.get(bufnum);
    if (!bufferInfo) {
      if (typeof freedPtr === "number" && freedPtr !== 0) {
        this.#bufferPool.free(freedPtr);
      }
      return;
    }
    if (typeof freedPtr === "number" && freedPtr === bufferInfo.ptr) {
      this.#bufferPool.free(bufferInfo.ptr);
      this.#allocatedBuffers.delete(bufnum);
      return;
    }
    if (typeof freedPtr === "number" && bufferInfo.previousAllocation && bufferInfo.previousAllocation.ptr === freedPtr) {
      this.#bufferPool.free(freedPtr);
      bufferInfo.previousAllocation = null;
      return;
    }
    this.#bufferPool.free(bufferInfo.ptr);
    this.#allocatedBuffers.delete(bufnum);
  }
  /**
   * Handle /buffer/allocated notification from scsynth
   * Called by SuperSonic when /buffer/allocated OSC message is received
   * @param {Array} args - [uuid, bufnum]
   */
  handleBufferAllocated(args) {
    const uuid = args[0];
    const bufnum = args[1];
    const pending = this.#pendingBufferOps.get(uuid);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve({ bufnum });
      this.#pendingBufferOps.delete(uuid);
    }
  }
  /**
   * Allocate raw buffer memory
   * @param {number} numSamples - Number of Float32 samples
   * @returns {number} Byte offset, or 0 if failed
   */
  allocate(numSamples) {
    const sizeBytes = numSamples * 4;
    const addr = this.#bufferPool.malloc(sizeBytes);
    if (addr === 0) {
      const stats = this.#bufferPool.stats();
      const availableMB = ((stats.available || 0) / (1024 * 1024)).toFixed(2);
      const totalMB = ((stats.total || 0) / (1024 * 1024)).toFixed(2);
      const requestedMB = (sizeBytes / (1024 * 1024)).toFixed(2);
      console.error(
        `[BufferManager] Allocation failed: requested ${requestedMB}MB, available ${availableMB}MB of ${totalMB}MB total`
      );
    }
    return addr;
  }
  /**
   * Free previously allocated buffer
   * @param {number} addr - Buffer address
   * @returns {boolean} true if freed successfully
   */
  free(addr) {
    return this.#bufferPool.free(addr);
  }
  /**
   * Get Float32Array view of buffer
   * @param {number} addr - Buffer address
   * @param {number} numSamples - Number of samples
   * @returns {Float32Array} Typed array view
   */
  getView(addr, numSamples) {
    return new Float32Array(this.#sharedBuffer, addr, numSamples);
  }
  /**
   * Get buffer pool statistics
   * @returns {Object} Stats including total, available, used
   */
  getStats() {
    return this.#bufferPool.stats();
  }
  /**
   * Get buffer diagnostics
   * @returns {Object} Buffer state and pool statistics
   */
  getDiagnostics() {
    const poolStats = this.#bufferPool.stats();
    let bytesActive = 0;
    let pendingCount = 0;
    for (const entry of this.#allocatedBuffers.values()) {
      if (!entry) continue;
      bytesActive += entry.size || 0;
      if (entry.pendingToken) {
        pendingCount++;
      }
    }
    return {
      active: this.#allocatedBuffers.size,
      pending: pendingCount,
      bytesActive,
      pool: {
        total: poolStats.total || 0,
        available: poolStats.available || 0,
        freeBytes: poolStats.free?.size || 0,
        freeBlocks: poolStats.free?.count || 0,
        usedBytes: poolStats.used?.size || 0,
        usedBlocks: poolStats.used?.count || 0
      }
    };
  }
  /**
   * Clean up resources
   */
  destroy() {
    for (const [uuid, pending] of this.#pendingBufferOps.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error("BufferManager destroyed"));
    }
    this.#pendingBufferOps.clear();
    for (const [bufnum, entry] of this.#allocatedBuffers.entries()) {
      if (entry.ptr) {
        this.#bufferPool.free(entry.ptr);
      }
    }
    this.#allocatedBuffers.clear();
    this.#bufferLocks.clear();
    console.log("[BufferManager] Destroyed");
  }
};

// js/timing_constants.js
var NTP_EPOCH_OFFSET = 2208988800;
var DRIFT_UPDATE_INTERVAL_MS = 15e3;

// js/memory_layout.js
var MemoryLayout = {
  /**
   * Total WebAssembly memory in pages (1 page = 64KB)
   * Current: 1280 pages = 80MB
   *
   * This value is used by build.sh to set -sINITIAL_MEMORY
   * Must match: totalPages * 65536 = bufferPoolOffset + bufferPoolSize
   */
  totalPages: 1280,
  /**
   * WASM heap size (implicit, first section of memory)
   * Not directly configurable here - defined by bufferPoolOffset - ringBufferReserved
   * Current: 0-16MB (16 * 1024 * 1024 = 16777216 bytes)
   */
  // wasmHeapSize is implicitly: bufferPoolOffset - ringBufferReserved
  /**
   * Ring buffer reserved space (between WASM heap and buffer pool)
   * Actual ring buffer usage: IN: 768KB, OUT: 128KB, DEBUG: 64KB = 960KB
   * Plus control structures: CONTROL_SIZE (40B) + METRICS_SIZE (48B) + NTP_START_TIME_SIZE (8B) ≈ 96B
   * Total actual usage: ~960KB
   * Reserved: 1MB (provides ~64KB headroom for alignment and future expansion)
   * Current: 1MB reserved (starts where WASM heap ends at 16MB)
   */
  ringBufferReserved: 1 * 1024 * 1024,
  // 1MB reserved
  /**
   * Buffer pool byte offset from start of SharedArrayBuffer
   * Audio samples are allocated from this pool using @thi.ng/malloc
   * Must be after WASM heap + ring buffer area
   * Current: 17MB offset = after 16MB heap + 1MB ring buffers
   */
  bufferPoolOffset: 17 * 1024 * 1024,
  // 17825792 bytes
  /**
   * Buffer pool size in bytes
   * Used for audio sample storage (loaded files + allocated buffers)
   * Current: 63MB (enough for ~3.5 minutes of stereo at 48kHz uncompressed)
   */
  bufferPoolSize: 63 * 1024 * 1024,
  // 66060288 bytes
  /**
   * Total memory calculation (should equal totalPages * 65536)
   * wasmHeap (16MB) + ringReserve (1MB) + bufferPool (63MB) = 80MB
   */
  get totalMemory() {
    return this.bufferPoolOffset + this.bufferPoolSize;
  },
  /**
   * Effective WASM heap size (derived)
   * This is the space available for scsynth C++ allocations
   */
  get wasmHeapSize() {
    return this.bufferPoolOffset - this.ringBufferReserved;
  }
};

// js/scsynth_options.js
var defaultWorldOptions = {
  /**
   * Maximum number of audio buffers (SndBuf slots)
   * Each buffer slot: 104 bytes overhead (2x SndBuf + SndBufUpdates structs)
   * Actual audio data is stored in buffer pool (separate from heap)
   * Default: 1024 (matching SuperCollider default)
   * Range: 1-65535 (limited by practical memory constraints)
   */
  numBuffers: 1024,
  /**
   * Maximum number of synthesis nodes (synths + groups)
   * Each node: ~200-500 bytes depending on synth complexity
   * Default: 1024 (matching SuperCollider default)
   */
  maxNodes: 1024,
  /**
   * Maximum number of synth definitions (SynthDef count)
   * Each definition: variable size (typically 1-10KB)
   * Default: 1024 (matching SuperCollider default)
   */
  maxGraphDefs: 1024,
  /**
   * Maximum wire buffers for internal audio routing
   * Wire buffers: temporary buffers for UGen connections
   * Each: bufLength * 8 bytes (128 samples * 8 = 1024 bytes)
   * Default: 64 (matching SuperCollider default)
   */
  maxWireBufs: 64,
  /**
   * Number of audio bus channels
   * Audio buses: real-time audio routing between synths
   * Memory: bufLength * numChannels * 4 bytes (128 * 128 * 4 = 64KB)
   * Default: 128 (SuperSonic default, SC uses 1024)
   */
  numAudioBusChannels: 128,
  /**
   * Number of input bus channels (hardware audio input)
   * AudioWorklet can support input, but SuperSonic doesn't currently route it
   * Default: 0 (audio input not implemented)
   */
  numInputBusChannels: 0,
  /**
   * Number of output bus channels (hardware audio output)
   * WebAudio/AudioWorklet output
   * Default: 2 (stereo)
   */
  numOutputBusChannels: 2,
  /**
   * Number of control bus channels
   * Control buses: control-rate data sharing between synths
   * Memory: numChannels * 4 bytes (4096 * 4 = 16KB)
   * Default: 4096 (SuperSonic default, SC uses 16384)
   */
  numControlBusChannels: 4096,
  /**
   * Audio buffer length in samples (AudioWorklet quantum)
   *
   * FIXED at 128 (WebAudio API spec - cannot be changed)
   * Unlike SuperCollider (configurable 32/64/128), AudioWorklet has a fixed quantum.
   * Overriding this value will cause initialization to fail.
   *
   * Default: 128
   */
  bufLength: 128,
  /**
   * Real-time memory pool size in kilobytes
   * AllocPool for synthesis-time allocations (UGen memory, etc.)
   * This is the largest single allocation from WASM heap
   * Memory: realTimeMemorySize * 1024 bytes (8192 * 1024 = 8MB)
   * Default: 8192 KB (8MB, matching Sonic Pi and SuperCollider defaults)
   */
  realTimeMemorySize: 8192,
  /**
   * Number of random number generators
   * Each synth can have its own RNG for reproducible randomness
   * Default: 64 (matching SuperCollider default)
   */
  numRGens: 64,
  /**
   * Clock source mode
   * false = Externally clocked (driven by AudioWorklet process() callback)
   * true = Internally clocked (not applicable in WebAudio context)
   * Note: In SC terminology, this is "NRT mode" but we're still doing real-time audio
   * Default: false (SuperSonic is always externally clocked by AudioWorklet)
   */
  realTime: false,
  /**
   * Memory locking (mlock)
   * Not applicable in WebAssembly/browser environment
   * Default: false
   */
  memoryLocking: false,
  /**
   * Auto-load SynthDefs from disk
   * 0 = don't auto-load (synths sent via /d_recv)
   * 1 = auto-load from plugin path
   * Default: 0 (SuperSonic loads synthdefs via network)
   */
  loadGraphDefs: 0,
  /**
   * Preferred sample rate (if not specified, uses AudioContext.sampleRate)
   * Common values: 44100, 48000, 96000
   * Default: 0 (use AudioContext default, typically 48000)
   */
  preferredSampleRate: 0,
  /**
   * Debug verbosity level
   * 0 = quiet, 1 = errors, 2 = warnings, 3 = info, 4 = debug
   * Default: 0
   */
  verbosity: 0
};

// js/supersonic.js
var SuperSonic = class _SuperSonic {
  // Expose OSC utilities as static methods
  static osc = {
    encode: (message) => osc_default.writePacket(message),
    decode: (data, options = { metadata: false }) => osc_default.readPacket(data, options)
  };
  // Private implementation
  #audioContext;
  #workletNode;
  #osc;
  #wasmMemory;
  #sharedBuffer;
  #ringBufferBase;
  #bufferConstants;
  #bufferManager;
  #driftOffsetTimer;
  #syncListeners;
  #initialNTPStartTime;
  #sampleBaseURL;
  #synthdefBaseURL;
  #audioPathMap;
  #initialized;
  #initializing;
  #capabilities;
  // Runtime metrics (private counters)
  #metrics_messagesSent = 0;
  #metrics_messagesReceived = 0;
  #metrics_errors = 0;
  #metricsIntervalId = null;
  #metricsGatherInProgress = false;
  constructor(options = {}) {
    this.#initialized = false;
    this.#initializing = false;
    this.#capabilities = {};
    this.#sharedBuffer = null;
    this.#ringBufferBase = null;
    this.#bufferConstants = null;
    this.#audioContext = null;
    this.#workletNode = null;
    this.#osc = null;
    this.#bufferManager = null;
    this.loadedSynthDefs = /* @__PURE__ */ new Set();
    this.onOSC = null;
    this.onMessage = null;
    this.onMessageSent = null;
    this.onMetricsUpdate = null;
    this.onDebugMessage = null;
    this.onInitialized = null;
    this.onError = null;
    if (!options.workerBaseURL || !options.wasmBaseURL) {
      throw new Error('SuperSonic requires workerBaseURL and wasmBaseURL options. Example:\nnew SuperSonic({\n  workerBaseURL: "/supersonic/workers/",\n  wasmBaseURL: "/supersonic/wasm/"\n})');
    }
    const workerBaseURL = options.workerBaseURL;
    const wasmBaseURL = options.wasmBaseURL;
    const worldOptions = { ...defaultWorldOptions, ...options.scsynthOptions };
    this.config = {
      wasmUrl: options.wasmUrl || wasmBaseURL + "scsynth-nrt.wasm",
      wasmBaseURL,
      workletUrl: options.workletUrl || workerBaseURL + "scsynth_audio_worklet.js",
      workerBaseURL,
      development: false,
      audioContextOptions: {
        latencyHint: "interactive",
        // hint to push for lowest latency possible
        sampleRate: 48e3
        // only requested rate - actual rate is determined by hardware
      },
      // Build-time memory layout (constant)
      memory: MemoryLayout,
      // Runtime world options (merged defaults + user overrides)
      worldOptions
    };
    this.#sampleBaseURL = options.sampleBaseURL || null;
    this.#synthdefBaseURL = options.synthdefBaseURL || null;
    this.#audioPathMap = options.audioPathMap || {};
    this.bootStats = {
      initStartTime: null,
      initDuration: null
    };
  }
  /**
   * Get initialization status (read-only)
   */
  get initialized() {
    return this.#initialized;
  }
  /**
   * Get initialization in-progress status (read-only)
   */
  get initializing() {
    return this.#initializing;
  }
  /**
   * Get browser capabilities (read-only)
   */
  get capabilities() {
    return this.#capabilities;
  }
  /**
   * Set and validate browser capabilities for required features
   */
  setAndValidateCapabilities() {
    this.#capabilities = {
      audioWorklet: typeof AudioWorklet !== "undefined",
      sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
      crossOriginIsolated: window.crossOriginIsolated === true,
      atomics: typeof Atomics !== "undefined",
      webWorker: typeof Worker !== "undefined"
    };
    const required = [
      "audioWorklet",
      "sharedArrayBuffer",
      "crossOriginIsolated",
      "atomics",
      "webWorker"
    ];
    const missing = required.filter((f) => !this.#capabilities[f]);
    if (missing.length > 0) {
      const error = new Error(`Missing required features: ${missing.join(", ")}`);
      if (!this.#capabilities.crossOriginIsolated) {
        if (this.#capabilities.sharedArrayBuffer) {
          error.message += "\n\nSharedArrayBuffer is available but cross-origin isolation is not enabled. Please ensure COOP and COEP headers are set correctly:\n  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Embedder-Policy: require-corp";
        } else {
          error.message += "\n\nSharedArrayBuffer is not available. This may be due to:\n1. Missing COOP/COEP headers\n2. Browser doesn't support SharedArrayBuffer\n3. Browser security settings";
        }
      }
      throw error;
    }
    return this.#capabilities;
  }
  /**
   * Merge user-provided world options with defaults
   * @private
   */
  /**
   * Initialize shared WebAssembly memory
   */
  #initializeSharedMemory() {
    const memConfig = this.config.memory;
    this.#wasmMemory = new WebAssembly.Memory({
      initial: memConfig.totalPages,
      maximum: memConfig.totalPages,
      shared: true
    });
    this.#sharedBuffer = this.#wasmMemory.buffer;
  }
  #initializeAudioContext() {
    this.#audioContext = new AudioContext(this.config.audioContextOptions);
    return this.#audioContext;
  }
  #initializeBufferManager() {
    this.#bufferManager = new BufferManager({
      audioContext: this.#audioContext,
      sharedBuffer: this.#sharedBuffer,
      bufferPoolConfig: {
        start: this.config.memory.bufferPoolOffset,
        size: this.config.memory.bufferPoolSize
      },
      sampleBaseURL: this.#sampleBaseURL,
      audioPathMap: this.#audioPathMap,
      maxBuffers: this.config.worldOptions.numBuffers
    });
  }
  async #loadWasmManifest() {
    const manifestUrl = this.config.wasmBaseURL + "manifest.json";
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        console.warn(`[SuperSonic] WASM manifest not found (${response.status}), using default`);
        return;
      }
      const manifest = await response.json();
      this.config.wasmUrl = this.config.wasmBaseURL + manifest.wasmFile;
      console.log(`[SuperSonic] WASM: ${manifest.wasmFile} (${manifest.buildId}, git: ${manifest.gitHash})`);
    } catch (error) {
      console.warn("[SuperSonic] Failed to load WASM manifest, using default");
    }
  }
  /**
   * Load WASM binary from network
   */
  async #loadWasm() {
    await this.#loadWasmManifest();
    const wasmResponse = await fetch(this.config.wasmUrl);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to load WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
    }
    return await wasmResponse.arrayBuffer();
  }
  /**
   * Initialize AudioWorklet with WASM
   */
  async #initializeAudioWorklet(wasmBytes) {
    await this.#audioContext.audioWorklet.addModule(this.config.workletUrl);
    this.#workletNode = new AudioWorkletNode(this.#audioContext, "scsynth-processor", {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2]
    });
    this.#workletNode.connect(this.#audioContext.destination);
    this.#workletNode.port.postMessage({
      type: "init",
      sharedBuffer: this.#sharedBuffer
    });
    this.#workletNode.port.postMessage({
      type: "loadWasm",
      wasmBytes,
      wasmMemory: this.#wasmMemory,
      worldOptions: this.config.worldOptions,
      sampleRate: this.#audioContext.sampleRate
      // Pass actual AudioContext sample rate
    });
    await this.#waitForWorkletInit();
  }
  /**
   * Initialize OSC communication layer
   */
  async #initializeOSC() {
    this.#osc = new ScsynthOSC(this.config.workerBaseURL);
    this.#osc.onRawOSC((msg) => {
      if (this.onOSC) {
        this.onOSC(msg);
      }
    });
    this.#osc.onParsedOSC((msg) => {
      if (msg.address === "/buffer/freed") {
        this.#bufferManager?.handleBufferFreed(msg.args);
      } else if (msg.address === "/buffer/allocated") {
        this.#bufferManager?.handleBufferAllocated(msg.args);
      } else if (msg.address === "/synced" && msg.args.length > 0) {
        const syncId = msg.args[0];
        if (this.#syncListeners && this.#syncListeners.has(syncId)) {
          const listener = this.#syncListeners.get(syncId);
          listener(msg);
        }
      }
      if (this.onMessage) {
        this.#metrics_messagesReceived++;
        this.onMessage(msg);
      }
    });
    this.#osc.onDebugMessage((msg) => {
      if (this.onDebugMessage) {
        this.onDebugMessage(msg);
      }
    });
    this.#osc.onError((error, workerName) => {
      console.error(`[SuperSonic] ${workerName} error:`, error);
      this.#metrics_errors++;
      if (this.onError) {
        this.onError(new Error(`${workerName}: ${error}`));
      }
    });
    await this.#osc.init(this.#sharedBuffer, this.#ringBufferBase, this.#bufferConstants);
  }
  /**
   * Complete initialization and trigger callbacks
   */
  #finishInitialization() {
    this.#initialized = true;
    this.#initializing = false;
    this.bootStats.initDuration = performance.now() - this.bootStats.initStartTime;
    console.log(`[SuperSonic] Initialization complete in ${this.bootStats.initDuration.toFixed(2)}ms`);
    if (this.onInitialized) {
      this.onInitialized({
        capabilities: this.#capabilities,
        bootStats: this.bootStats
      });
    }
  }
  /**
   * Initialize the audio worklet system
   * @param {Object} config - Optional configuration overrides
   * @param {boolean} config.development - Use cache-busted WASM files (default: false)
   * @param {string} config.wasmUrl - Custom WASM URL
   * @param {string} config.workletUrl - Custom worklet URL
   * @param {Object} config.audioContextOptions - AudioContext options
   */
  async init(config = {}) {
    if (this.#initialized) {
      console.warn("[SuperSonic] Already initialized");
      return;
    }
    if (this.#initializing) {
      console.warn("[SuperSonic] Initialization already in progress");
      return;
    }
    this.config = {
      ...this.config,
      ...config,
      audioContextOptions: {
        ...this.config.audioContextOptions,
        ...config.audioContextOptions || {}
      }
    };
    this.#initializing = true;
    this.bootStats.initStartTime = performance.now();
    try {
      this.setAndValidateCapabilities();
      this.#initializeSharedMemory();
      this.#initializeAudioContext();
      this.#initializeBufferManager();
      const wasmBytes = await this.#loadWasm();
      await this.#initializeAudioWorklet(wasmBytes);
      await this.#initializeOSC();
      this.#setupMessageHandlers();
      this.#startPerformanceMonitoring();
      this.#finishInitialization();
    } catch (error) {
      this.#initializing = false;
      console.error("[SuperSonic] Initialization failed:", error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }
  /**
   * Wait for AudioWorklet to initialize
   */
  #waitForWorkletInit() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("AudioWorklet initialization timeout"));
      }, 5e3);
      const messageHandler = (event) => {
        if (event.data.type === "debug") {
          return;
        }
        if (event.data.type === "error") {
          console.error("[AudioWorklet] Error:", event.data.error);
          clearTimeout(timeout);
          this.#workletNode.port.removeEventListener("message", messageHandler);
          reject(new Error(event.data.error || "AudioWorklet error"));
          return;
        }
        if (event.data.type === "initialized") {
          clearTimeout(timeout);
          this.#workletNode.port.removeEventListener("message", messageHandler);
          if (event.data.success) {
            if (event.data.ringBufferBase !== void 0) {
              this.#ringBufferBase = event.data.ringBufferBase;
            } else {
              console.warn("[SuperSonic] Warning: ringBufferBase not provided by worklet");
            }
            if (event.data.bufferConstants !== void 0) {
              console.log("[SuperSonic] Received bufferConstants from worklet");
              this.#bufferConstants = event.data.bufferConstants;
              console.log("[SuperSonic] Initializing NTP timing");
              this.initializeNTPTiming();
              this.#startDriftOffsetTimer();
            } else {
              console.warn("[SuperSonic] Warning: bufferConstants not provided by worklet");
            }
            console.log("[SuperSonic] Calling resolve() for worklet initialization");
            resolve();
          } else {
            reject(new Error(event.data.error || "AudioWorklet initialization failed"));
          }
        }
      };
      this.#workletNode.port.addEventListener("message", messageHandler);
      this.#workletNode.port.start();
    });
  }
  /**
   * Set up message handlers for worklet
   */
  #setupMessageHandlers() {
    this.#workletNode.port.onmessage = (event) => {
      const { data } = event;
      switch (data.type) {
        case "error":
          console.error("[Worklet] Error:", data.error);
          if (data.diagnostics) {
            console.error("[Worklet] Diagnostics:", data.diagnostics);
            console.table(data.diagnostics);
          }
          this.#metrics_errors++;
          if (this.onError) {
            this.onError(new Error(data.error));
          }
          break;
        case "process_debug":
          break;
        case "debug":
          break;
        case "console":
          if (this.onConsoleMessage) {
            this.onConsoleMessage(data.message);
          }
          break;
        case "version":
          if (this.onVersion) {
            this.onVersion(data.version);
          }
          break;
      }
    };
  }
  /**
   * Get metrics from SharedArrayBuffer (worklet metrics written by WASM)
   * @returns {Object|null}
   * @private
   */
  #getWorkletMetrics() {
    if (!this.#sharedBuffer || !this.#bufferConstants || !this.#ringBufferBase) {
      return null;
    }
    const metricsBase = this.#ringBufferBase + this.#bufferConstants.METRICS_START;
    const metricsCount = this.#bufferConstants.METRICS_SIZE / 4;
    const metricsView = new Uint32Array(this.#sharedBuffer, metricsBase, metricsCount);
    return {
      processCount: Atomics.load(metricsView, 0),
      // PROCESS_COUNT offset / 4
      bufferOverruns: Atomics.load(metricsView, 1),
      // BUFFER_OVERRUNS offset / 4
      messagesProcessed: Atomics.load(metricsView, 2),
      // MESSAGES_PROCESSED offset / 4
      messagesDropped: Atomics.load(metricsView, 3),
      // MESSAGES_DROPPED offset / 4
      schedulerQueueDepth: Atomics.load(metricsView, 4),
      // SCHEDULER_QUEUE_DEPTH offset / 4
      schedulerQueueMax: Atomics.load(metricsView, 5),
      // SCHEDULER_QUEUE_MAX offset / 4
      schedulerQueueDropped: Atomics.load(metricsView, 6)
      // SCHEDULER_QUEUE_DROPPED offset / 4
    };
  }
  /**
   * Get buffer usage statistics from SAB head/tail pointers
   * @returns {Object|null}
   * @private
   */
  #getBufferUsage() {
    if (!this.#sharedBuffer || !this.#bufferConstants || !this.#ringBufferBase) {
      return null;
    }
    const atomicView = new Int32Array(this.#sharedBuffer);
    const controlBase = this.#ringBufferBase + this.#bufferConstants.CONTROL_START;
    const inHead = Atomics.load(atomicView, (controlBase + 0) / 4);
    const inTail = Atomics.load(atomicView, (controlBase + 4) / 4);
    const outHead = Atomics.load(atomicView, (controlBase + 8) / 4);
    const outTail = Atomics.load(atomicView, (controlBase + 12) / 4);
    const debugHead = Atomics.load(atomicView, (controlBase + 16) / 4);
    const debugTail = Atomics.load(atomicView, (controlBase + 20) / 4);
    const inUsed = (inHead - inTail + this.#bufferConstants.IN_BUFFER_SIZE) % this.#bufferConstants.IN_BUFFER_SIZE;
    const outUsed = (outHead - outTail + this.#bufferConstants.OUT_BUFFER_SIZE) % this.#bufferConstants.OUT_BUFFER_SIZE;
    const debugUsed = (debugHead - debugTail + this.#bufferConstants.DEBUG_BUFFER_SIZE) % this.#bufferConstants.DEBUG_BUFFER_SIZE;
    return {
      inBufferUsed: {
        bytes: inUsed,
        percentage: Math.round(inUsed / this.#bufferConstants.IN_BUFFER_SIZE * 100)
      },
      outBufferUsed: {
        bytes: outUsed,
        percentage: Math.round(outUsed / this.#bufferConstants.OUT_BUFFER_SIZE * 100)
      },
      debugBufferUsed: {
        bytes: debugUsed,
        percentage: Math.round(debugUsed / this.#bufferConstants.DEBUG_BUFFER_SIZE * 100)
      }
    };
  }
  /**
   * Get OSC worker metrics from SharedArrayBuffer (written by OSC workers)
   * @returns {Object|null}
   * @private
   */
  #getOSCMetrics() {
    if (!this.#sharedBuffer || !this.#bufferConstants || !this.#ringBufferBase) {
      return null;
    }
    const metricsBase = this.#ringBufferBase + this.#bufferConstants.METRICS_START;
    const metricsCount = this.#bufferConstants.METRICS_SIZE / 4;
    const metricsView = new Uint32Array(this.#sharedBuffer, metricsBase, metricsCount);
    return {
      // OSC Out (prescheduler) - offsets 7-18
      preschedulerPending: metricsView[7],
      preschedulerPeak: metricsView[8],
      preschedulerSent: metricsView[9],
      bundlesDropped: metricsView[10],
      retriesSucceeded: metricsView[11],
      retriesFailed: metricsView[12],
      bundlesScheduled: metricsView[13],
      eventsCancelled: metricsView[14],
      totalDispatches: metricsView[15],
      messagesRetried: metricsView[16],
      retryQueueSize: metricsView[17],
      retryQueueMax: metricsView[18],
      // OSC In - offsets 19-22
      oscInMessagesReceived: metricsView[19],
      oscInDroppedMessages: metricsView[20],
      oscInWakeups: metricsView[21],
      oscInTimeouts: metricsView[22],
      // Debug - offsets 23-26
      debugMessagesReceived: metricsView[23],
      debugWakeups: metricsView[24],
      debugTimeouts: metricsView[25],
      debugBytesRead: metricsView[26]
    };
  }
  /**
   * Gather metrics from all sources (worklet, OSC, internal counters)
   * All metrics are read synchronously from SAB
   * @returns {SuperSonicMetrics}
   * @private
   */
  #gatherMetrics() {
    const startTime = performance.now();
    const metrics = {
      // SuperSonic counters (in-memory, fast)
      messagesSent: this.#metrics_messagesSent,
      messagesReceived: this.#metrics_messagesReceived,
      errors: this.#metrics_errors
    };
    const workletMetrics = this.#getWorkletMetrics();
    if (workletMetrics) {
      Object.assign(metrics, workletMetrics);
    }
    const bufferUsage = this.#getBufferUsage();
    if (bufferUsage) {
      Object.assign(metrics, bufferUsage);
    }
    const oscMetrics = this.#getOSCMetrics();
    if (oscMetrics) {
      Object.assign(metrics, oscMetrics);
    }
    const totalDuration = performance.now() - startTime;
    if (totalDuration > 1) {
      console.warn(`[SuperSonic] Slow metrics gathering: ${totalDuration.toFixed(2)}ms`);
    }
    return metrics;
  }
  /**
   * Start performance monitoring - gathers metrics from all sources
   * and calls onMetricsUpdate with consolidated snapshot
   */
  #startPerformanceMonitoring() {
    if (this.#metricsIntervalId) {
      clearInterval(this.#metricsIntervalId);
    }
    this.#metricsIntervalId = setInterval(() => {
      if (!this.onMetricsUpdate) return;
      if (this.#metricsGatherInProgress) {
        console.warn("[SuperSonic] Metrics gathering took >100ms, skipping this interval");
        return;
      }
      this.#metricsGatherInProgress = true;
      try {
        const metrics = this.#gatherMetrics();
        this.onMetricsUpdate(metrics);
      } catch (error) {
        console.error("[SuperSonic] Metrics gathering failed:", error);
      } finally {
        this.#metricsGatherInProgress = false;
      }
    }, 100);
  }
  /**
   * Stop performance monitoring
   * @private
   */
  #stopPerformanceMonitoring() {
    if (this.#metricsIntervalId) {
      clearInterval(this.#metricsIntervalId);
      this.#metricsIntervalId = null;
    }
  }
  /**
   * Send OSC message with simplified syntax (auto-detects types)
   * @param {string} address - OSC address
   * @param {...*} args - Arguments (numbers, strings, Uint8Array)
   * @example
   * sonic.send('/notify', 1);
   * sonic.send('/s_new', 'sonic-pi-beep', -1, 0, 0);
   * sonic.send('/n_set', 1000, 'freq', 440.0, 'amp', 0.5);
   */
  async send(address, ...args) {
    this.#ensureInitialized("send OSC messages");
    const oscArgs = args.map((arg) => {
      if (typeof arg === "string") {
        return { type: "s", value: arg };
      } else if (typeof arg === "number") {
        return { type: Number.isInteger(arg) ? "i" : "f", value: arg };
      } else if (arg instanceof Uint8Array || arg instanceof ArrayBuffer) {
        return { type: "b", value: arg instanceof ArrayBuffer ? new Uint8Array(arg) : arg };
      } else {
        throw new Error(`Unsupported argument type: ${typeof arg}`);
      }
    });
    const message = { address, args: oscArgs };
    const oscData = _SuperSonic.osc.encode(message);
    return this.sendOSC(oscData);
  }
  #ensureInitialized(actionDescription = "perform this operation") {
    if (!this.#initialized) {
      throw new Error(`SuperSonic not initialized. Call init() before attempting to ${actionDescription}.`);
    }
  }
  /**
   * Send pre-encoded OSC bytes to scsynth
   * @param {ArrayBuffer|Uint8Array} oscData - Pre-encoded OSC data
   * @param {Object} options - Send options
   */
  async sendOSC(oscData, options = {}) {
    this.#ensureInitialized("send OSC data");
    const uint8Data = this.#toUint8Array(oscData);
    const preparedData = await this.#prepareOutboundPacket(uint8Data);
    this.#metrics_messagesSent++;
    if (this.onMessageSent) {
      this.onMessageSent(preparedData);
    }
    const timing = this.#calculateBundleWait(preparedData);
    const sendOptions = { ...options };
    if (timing) {
      sendOptions.audioTimeS = timing.audioTimeS;
      sendOptions.currentTimeS = timing.currentTimeS;
    }
    this.#osc.send(preparedData, sendOptions);
  }
  /**
   * Get AudioContext instance (read-only)
   * @returns {AudioContext} The AudioContext instance
   */
  get audioContext() {
    return this.#audioContext;
  }
  /**
   * Get AudioWorkletNode instance (read-only)
   * @returns {AudioWorkletNode} The AudioWorkletNode instance
   */
  get workletNode() {
    return this.#workletNode;
  }
  /**
   * Get ScsynthOSC instance (read-only)
   * @returns {ScsynthOSC} The OSC communication layer instance
   */
  get osc() {
    return this.#osc;
  }
  /**
   * Get current status
   */
  getStatus() {
    return {
      initialized: this.#initialized,
      capabilities: this.#capabilities,
      bootStats: this.bootStats,
      audioContextState: this.#audioContext?.state
    };
  }
  /**
   * Get current configuration (merged defaults + user overrides)
   * Useful for debugging and displaying in UI
   * @returns {Object} Current scsynth configuration
   * @example
   * const config = sonic.getConfig();
   * console.log('Buffer limit:', config.worldOptions.numBuffers);
   * console.log('Memory layout:', config.memory);
   */
  getConfig() {
    if (!this.config) {
      return null;
    }
    return {
      memory: { ...this.config.memory },
      worldOptions: { ...this.config.worldOptions }
    };
  }
  /**
   * Destroy the orchestrator and clean up resources
   */
  async destroy() {
    console.log("[SuperSonic] Destroying...");
    this.#stopDriftOffsetTimer();
    this.#stopPerformanceMonitoring();
    if (this.#osc) {
      this.#osc.terminate();
      this.#osc = null;
    }
    if (this.#workletNode) {
      this.#workletNode.disconnect();
      this.#workletNode = null;
    }
    if (this.#audioContext) {
      await this.#audioContext.close();
      this.#audioContext = null;
    }
    if (this.#bufferManager) {
      this.#bufferManager.destroy();
      this.#bufferManager = null;
    }
    this.#sharedBuffer = null;
    this.#initialized = false;
    this.loadedSynthDefs.clear();
    console.log("[SuperSonic] Destroyed");
  }
  /**
   * Get NTP start time for bundle creation.
   * This is the NTP timestamp when AudioContext.currentTime was 0.
   * Bundles should have timestamp = audioContextTime + ntpStartTime
   */
  waitForTimeSync() {
    this.#ensureInitialized("wait for time sync");
    const ntpStartView = new Float64Array(this.#sharedBuffer, this.#ringBufferBase + this.#bufferConstants.NTP_START_TIME_START, 1);
    return ntpStartView[0];
  }
  /**
   * Load a sample into a buffer and wait for confirmation
   * @param {number} bufnum - Buffer number
   * @param {string} path - Audio file path
   * @returns {Promise} Resolves when buffer is ready
   */
  async loadSample(bufnum, path, startFrame = 0, numFrames = 0) {
    this.#ensureInitialized("load samples");
    const bufferInfo = await this.#requireBufferManager().prepareFromFile({
      bufnum,
      path,
      startFrame,
      numFrames
    });
    await this.send(
      "/b_allocPtr",
      bufnum,
      bufferInfo.ptr,
      bufferInfo.numFrames,
      bufferInfo.numChannels,
      bufferInfo.sampleRate,
      bufferInfo.uuid
    );
    return bufferInfo.allocationComplete;
  }
  /**
   * Load a binary synthdef file and send it to scsynth
   * @param {string} path - Path or URL to the .scsyndef file
   * @returns {Promise<void>}
   * @example
   * await sonic.loadSynthDef('./extra/synthdefs/sonic-pi-beep.scsyndef');
   */
  async loadSynthDef(path) {
    if (!this.#initialized) {
      throw new Error("SuperSonic not initialized. Call init() first.");
    }
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load synthdef from ${path}: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const synthdefData = new Uint8Array(arrayBuffer);
      await this.send("/d_recv", synthdefData);
      const synthName = this.#extractSynthDefName(path);
      if (synthName) {
        this.loadedSynthDefs.add(synthName);
      }
      console.log(`[SuperSonic] Sent synthdef from ${path} (${synthdefData.length} bytes)`);
    } catch (error) {
      console.error("[SuperSonic] Failed to load synthdef:", error);
      throw error;
    }
  }
  /**
   * Load multiple synthdefs from a directory
   * @param {string[]} names - Array of synthdef names (without .scsyndef extension)
   * @returns {Promise<Object>} Map of name -> success/error
   * @example
   * const results = await sonic.loadSynthDefs(['sonic-pi-beep', 'sonic-pi-tb303']);
   */
  async loadSynthDefs(names) {
    if (!this.#initialized) {
      throw new Error("SuperSonic not initialized. Call init() first.");
    }
    if (!this.#synthdefBaseURL) {
      throw new Error(
        'synthdefBaseURL not configured. Please set it in SuperSonic constructor options.\nExample: new SuperSonic({ synthdefBaseURL: "./dist/synthdefs/" })\nOr use CDN: new SuperSonic({ synthdefBaseURL: "https://unpkg.com/supersonic-scsynth-synthdefs@latest/synthdefs/" })\nOr install: npm install supersonic-scsynth-synthdefs'
      );
    }
    const results = {};
    await Promise.all(
      names.map(async (name) => {
        try {
          const path = `${this.#synthdefBaseURL}${name}.scsyndef`;
          await this.loadSynthDef(path);
          results[name] = { success: true };
        } catch (error) {
          console.error(`[SuperSonic] Failed to load ${name}:`, error);
          results[name] = { success: false, error: error.message };
        }
      })
    );
    const successCount = Object.values(results).filter((r) => r.success).length;
    console.log(`[SuperSonic] Sent ${successCount}/${names.length} synthdef loads`);
    return results;
  }
  /**
   * Send /sync command and wait for /synced response
   * Use this to ensure all previous asynchronous commands have completed
   * @param {number} syncId - Unique integer identifier for this sync operation
   * @returns {Promise<void>}
   * @example
   * await sonic.loadSynthDefs(['synth1', 'synth2']);
   * await sonic.sync(12345); // Wait for all synthdefs to be processed
   */
  async sync(syncId) {
    if (!this.#initialized) {
      throw new Error("SuperSonic not initialized. Call init() first.");
    }
    if (!Number.isInteger(syncId)) {
      throw new Error("sync() requires an integer syncId parameter");
    }
    const syncPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.#syncListeners) {
          this.#syncListeners.delete(syncId);
        }
        reject(new Error("Timeout waiting for /synced response"));
      }, 1e4);
      const messageHandler = (msg) => {
        clearTimeout(timeout);
        this.#syncListeners.delete(syncId);
        resolve();
      };
      if (!this.#syncListeners) {
        this.#syncListeners = /* @__PURE__ */ new Map();
      }
      this.#syncListeners.set(syncId, messageHandler);
    });
    await this.send("/sync", syncId);
    await syncPromise;
  }
  /**
   * Allocate memory for an audio buffer (includes guard samples)
   * @param {number} numSamples - Number of Float32 samples to allocate
   * @returns {number} Byte offset into SharedArrayBuffer, or 0 if allocation failed
   * @example
   * const bufferAddr = sonic.allocBuffer(44100);  // Allocate 1 second at 44.1kHz
   */
  allocBuffer(numSamples) {
    this.#ensureInitialized("allocate buffers");
    return this.#bufferManager.allocate(numSamples);
  }
  /**
   * Free a previously allocated buffer
   * @param {number} addr - Buffer address returned by allocBuffer()
   * @returns {boolean} true if freed successfully
   * @example
   * sonic.freeBuffer(bufferAddr);
   */
  freeBuffer(addr) {
    this.#ensureInitialized("free buffers");
    return this.#bufferManager.free(addr);
  }
  /**
   * Get a Float32Array view of an allocated buffer
   * @param {number} addr - Buffer address returned by allocBuffer()
   * @param {number} numSamples - Number of Float32 samples
   * @returns {Float32Array} Typed array view into the buffer
   * @example
   * const view = sonic.getBufferView(bufferAddr, 44100);
   * view[0] = 1.0;  // Write to buffer
   */
  getBufferView(addr, numSamples) {
    this.#ensureInitialized("get buffer views");
    return this.#bufferManager.getView(addr, numSamples);
  }
  /**
   * Get buffer pool statistics
   * @returns {Object} Stats including total, available, used, etc.
   * @example
   * const stats = sonic.getBufferPoolStats();
   * console.log(`Available: ${stats.available} bytes`);
   */
  getBufferPoolStats() {
    this.#ensureInitialized("get buffer pool stats");
    return this.#bufferManager.getStats();
  }
  getDiagnostics() {
    this.#ensureInitialized("get diagnostics");
    return {
      buffers: this.#bufferManager.getDiagnostics(),
      synthdefs: {
        count: this.loadedSynthDefs.size
      }
    };
  }
  /**
   * Initialize NTP timing (write-once)
   * Sets the NTP start time when AudioContext started
   * @private
   */
  initializeNTPTiming() {
    if (!this.#bufferConstants || !this.#audioContext) {
      return;
    }
    const timestamp = this.#audioContext.getOutputTimestamp();
    const perfTimeMs = performance.timeOrigin + timestamp.performanceTime;
    const currentNTP = perfTimeMs / 1e3 + NTP_EPOCH_OFFSET;
    const ntpStartTime = currentNTP - timestamp.contextTime;
    const ntpStartView = new Float64Array(
      this.#sharedBuffer,
      this.#ringBufferBase + this.#bufferConstants.NTP_START_TIME_START,
      1
    );
    ntpStartView[0] = ntpStartTime;
    this.#initialNTPStartTime = ntpStartTime;
    console.log(`[SuperSonic] NTP timing initialized: start=${ntpStartTime.toFixed(6)}s (NTP=${currentNTP.toFixed(3)}s, contextTime=${timestamp.contextTime.toFixed(3)}s)`);
  }
  /**
   * Update drift offset (AudioContext → NTP drift correction)
   * CRITICAL: This REPLACES the drift value, does not accumulate
   * @private
   */
  updateDriftOffset() {
    if (!this.#bufferConstants || !this.#audioContext || this.#initialNTPStartTime === void 0) {
      return;
    }
    const timestamp = this.#audioContext.getOutputTimestamp();
    const perfTimeMs = performance.timeOrigin + timestamp.performanceTime;
    const currentNTP = perfTimeMs / 1e3 + NTP_EPOCH_OFFSET;
    const expectedContextTime = currentNTP - this.#initialNTPStartTime;
    const driftSeconds = expectedContextTime - timestamp.contextTime;
    const driftMs = Math.round(driftSeconds * 1e3);
    const driftView = new Int32Array(
      this.#sharedBuffer,
      this.#ringBufferBase + this.#bufferConstants.DRIFT_OFFSET_START,
      1
    );
    Atomics.store(driftView, 0, driftMs);
    console.log(`[SuperSonic] Drift offset: ${driftMs}ms (expected=${expectedContextTime.toFixed(3)}s, actual=${timestamp.contextTime.toFixed(3)}s, NTP=${currentNTP.toFixed(3)}s)`);
  }
  /**
   * Get current drift offset in milliseconds
   * @returns {number} Current drift in milliseconds
   */
  getDriftOffset() {
    if (!this.#bufferConstants) {
      return 0;
    }
    const driftView = new Int32Array(
      this.#sharedBuffer,
      this.#ringBufferBase + this.#bufferConstants.DRIFT_OFFSET_START,
      1
    );
    return Atomics.load(driftView, 0);
  }
  /**
   * Start periodic drift offset updates
   * @private
   */
  #startDriftOffsetTimer() {
    this.#stopDriftOffsetTimer();
    this.#driftOffsetTimer = setInterval(() => {
      this.updateDriftOffset();
    }, DRIFT_UPDATE_INTERVAL_MS);
    console.log(`[SuperSonic] Started drift offset correction (every ${DRIFT_UPDATE_INTERVAL_MS}ms)`);
  }
  /**
   * Stop periodic drift offset updates
   * @private
   */
  #stopDriftOffsetTimer() {
    if (this.#driftOffsetTimer) {
      clearInterval(this.#driftOffsetTimer);
      this.#driftOffsetTimer = null;
    }
  }
  #extractSynthDefName(path) {
    if (!path || typeof path !== "string") {
      return null;
    }
    const lastSegment = path.split("/").filter(Boolean).pop() || path;
    return lastSegment.replace(/\.scsyndef$/i, "");
  }
  #toUint8Array(data) {
    if (data instanceof Uint8Array) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    throw new Error("oscData must be ArrayBuffer or Uint8Array");
  }
  async #prepareOutboundPacket(uint8Data) {
    const decodeOptions = { metadata: true, unpackSingleArgs: false };
    try {
      const decodedPacket = _SuperSonic.osc.decode(uint8Data, decodeOptions);
      const { packet, changed } = await this.#rewritePacket(decodedPacket);
      if (!changed) {
        return uint8Data;
      }
      return _SuperSonic.osc.encode(packet);
    } catch (error) {
      console.error("[SuperSonic] Failed to prepare OSC packet:", error);
      throw error;
    }
  }
  async #rewritePacket(packet) {
    if (packet && packet.address) {
      const { message, changed } = await this.#rewriteMessage(packet);
      return { packet: message, changed };
    }
    if (this.#isBundle(packet)) {
      const subResults = await Promise.all(
        packet.packets.map((subPacket) => this.#rewritePacket(subPacket))
      );
      const changed = subResults.some((result) => result.changed);
      if (!changed) {
        return { packet, changed: false };
      }
      const rewrittenPackets = subResults.map((result) => result.packet);
      return {
        packet: {
          timeTag: packet.timeTag,
          packets: rewrittenPackets
        },
        changed: true
      };
    }
    return { packet, changed: false };
  }
  async #rewriteMessage(message) {
    switch (message.address) {
      case "/b_alloc":
        return {
          message: await this.#rewriteAlloc(message),
          changed: true
        };
      case "/b_allocRead":
        return {
          message: await this.#rewriteAllocRead(message),
          changed: true
        };
      case "/b_allocReadChannel":
        return {
          message: await this.#rewriteAllocReadChannel(message),
          changed: true
        };
      default:
        return { message, changed: false };
    }
  }
  async #rewriteAllocRead(message) {
    const bufferManager = this.#requireBufferManager();
    const bufnum = this.#requireIntArg(message.args, 0, "/b_allocRead requires a buffer number");
    const path = this.#requireStringArg(message.args, 1, "/b_allocRead requires a file path");
    const startFrame = this.#optionalIntArg(message.args, 2, 0);
    const numFrames = this.#optionalIntArg(message.args, 3, 0);
    const bufferInfo = await bufferManager.prepareFromFile({
      bufnum,
      path,
      startFrame,
      numFrames
    });
    this.#detachAllocationPromise(bufferInfo.allocationComplete, `/b_allocRead ${bufnum}`);
    return this.#buildAllocPtrMessage(bufnum, bufferInfo);
  }
  async #rewriteAllocReadChannel(message) {
    const bufferManager = this.#requireBufferManager();
    const bufnum = this.#requireIntArg(message.args, 0, "/b_allocReadChannel requires a buffer number");
    const path = this.#requireStringArg(message.args, 1, "/b_allocReadChannel requires a file path");
    const startFrame = this.#optionalIntArg(message.args, 2, 0);
    const numFrames = this.#optionalIntArg(message.args, 3, 0);
    const channels = [];
    for (let i = 4; i < (message.args?.length || 0); i++) {
      if (!this.#isNumericArg(message.args[i])) {
        break;
      }
      channels.push(Math.floor(this.#getArgValue(message.args[i])));
    }
    const bufferInfo = await bufferManager.prepareFromFile({
      bufnum,
      path,
      startFrame,
      numFrames,
      channels: channels.length > 0 ? channels : null
    });
    this.#detachAllocationPromise(bufferInfo.allocationComplete, `/b_allocReadChannel ${bufnum}`);
    return this.#buildAllocPtrMessage(bufnum, bufferInfo);
  }
  async #rewriteAlloc(message) {
    const bufferManager = this.#requireBufferManager();
    const bufnum = this.#requireIntArg(message.args, 0, "/b_alloc requires a buffer number");
    const numFrames = this.#requireIntArg(message.args, 1, "/b_alloc requires a frame count");
    let argIndex = 2;
    let numChannels = 1;
    let sampleRate = this.#audioContext?.sampleRate || 44100;
    if (this.#isNumericArg(this.#argAt(message.args, argIndex))) {
      numChannels = Math.max(1, this.#optionalIntArg(message.args, argIndex, 1));
      argIndex++;
    }
    if (this.#argAt(message.args, argIndex)?.type === "b") {
      argIndex++;
    }
    if (this.#isNumericArg(this.#argAt(message.args, argIndex))) {
      sampleRate = this.#getArgValue(this.#argAt(message.args, argIndex));
    }
    const bufferInfo = await bufferManager.prepareEmpty({
      bufnum,
      numFrames,
      numChannels,
      sampleRate
    });
    this.#detachAllocationPromise(bufferInfo.allocationComplete, `/b_alloc ${bufnum}`);
    return this.#buildAllocPtrMessage(bufnum, bufferInfo);
  }
  #buildAllocPtrMessage(bufnum, bufferInfo) {
    return {
      address: "/b_allocPtr",
      args: [
        this.#intArg(bufnum),
        this.#intArg(bufferInfo.ptr),
        this.#intArg(bufferInfo.numFrames),
        this.#intArg(bufferInfo.numChannels),
        this.#floatArg(bufferInfo.sampleRate),
        this.#stringArg(bufferInfo.uuid)
      ]
    };
  }
  #intArg(value) {
    return { type: "i", value: Math.floor(value) };
  }
  #floatArg(value) {
    return { type: "f", value };
  }
  #stringArg(value) {
    return { type: "s", value: String(value) };
  }
  #argAt(args, index) {
    if (!Array.isArray(args)) {
      return void 0;
    }
    return args[index];
  }
  #getArgValue(arg) {
    if (arg === void 0 || arg === null) {
      return void 0;
    }
    return typeof arg === "object" && Object.prototype.hasOwnProperty.call(arg, "value") ? arg.value : arg;
  }
  #requireIntArg(args, index, errorMessage) {
    const value = this.#getArgValue(this.#argAt(args, index));
    if (!Number.isFinite(value)) {
      throw new Error(errorMessage);
    }
    return Math.floor(value);
  }
  #optionalIntArg(args, index, defaultValue = 0) {
    const value = this.#getArgValue(this.#argAt(args, index));
    if (!Number.isFinite(value)) {
      return defaultValue;
    }
    return Math.floor(value);
  }
  #requireStringArg(args, index, errorMessage) {
    const value = this.#getArgValue(this.#argAt(args, index));
    if (typeof value !== "string") {
      throw new Error(errorMessage);
    }
    return value;
  }
  #isNumericArg(arg) {
    if (!arg) {
      return false;
    }
    const value = this.#getArgValue(arg);
    return Number.isFinite(value);
  }
  #detachAllocationPromise(promise, context) {
    if (!promise || typeof promise.catch !== "function") {
      return;
    }
    promise.catch((error) => {
      console.error(`[SuperSonic] ${context} allocation failed:`, error);
    });
  }
  #requireBufferManager() {
    if (!this.#bufferManager) {
      throw new Error("Buffer manager not ready. Call init() before issuing buffer commands.");
    }
    return this.#bufferManager;
  }
  #isBundle(packet) {
    return packet && packet.timeTag !== void 0 && Array.isArray(packet.packets);
  }
  #calculateBundleWait(uint8Data) {
    if (uint8Data.length < 16) {
      return null;
    }
    const header = String.fromCharCode.apply(null, uint8Data.slice(0, 8));
    if (header !== "#bundle\0") {
      return null;
    }
    const ntpStartView = new Float64Array(this.#sharedBuffer, this.#ringBufferBase + this.#bufferConstants.NTP_START_TIME_START, 1);
    const ntpStartTime = ntpStartView[0];
    if (ntpStartTime === 0) {
      console.warn("[SuperSonic] NTP start time not yet initialized");
      return null;
    }
    const driftView = new Int32Array(this.#sharedBuffer, this.#ringBufferBase + this.#bufferConstants.DRIFT_OFFSET_START, 1);
    const driftMs = Atomics.load(driftView, 0);
    const driftSeconds = driftMs / 1e3;
    const globalView = new Int32Array(this.#sharedBuffer, this.#ringBufferBase + this.#bufferConstants.GLOBAL_OFFSET_START, 1);
    const globalMs = Atomics.load(globalView, 0);
    const globalSeconds = globalMs / 1e3;
    const totalOffset = ntpStartTime + driftSeconds + globalSeconds;
    const view = new DataView(uint8Data.buffer, uint8Data.byteOffset);
    const ntpSeconds = view.getUint32(8, false);
    const ntpFraction = view.getUint32(12, false);
    if (ntpSeconds === 0 && (ntpFraction === 0 || ntpFraction === 1)) {
      return null;
    }
    const ntpTimeS = ntpSeconds + ntpFraction / 4294967296;
    const audioTimeS = ntpTimeS - totalOffset;
    const currentTimeS = this.#audioContext.currentTime;
    return { audioTimeS, currentTimeS };
  }
};
export {
  SuperSonic
};
/*! osc.js 2.4.5, Copyright 2024 Colin Clark | github.com/colinbdclark/osc.js */
