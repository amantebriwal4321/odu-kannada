"use client";

import { openDB, type DBSchema } from "idb";
import type { SavedDoc } from "@/lib/types";

interface OduDB extends DBSchema {
  documents: {
    key: string;
    value: SavedDoc;
    indexes: { "by-updated": number };
  };
}

const DB_NAME = "odu";
const DB_VERSION = 1;

async function db() {
  return openDB<OduDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      const store = database.createObjectStore("documents", { keyPath: "id" });
      store.createIndex("by-updated", "updatedAt");
    },
  });
}

export async function listDocuments(): Promise<SavedDoc[]> {
  const database = await db();
  const all = await database.getAll("documents");
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveDocument(doc: SavedDoc): Promise<void> {
  const database = await db();
  await database.put("documents", doc);
}

export async function deleteDocument(id: string): Promise<void> {
  const database = await db();
  await database.delete("documents", id);
}
