
import {
  Pinecone,
  type Index,
  type PineconeRecord,
} from "@pinecone-database/pinecone";
import { EMBEDDING_DIMENSIONS } from "./ai-config.js";

const indexName = process.env.PINECONE_INDEX ?? "chaibook";

let pineconeClient: Pinecone | null = null;
let indexReady = false;
let indexInitialization: Promise<void> | null = null;

function getPineconeClient(): Pinecone {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not configured");
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }

  return pineconeClient;
}

async function waitForIndexReady(name: string): Promise<void> {
  const client = getPineconeClient();

  for (let attempt = 0; attempt < 30; attempt++) {
    const description = await client.describeIndex(name);

    if (description.status?.ready) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    `Pinecone index "${name}" did not become ready in time`
  );
}

export async function ensurePineconeIndex(): Promise<void> {
  if (indexReady) {
    return;
  }

  // Share initialization across concurrent requests.
  if (indexInitialization) {
    return indexInitialization;
  }

  indexInitialization = (async () => {
    const client = getPineconeClient();
    const indexes = await client.listIndexes();

    const exists = indexes.indexes?.some(
      (index) => index.name === indexName
    );

    if (!exists) {
      try {
        await client.createIndex({
          name: indexName,
          dimension: EMBEDDING_DIMENSIONS,
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1",
            },
          },
        });
      } catch (error) {
        // Another application instance may have created the index
        // concurrently. Verify existence before treating this as fatal.
        const updatedIndexes = await client.listIndexes();

        const createdElsewhere = updatedIndexes.indexes?.some(
          (index) => index.name === indexName
        );

        if (!createdElsewhere) {
          throw error;
        }
      }
    }

    await waitForIndexReady(indexName);

    const description = await client.describeIndex(indexName);

    if (
      description.dimension !== undefined &&
      description.dimension !== EMBEDDING_DIMENSIONS
    ) {
      throw new Error(
        `Pinecone index dimension mismatch: expected ${EMBEDDING_DIMENSIONS}, got ${description.dimension}`
      );
    }

    indexReady = true;
  })();

  try {
    await indexInitialization;
  } finally {
    indexInitialization = null;
  }
}

export async function getPineconeIndex(): Promise<Index> {
  await ensurePineconeIndex();

  return getPineconeClient().index({
    name: indexName,
  });
}

export type VectorMetadata = {
  workspaceId: string;
  sourceId: string;
  chunkId: string;
  chunkIndex: number;
  sourceTitle: string;
  sourceType: string;
  text: string;
  page?: number;
};

export async function upsertSourceVectors(
  workspaceId: string,
  records: PineconeRecord<VectorMetadata>[]
): Promise<void> {
  if (!workspaceId.trim()) {
    throw new Error("Workspace ID is required");
  }

  if (records.length === 0) {
    return;
  }

  const index = await getPineconeIndex();
  const namespace = index.namespace(workspaceId);

  const batchSize = 100;

  for (let i = 0; i < records.length; i += batchSize) {
    await namespace.upsert({
      records: records.slice(i, i + batchSize),
    });
  }
}

export async function deleteSourceVectors(
  workspaceId: string,
  sourceId: string
): Promise<void> {
  if (!workspaceId.trim() || !sourceId.trim()) {
    throw new Error("Workspace ID and source ID are required");
  }

  const index = await getPineconeIndex();

  await index.namespace(workspaceId).deleteMany({
    filter: {
      sourceId: { $eq: sourceId },
    },
  });
}

export async function deleteWorkspaceVectors(
  workspaceId: string
): Promise<void> {
  if (!workspaceId.trim()) {
    throw new Error("Workspace ID is required");
  }

  const index = await getPineconeIndex();

  await index.namespace(workspaceId).deleteAll();
}

export async function queryWorkspaceVectors(
  workspaceId: string,
  vector: number[],
  topK: number,
  sourceIds?: string[]
) {
  if (!workspaceId.trim()) {
    throw new Error("Workspace ID is required");
  }

  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${vector.length}`
    );
  }

  if (!Number.isInteger(topK) || topK < 1) {
    throw new Error("topK must be a positive integer");
  }

  // CRITICAL: An explicitly empty selection must not retrieve
  // vectors from every source in the workspace.
  if (sourceIds !== undefined && sourceIds.length === 0) {
    return [];
  }

  if (
    sourceIds !== undefined &&
    (!Array.isArray(sourceIds) ||
      !sourceIds.every(
        (id) => typeof id === "string" && id.trim().length > 0
      ))
  ) {
    throw new Error("Invalid source IDs");
  }

  const uniqueSourceIds =
    sourceIds === undefined ? undefined : [...new Set(sourceIds)];

  const filter =
    uniqueSourceIds === undefined
      ? undefined
      : {
          sourceId: {
            $in: uniqueSourceIds,
          },
        };

  const index = await getPineconeIndex();

  const result = await index.namespace(workspaceId).query({
    vector,
    topK,
    includeMetadata: true,
    ...(filter ? { filter } : {}),
  });

  return result.matches ?? [];
}

export { indexName as PINECONE_INDEX_NAME };
