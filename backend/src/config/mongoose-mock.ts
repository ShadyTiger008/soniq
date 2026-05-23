import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const store: Record<string, Map<string, any>> = {};

const getCollectionStore = (modelName: string) => {
  const name = modelName.toLowerCase();
  if (!store[name]) {
    store[name] = new Map();
  }
  return store[name];
};

// Helper to convert mongoose query/filters to a matching function
const matchesFilter = (item: any, filter: any) => {
  if (!filter) return true;
  for (const key of Object.keys(filter)) {
    const val = filter[key];
    if (val && typeof val === "object") {
      if ("$in" in val) {
        const inArr = val.$in;
        if (!Array.isArray(inArr) || !inArr.map(String).includes(String(item[key]))) return false;
      } else if ("$nin" in val) {
        const ninArr = val.$nin;
        if (Array.isArray(ninArr) && ninArr.map(String).includes(String(item[key]))) return false;
      }
    } else {
      if (String(item[key]) !== String(val)) return false;
    }
  }
  return true;
};

function wrapDocument(doc: any, modelName: string) {
  if (!doc) return doc;
  const col = getCollectionStore(modelName);

  const wrapped = {
    ...doc,
    _id: doc._id || new mongoose.Types.ObjectId().toString(),
    id: doc.id || doc._id || new mongoose.Types.ObjectId().toString(),
    toObject: function() {
      const { toObject, toJSON, save, ...cleanData } = this;
      return cleanData;
    },
    toJSON: function() {
      const { toObject, toJSON, save, ...cleanData } = this;
      return cleanData;
    },
    save: async function() {
      this.updatedAt = new Date();
      const { toObject, toJSON, save, ...cleanData } = this;
      col.set(String(this._id), cleanData);
      return this;
    }
  };
  return wrapped;
}

function wrapQuery(result: any, modelName: string, isArray: boolean) {
  const processResult = (res: any) => {
    if (isArray) {
      return (res || []).map((item: any) => wrapDocument(item, modelName));
    } else {
      return wrapDocument(res, modelName);
    }
  };

  const queryChain = {
    sort: () => queryChain,
    limit: () => queryChain,
    populate: () => queryChain,
    select: () => queryChain,
    lean: () => queryChain,
    exec: async () => processResult(result),
    then: (resolve: any) => Promise.resolve(processResult(result)).then(resolve),
    catch: (reject: any) => Promise.resolve(processResult(result)).catch(reject),
  };
  return queryChain as any;
}

export function enableMongooseMocking() {
  logger.warn("⚠️ ENABLING IN-MEMORY MONGOOSE MOCKING FALLBACK");

  // Mock connection status
  const dummyConnection = {
    on: () => {},
    once: () => {},
    readyState: 1,
  } as any;

  Object.defineProperty(mongoose, "connection", {
    value: dummyConnection,
    writable: true,
    configurable: true,
  });

  // Override connection methods
  mongoose.connect = async () => {
    return mongoose as any;
  };

  mongoose.disconnect = async () => {};

  // Mock ObjectId validation for guest IDs
  const originalIsValid = mongoose.Types.ObjectId.isValid;
  mongoose.Types.ObjectId.isValid = function(val: any) {
    if (typeof val === "string" && val.startsWith("guest_")) return true;
    return originalIsValid(val);
  } as any;

  const mockStaticMethods: Record<string, Function> = {
    find: function(this: any, filter: any) {
      const col = getCollectionStore(this.modelName);
      const results = Array.from(col.values()).filter(item => matchesFilter(item, filter));
      return wrapQuery(results, this.modelName, true);
    },

    findOne: function(this: any, filter: any) {
      const col = getCollectionStore(this.modelName);
      const result = Array.from(col.values()).find(item => matchesFilter(item, filter)) || null;
      return wrapQuery(result, this.modelName, false);
    },

    findById: function(this: any, id: any) {
      const col = getCollectionStore(this.modelName);
      const result = col.get(String(id)) || null;
      return wrapQuery(result, this.modelName, false);
    },

    create: async function(this: any, doc: any) {
      const col = getCollectionStore(this.modelName);
      const data = Array.isArray(doc) ? doc : [doc];
      const createdDocs = data.map(d => {
        const id = d._id || new mongoose.Types.ObjectId().toString();
        const newDoc = {
          ...d,
          _id: id,
          id: id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        col.set(String(id), newDoc);
        return wrapDocument(newDoc, this.modelName);
      });
      return Array.isArray(doc) ? createdDocs : createdDocs[0];
    },

    findByIdAndUpdate: async function(this: any, id: any, update: any, options: any) {
      const col = getCollectionStore(this.modelName);
      const doc = col.get(String(id));
      if (!doc) {
        if (options && options.upsert) {
          const newDoc = {
            _id: id,
            id: id,
            ...(update.$set || update),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          col.set(String(id), newDoc);
          return wrapDocument(newDoc, this.modelName);
        }
        return null;
      }
      const updatedDoc = {
        ...doc,
        ...(update.$set || update),
        updatedAt: new Date(),
      };
      col.set(String(id), updatedDoc);
      return wrapDocument(updatedDoc, this.modelName);
    },

    findOneAndUpdate: async function(this: any, filter: any, update: any, options: any) {
      const col = getCollectionStore(this.modelName);
      let item = Array.from(col.values()).find(item => matchesFilter(item, filter));
      if (!item) {
        if (options && options.upsert) {
          const id = filter._id || new mongoose.Types.ObjectId().toString();
          item = {
            ...filter,
            _id: id,
            id: id,
            createdAt: new Date(),
          };
          col.set(String(id), item);
        } else {
          return null;
        }
      }

      const updatedItem = {
        ...item,
        ...(update.$set || update),
        updatedAt: new Date(),
      };

      col.set(String(item._id), updatedItem);
      return wrapDocument(updatedItem, this.modelName);
    },

    findByIdAndDelete: async function(this: any, id: any) {
      const col = getCollectionStore(this.modelName);
      const doc = col.get(String(id));
      col.delete(String(id));
      return wrapDocument(doc, this.modelName);
    },

    deleteOne: async function(this: any, filter: any) {
      const col = getCollectionStore(this.modelName);
      const item = Array.from(col.values()).find(item => matchesFilter(item, filter));
      if (item) {
        col.delete(String(item._id));
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },

    deleteMany: async function(this: any, filter: any) {
      const col = getCollectionStore(this.modelName);
      let count = 0;
      for (const item of Array.from(col.values())) {
        if (matchesFilter(item, filter)) {
          col.delete(String(item._id));
          count++;
        }
      }
      return { deletedCount: count };
    },

    updateOne: async function(this: any, filter: any, update: any) {
      const col = getCollectionStore(this.modelName);
      const item = Array.from(col.values()).find(item => matchesFilter(item, filter));
      if (item) {
        const updated = {
          ...item,
          ...(update.$set || update),
          updatedAt: new Date(),
        };
        col.set(String(item._id), updated);
        return { matchedCount: 1, modifiedCount: 1 };
      }
      return { matchedCount: 0, modifiedCount: 0 };
    },

    countDocuments: async function(this: any, filter: any) {
      const col = getCollectionStore(this.modelName);
      return Array.from(col.values()).filter(item => matchesFilter(item, filter)).length;
    }
  };

  // Override static methods on mongoose.Model
  Object.keys(mockStaticMethods).forEach(methodName => {
    (mongoose.Model as any)[methodName] = mockStaticMethods[methodName];
  });

  // Override Model save method on prototype
  mongoose.Model.prototype.save = async function(this: any) {
    const col = getCollectionStore(this.constructor.modelName);
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId().toString();
      this.id = this._id;
    }
    const { toObject, toJSON, save, ...cleanData } = this;
    col.set(String(this._id), cleanData);
    return this;
  };

  // Patch existing models registered in mongoose.models
  Object.values(mongoose.models).forEach(model => {
    Object.keys(mockStaticMethods).forEach(methodName => {
      (model as any)[methodName] = mockStaticMethods[methodName].bind(model);
    });
  });

  // Seed default public rooms
  seedMockData();
}

function seedMockData() {
  const roomsCol = getCollectionStore("Room");
  const hostId = "000000000000000000000001";

  const seedRooms = [
    {
      _id: "000000000000000000000002",
      id: "000000000000000000000002",
      name: "Lofi Chillbeats Room",
      description: "Escape the noise. Perfect for coding, studying, or just relaxing.",
      hostId: hostId,
      mood: "Lofi",
      isPrivate: false,
      maxListeners: 1000,
      listenerCount: 0,
      members: [],
      roles: new Map(),
      permissions: {
        playPause: "everyone",
        skip: "everyone",
        volume: "everyone",
        addToQueue: "everyone",
      },
      queue: [],
      songRequests: [],
      currentSong: {
        videoId: "jfKfPfyJRdk",
        title: "lofi hip hop radio 📚 beats to relax/study to",
        artist: "Lofi Girl",
        duration: 0,
        thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg"
      },
      playerState: {
        isPlaying: true,
        currentTime: 120,
        volume: 80,
        shuffle: false,
        repeatMode: "none",
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "000000000000000000000003",
      id: "000000000000000000000003",
      name: "Vibecue Lounge",
      description: "Chill house and synthwave mixes to elevate your mood.",
      hostId: hostId,
      mood: "Chill",
      isPrivate: false,
      maxListeners: 500,
      listenerCount: 0,
      members: [],
      roles: new Map(),
      permissions: {
        playPause: "everyone",
        skip: "everyone",
        volume: "everyone",
        addToQueue: "everyone",
      },
      queue: [],
      songRequests: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  seedRooms.forEach(room => {
    roomsCol.set(room._id, room);
  });
  logger.info(`✅ Seeded ${seedRooms.length} mock rooms in memory`);
}
