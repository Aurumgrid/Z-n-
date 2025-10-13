"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import en from "@/locales/en-US.json";
import br from "@/locales/br-BR.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface NotionUpload {
  id: string;
  name: string;
  type: "page" | "database" | "block" | "workspace";
  size: string;
  status: "uploading" | "completed" | "failed" | "syncing";
  progress: number;
  uploadDate: string;
  description?: string;
  notionUrl?: string;
  pageCount?: number;
  lastSynced?: string;
}

interface NotionIntegration {
  id: string;
  name: string;
  token: string;
  workspaceId: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  pageCount: number;
  databaseCount: number;
}

interface NotionPage {
  id: string;
  title: string;
  url: string;
  lastEdited: string;
  type: "page" | "database";
  childCount: number;
  isArchived: boolean;
}

export default function TimeKeeperNotionUploader() {
  const [locale, setLocale] = useState("en-US");
  const t = locale === "en-US" ? en : br;
  const [activeTab, setActiveTab] = useState("uploader");
  const [uploadItems, setUploadItems] = useState<NotionUpload[]>([]);
  const [integrations, setIntegrations] = useState<NotionIntegration[]>([]);
  const [notionPages, setNotionPages] = useState<NotionPage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUpload, setCurrentUpload] = useState<NotionUpload | null>(null);

  const [uploadType, setUploadType] = useState("page");
  const [notionToken, setNotionToken] = useState("");
  const [notionUrl, setNotionUrl] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState("60");

  // Initialize with sample data
  useEffect(() => {
    setUploadItems([
      {
        id: "1",
        name: t.projectDocumentation,
        type: "page",
        size: "2.4 MB",
        status: "completed",
        progress: 100,
        uploadDate: "2024-01-20T10:30:00Z",
        description: t.projectDocumentationDescription,
        notionUrl: "https://notion.so/project-docs",
        pageCount: 15,
        lastSynced: "2024-01-20T10:30:00Z"
      },
      {
        id: "2",
        name: t.developmentTasks,
        type: "database",
        size: "5.7 MB",
        status: "syncing",
        progress: 75,
        uploadDate: "2024-01-19T14:22:00Z",
        description: t.developmentTasksDescription,
        notionUrl: "https://notion.so/dev-tasks",
        pageCount: 42,
        lastSynced: "2024-01-20T09:15:00Z"
      }
    ]);

    setIntegrations([
      {
        id: "int1",
        name: t.mainWorkspace,
        token: "secret_*****************************",
        workspaceId: "workspace_1234567890",
        status: "connected",
        lastSync: "2024-01-20T10:30:00Z",
        pageCount: 25,
        databaseCount: 8
      }
    ]);

    setNotionPages([
      {
        id: "page1",
        title: t.gettingStarted,
        url: "https://notion.so/getting-started",
        lastEdited: "2024-01-20T09:15:00Z",
        type: "page",
        childCount: 5,
        isArchived: false
      },
      {
        id: "page2",
        title: t.apiDocumentation,
        url: "https://notion.so/api-docs",
        lastEdited: "2024-01-19T16:30:00Z",
        type: "database",
        childCount: 12,
        isArchived: false
      },
      {
        id: "page3",
        title: t.meetingNotes,
        url: "https://notion.so/meeting-notes",
        lastEdited: "2024-01-18T11:45:00Z",
        type: "page",
        childCount: 8,
        isArchived: false
      }
    ]);
  }, [t]);

  const handleUpload = async () => {
    if (!notionToken || !notionUrl) return;

    setIsUploading(true);
    setUploadProgress(0);

    const uploadItem: NotionUpload = {
      id: Date.now().toString(),
      name: `Notion ${uploadType} ${Date.now()}`,
      type: uploadType as any,
      size: "Unknown",
      status: "uploading",
      progress: 0,
      uploadDate: new Date().toISOString(),
      description: uploadDescription || undefined,
      notionUrl
    };

    setCurrentUpload(uploadItem);
    setUploadItems(prev => [uploadItem, ...prev]);

    // Simulate upload process
    const steps = [
      { progress: 10, message: t.connectingToNotion },
      { progress: 25, message: t.authenticatingWithNotion },
      { progress: 40, message: t.fetchingPageData },
      { progress: 60, message: t.processingContent },
      { progress: 80, message: t.convertingToTimeKeeper },
      { progress: 95, message: t.storingInBlockchain },
      { progress: 100, message: t.uploadCompleted }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUploadProgress(step.progress);
      setUploadItems(prev => prev.map(item =>
        item.id === uploadItem.id
          ? { ...item, progress: step.progress }
          : item
      ));
    }

    // Update status to completed
    setUploadItems(prev => prev.map(item =>
      item.id === uploadItem.id
        ? {
            ...item,
            status: "completed",
            progress: 100,
            pageCount: Math.floor(Math.random() * 50) + 1,
            lastSynced: new Date().toISOString()
          }
        : item
    ));

    setIsUploading(false);
    setCurrentUpload(null);
    setUploadProgress(0);

    // Reset form
    setNotionUrl("");
    setUploadDescription("");
  };

  const handleSync = async (uploadId: string) => {
    setUploadItems(prev => prev.map(item =>
      item.id === uploadId
        ? { ...item, status: "syncing", progress: 0 }
        : item
    ));

    // Simulate sync process
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadItems(prev => prev.map(item =>
        item.id === uploadId
          ? { ...item, progress }
          : item
      ));
    }

    setUploadItems(prev => prev.map(item =>
      item.id === uploadId
        ? {
            ...item,
            status: "completed",
            progress: 100,
            lastSynced: new Date().toISOString()
          }
        : item
    ));
  };

  const getUploadTypeColor = (type: string) => {
    switch (type) {
      case "page": return "default";
      case "database": return "secondary";
      case "block": return "outline";
      case "workspace": return "destructive";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "uploading": return "outline";
      case "syncing": return "secondary";
      case "failed": return "destructive";
      default: return "default";
    }
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "default";
      case "disconnected": return "outline";
      case "error": return "destructive";
      default: return "default";
    }
  };

  const documentationContent = `# TimeKeeper OS Notion Integration

## Overview
The TimeKeeper OS Notion Integration is a comprehensive system for connecting Notion workspaces with the TimeKeeper OS platform. It enables seamless data synchronization, content processing, and blockchain integration for Notion pages, databases, and workspaces.

## Key Features
- **Notion API Integration**: Full integration with Notion's official API
- **Multi-format Support**: Pages, databases, blocks, and entire workspaces
- **Real-time Synchronization**: Automatic syncing with configurable intervals
- **Content Processing**: Intelligent content analysis and transformation
- **Blockchain Integration**: Store Notion data on blockchain for permanence
- **Search & Indexing**: Full-text search and metadata indexing
- **Export Capabilities**: Multiple export formats and destinations

## Supported Notion Content Types

### 1. Pages
- **Full Pages**: Complete page content with all blocks and properties
- **Page Hierarchies**: Parent-child page relationships
- **Page Properties**: Title, created time, last edited, etc.
- **Page Content**: Text, headings, lists, tables, media, etc.
- **Page Metadata**: Authors, collaborators, comments, etc.

### 2. Databases
- **Database Schema**: Properties, views, filters, sorts
- **Database Entries**: Individual records with all properties
- **Database Relations**: Linked databases and references
- **Database Templates**: Template buttons and configurations
- **Database Rollups**: Calculated properties and formulas

### 3. Blocks
- **Text Blocks**: Paragraphs, headings, quotes, callouts
- **Media Blocks**: Images, videos, files, embeds
- **List Blocks**: Bulleted, numbered, toggle lists
- **Table Blocks**: Simple tables and database tables
- **Code Blocks**: Syntax-highlighted code snippets
- **Callout Blocks**: Notable callouts and alerts

### 4. Workspaces
- **Workspace Settings**: General configuration and preferences
- **Workspace Members**: User accounts and permissions
- **Workspace Pages**: All pages within the workspace
- **Workspace Databases**: All databases within the workspace
- **Workspace Analytics**: Usage statistics and insights

## Integration Process

### 1. Authentication
1. **Notion Token**: Generate integration token from Notion
2. **Workspace Access**: Grant access to specific pages/workspaces
3. **Token Storage**: Securely store token in TimeKeeper OS
4. **Permission Verification**: Verify access rights and permissions

### 2. Data Synchronization
1. **Initial Sync**: Full synchronization of selected content
2. **Incremental Sync**: Sync only changed content
3. **Conflict Resolution**: Handle conflicts between local and remote
4. **Metadata Sync**: Synchronize page properties and metadata

### 3. Content Processing
1. **Content Parsing**: Parse Notion's block structure
2. **Content Transformation**: Convert to TimeKeeper format
3. **Content Indexing**: Index for search and retrieval
4. **Content Validation**: Validate content integrity and structure

### 4. Blockchain Integration
1. **Content Hashing**: Generate cryptographic hashes
2. **Blockchain Storage**: Store content hashes on blockchain
3. **Verification**: Verify content integrity using blockchain
4. **Timestamping**: Create immutable timestamps for content

## API Integration

### Notion API Endpoints Used
- **Pages**: Retrieve, create, update, delete pages
- **Databases**: Query, filter, sort database entries
- **Blocks**: Retrieve and manipulate content blocks
- **Users**: Get user information and permissions
- **Search**: Search across pages and databases
- **Comments**: Retrieve and manage page comments

### Authentication Flow
\`\`\`typescript
// Notion API Authentication
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Verify integration access
const user = await notion.users.me({});
console.log('Connected as:', user.name);
\`\`\`

## Security Features
- **Token Encryption**: Secure encryption of Notion tokens
- **Access Control**: Role-based access to Notion content
- **Rate Limiting**: Respect Notion API rate limits
- **Data Encryption**: End-to-end encryption for sensitive data
- **Audit Logging**: Complete audit trail for all operations
- **Permission Verification**: Verify permissions before each operation

## Performance Optimization
- **Caching**: Intelligent caching of frequently accessed content
- **Batch Operations**: Batch API calls for efficiency
- **Incremental Sync**: Only sync changed content
- **Parallel Processing**: Parallel processing of multiple items
- **Compression**: Compress data for storage and transfer
- **Lazy Loading**: Load content on demand when needed`;

  const apiContent = `# TimeKeeper OS Notion API

## Core API Endpoints

### 1. Notion Integration Setup
\`\`\`typescript
// POST /api/notion/integration
export async function POST(request: Request) {
  try {
    const { token, workspaceId, name } = await request.json();

    // Validate token
    const notion = new Client({ auth: token });
    const user = await notion.users.me({});

    // Store integration
    const integration = await db.notionIntegration.create({
      data: {
        id: generateId(),
        name,
        token: encryptToken(token),
        workspaceId,
        userId: user.id,
        status: 'connected',
        lastSync: new Date(),
        createdAt: new Date()
      }
    });

    // Initial sync
    await performInitialSync(integration.id);

    return Response.json({
      success: true,
      integrationId: integration.id,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Notion integration failed:', error);
    return Response.json(
      { error: 'Failed to create Notion integration' },
      { status: 500 }
    );
  }
}
\`\`\`

### 2. Page Upload
\`\`\`typescript
// POST /api/notion/upload/page
export async function POST(request: Request) {
  try {
    const { pageId, integrationId, options } = await request.json();

    // Get integration
    const integration = await db.notionIntegration.findUnique({
      where: { id: integrationId }
    });

    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Initialize Notion client
    const notion = new Client({
      auth: decryptToken(integration.token)
    });

    // Get page data
    const page = await notion.pages.retrieve({ page_id: pageId });
    const blocks = await notion.blocks.children.list({
      block_id: pageId
    });

    // Process page content
    const processedContent = await processPageContent(page, blocks);

    // Generate content hash
    const contentHash = await generateContentHash(processedContent);

    // Store on blockchain
    const blockchainResult = await storeOnBlockchain({
      type: 'notion_page',
      content: processedContent,
      hash: contentHash,
      metadata: {
        pageId,
        title: getPageTitle(page),
        lastEdited: page.last_edited_time,
        integrationId
      }
    });

    // Store in database
    const upload = await db.notionUpload.create({
      data: {
        id: generateId(),
        type: 'page',
        notionId: pageId,
        title: getPageTitle(page),
        contentHash,
        blockchainTx: blockchainResult.transactionHash,
        status: 'completed',
        integrationId,
        metadata: {
          pageCount: blocks.results.length,
          lastEdited: page.last_edited_time,
          url: page.url
        },
        createdAt: new Date()
      }
    });

    return Response.json({
      success: true,
      uploadId: upload.id,
      blockchainTx: blockchainResult.transactionHash,
      contentHash
    });

  } catch (error) {
    console.error('Page upload failed:', error);
    return Response.json(
      { error: 'Failed to upload page' },
      { status: 500 }
    );
  }
}
\`\`\`

### 3. Database Upload
\`\`\`typescript
// POST /api/notion/upload/database
export async function POST(request: Request) {
  try {
    const { databaseId, integrationId, options } = await request.json();

    // Get integration
    const integration = await db.notionIntegration.findUnique({
      where: { id: integrationId }
    });

    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Initialize Notion client
    const notion = new Client({
      auth: decryptToken(integration.token)
    });

    // Get database schema
    const database = await notion.databases.retrieve({
      database_id: databaseId
    });

    // Query all entries
    const entries = [];
    let hasMore = true;
    let nextCursor: string | undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: nextCursor
      });

      entries.push(...response.results);
      hasMore = response.has_more;
      nextCursor = response.next_cursor;
    }

    // Process database content
    const processedContent = await processDatabaseContent(database, entries);

    // Generate content hash
    const contentHash = await generateContentHash(processedContent);

    // Store on blockchain
    const blockchainResult = await storeOnBlockchain({
      type: 'notion_database',
      content: processedContent,
      hash: contentHash,
      metadata: {
        databaseId,
        title: database.title[0]?.text?.content || 'Untitled Database',
        entryCount: entries.length,
        integrationId
      }
    });

    // Store in database
    const upload = await db.notionUpload.create({
      data: {
        id: generateId(),
        type: 'database',
        notionId: databaseId,
        title: database.title[0]?.text?.content || 'Untitled Database',
        contentHash,
        blockchainTx: blockchainResult.transactionHash,
        status: 'completed',
        integrationId,
        metadata: {
          entryCount: entries.length,
          schema: database.properties,
          lastEdited: database.last_edited_time,
          url: database.url
        },
        createdAt: new Date()
      }
    });

    return Response.json({
      success: true,
      uploadId: upload.id,
      blockchainTx: blockchainResult.transactionHash,
      entryCount: entries.length,
      contentHash
    });

  } catch (error) {
    console.error('Database upload failed:', error);
    return Response.json(
      { error: 'Failed to upload database' },
      { status: 500 }
    );
  }
}
\`\`\`

### 4. Synchronization
\`\`\`typescript
// POST /api/notion/sync
export async function POST(request: Request) {
  try {
    const { integrationId, force = false } = await request.json();

    // Get integration
    const integration = await db.notionIntegration.findUnique({
      where: { id: integrationId }
    });

    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Check if sync is needed
    if (!force) {
      const lastSync = new Date(integration.lastSync);
      const syncInterval = 60 * 60 * 1000; // 1 hour
      const now = new Date();

      if (now.getTime() - lastSync.getTime() < syncInterval) {
        return Response.json({
          success: true,
          message: 'Sync not needed',
          nextSync: new Date(lastSync.getTime() + syncInterval)
        });
      }
    }

    // Initialize Notion client
    const notion = new Client({
      auth: decryptToken(integration.token)
    });

    // Search for modified content
    const searchResults = await notion.search({
      filter: {
        property: 'last_edited_time',
        value: {
          after: integration.lastSync
        }
      }
    });

    // Process modified items
    const syncResults = [];
    for (const item of searchResults.results) {
      if (item.object === 'page') {
        const result = await syncPage(notion, item, integration);
        syncResults.push(result);
      } else if (item.object === 'database') {
        const result = await syncDatabase(notion, item, integration);
        syncResults.push(result);
      }
    }

    // Update integration sync time
    await db.notionIntegration.update({
      where: { id: integrationId },
      data: { lastSync: new Date() }
    });

    return Response.json({
      success: true,
      syncedItems: syncResults.length,
      results: syncResults,
      nextSync: new Date(Date.now() + 60 * 60 * 1000)
    });

  } catch (error) {
    console.error('Sync failed:', error);
    return Response.json(
      { error: 'Failed to sync Notion content' },
      { status: 500 }
    );
  }
}

async function syncPage(notion: Client, page: any, integration: any) {
  const blocks = await notion.blocks.children.list({
    block_id: page.id
  });

  const processedContent = await processPageContent(page, blocks);
  const contentHash = await generateContentHash(processedContent);

  // Check if content has changed
  const existingUpload = await db.notionUpload.findFirst({
    where: {
      notionId: page.id,
      integrationId: integration.id
    }
  });

  if (existingUpload && existingUpload.contentHash === contentHash) {
    return { id: page.id, status: 'unchanged', type: 'page' };
  }

  // Store on blockchain
  const blockchainResult = await storeOnBlockchain({
    type: 'notion_page',
    content: processedContent,
    hash: contentHash,
    metadata: {
      pageId: page.id,
      title: getPageTitle(page),
      lastEdited: page.last_edited_time,
      integrationId: integration.id
    }
  });

  // Update or create upload record
  const upload = await db.notionUpload.upsert({
    where: { id: existingUpload?.id || '' },
    update: {
      contentHash,
      blockchainTx: blockchainResult.transactionHash,
      status: 'completed',
      metadata: {
        pageCount: blocks.results.length,
        lastEdited: page.last_edited_time,
        url: page.url
      }
    },
    create: {
      id: generateId(),
      type: 'page',
      notionId: page.id,
      title: getPageTitle(page),
      contentHash,
      blockchainTx: blockchainResult.transactionHash,
      status: 'completed',
      integrationId: integration.id,
      metadata: {
        pageCount: blocks.results.length,
        lastEdited: page.last_edited_time,
        url: page.url
      },
      createdAt: new Date()
    }
  });

  return {
    id: page.id,
    status: 'synced',
    type: 'page',
    uploadId: upload.id
  };
}
\`\`\`

### 5. Content Search
\`\`\`typescript
// GET /api/notion/search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const integrationId = searchParams.get('integrationId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (integrationId) where.integrationId = integrationId;
    if (type) where.type = type;

    // Search in database
    const uploads = await db.notionUpload.findMany({
      where: {
        ...where,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { metadata: { path: '$.content', string_contains: query } }
        ]
      },
      include: {
        integration: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Search in Notion API if integration available
    let notionResults = [];
    if (integrationId && query) {
      const integration = await db.notionIntegration.findUnique({
        where: { id: integrationId }
      });

      if (integration) {
        const notion = new Client({
          auth: decryptToken(integration.token)
        });

        const searchResponse = await notion.search({
          query,
          filter: type ? { property: 'object', value: type } : undefined
        });

        notionResults = searchResponse.results;
      }
    }

    return Response.json({
      uploads,
      notionResults,
      total: uploads.length + notionResults.length,
      query
    });

  } catch (error) {
    console.error('Search failed:', error);
    return Response.json(
      { error: 'Failed to search Notion content' },
      { status: 500 }
    );
  }
}
\`\`\`

## Database Schema

\`\`\`prisma
model NotionIntegration {
  id            String   @id @default(cuid())
  name          String
  token         String   // Encrypted
  workspaceId   String
  userId        String
  status        IntegrationStatus
  lastSync      DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  uploads       NotionUpload[]

  @@map("notion_integrations")
}

model NotionUpload {
  id            String   @id @default(cuid())
  type          NotionType
  notionId      String
  title         String
  contentHash   String
  blockchainTx  String
  status        UploadStatus
  integrationId String
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  integration   NotionIntegration @relation(fields: [integrationId], references: [id])

  @@map("notion_uploads")
}

enum IntegrationStatus {
  CONNECTED
  DISCONNECTED
  ERROR
}

enum NotionType {
  PAGE
  DATABASE
  BLOCK
  WORKSPACE
}

enum UploadStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  SYNCING
}
\`\`\``;

  const codeOfConductContent = `# TimeKeeper OS Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience
* Focusing on what is best not just for us as individuals, but for the overall community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email address, without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement. All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the reporter of any incident.

## TimeKeeper OS Specific Guidelines

### Technical Conduct

In addition to the general code of conduct, we have specific guidelines for technical interactions within the TimeKeeper OS community:

#### Code Quality Standards
* **Code Reviews**: Provide constructive, specific feedback focused on the technical aspects of the code
* **Documentation**: Ensure all code contributions include appropriate documentation and comments
* **Testing**: All new features must include comprehensive tests
* **Security**: Follow security best practices and report vulnerabilities responsibly

#### Blockchain and Cryptocurrency Conduct
* **Financial Advice**: Never provide financial advice or guarantees about investment returns
* **Security Practices**: Promote and follow proper security practices for handling digital assets
* **Responsible Disclosure**: Report security vulnerabilities through proper channels
* **Ethical Development**: Ensure all blockchain implementations follow ethical guidelines

### Community Communication Guidelines

#### Communication Channels
* **GitHub Issues**: Use for bug reports, feature requests, and technical discussions
* **GitHub Discussions**: Use for general questions, ideas, and community conversations
* **Pull Requests**: Use focused, descriptive titles and detailed descriptions
* **Email**: Use for private or sensitive matters only

#### Diversity and Inclusion

#### Commitment to Diversity
* **Welcome All**: Actively welcome contributors from all backgrounds and experience levels
* **Accessibility**: Ensure all community spaces and resources are accessible
* **Language**: Use inclusive language and avoid assumptions about others
* **Accommodations**: Provide reasonable accommodations for community members

### Reporting Process

#### How to Report
1. **Direct Contact**: Email the project maintainers
2. **GitHub Issues**: Create a private issue by contacting maintainers
3. **Anonymous Reporting**: Use the anonymous reporting form
4. **In-Person Events**: Contact event organizers or designated safety officers

#### What to Report
* **Harassment**: Any form of harassment, discrimination, or inappropriate behavior
* **Code Violations**: Technical violations of security or ethical guidelines
* **Safety Concerns**: Any concerns about community safety or well-being
* **Accessibility Issues**: Barriers to participation for any community member

### Community Values

#### Core Values
* **Innovation**: Encourage creative thinking and innovative solutions
* **Collaboration**: Foster teamwork and shared success
* **Integrity**: Maintain honesty and transparency in all interactions
* **Excellence**: Strive for technical excellence and quality
* **Respect**: Treat all community members with dignity and respect

#### Project-Specific Values
* **Open Source**: Commit to open source principles and practices
* **Security**: Prioritize security in all development efforts
* **Decentralization**: Support decentralized technologies and principles
* **Education**: Promote learning and knowledge sharing
* **Sustainability**: Build for long-term success and maintenance

---

This Code of Conduct is effective as of August 2024 and applies to all members of the TimeKeeper OS community. We expect all community members to read, understand, and follow these guidelines.

*Last updated: August 2024*
*Version: 1.0*`;

  const examplesContent = `# TimeKeeper OS Notion Integration Examples

## 1. Frontend Components

### Notion Integration Setup
\`\`\`tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NotionSetupProps {
  onIntegrationComplete: (integrationId: string) => void;
}

export function NotionSetup({ onIntegrationComplete }: NotionSetupProps) {
  const [token, setToken] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [name, setName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('');

  const handleConnect = async () => {
    if (!token || !workspaceId || !name) return;

    setIsConnecting(true);
    setStatus('Connecting to Notion...');

    try {
      const response = await fetch('/api/notion/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, workspaceId, name })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('Integration created successfully!');
        onIntegrationComplete(result.integrationId);
      } else {
        setStatus(\`Connection failed: \${result.error}\`);
      }
    } catch (error) {
      setStatus(\`Connection error: \${error.message}\`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Notion Workspace</CardTitle>
        <CardDescription>
          Connect your Notion workspace to TimeKeeper OS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="integration-name">Integration Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Notion Integration"
            />
          </div>

          <div>
            <Label htmlFor="notion-token">Notion Integration Token</Label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="secret_*****************************"
              type="password"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Create a new integration in Notion settings to get your token
            </p>
          </div>

          <div>
            <Label htmlFor="workspace-id">Workspace ID</Label>
            <Input
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="workspace_1234567890"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Find your workspace ID in your Notion URL
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            {status || 'Enter your Notion credentials to connect'}
          </div>

          <Button
            onClick={handleConnect}
            disabled={!token || !workspaceId || !name || isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Workspace'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
\`\`\`

### Notion Page Uploader
\`\`\`tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NotionUploaderProps {
  integrations: Array<{ id: string; name: string }>;
  onUploadComplete: (uploadId: string) => void;
}

export function NotionUploader({ integrations, onUploadComplete }: NotionUploaderProps) {
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [notionUrl, setNotionUrl] = useState('');
  const [uploadType, setUploadType] = useState('page');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!selectedIntegration || !notionUrl) return;

    setIsUploading(true);
    setProgress(0);
    setStatus('Starting upload...');

    try {
      // Extract page/database ID from URL
      const id = extractNotionId(notionUrl);

      const response = await fetch(\`/api/notion/upload/\${uploadType}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [uploadType === 'page' ? 'pageId' : 'databaseId']: id,
          integrationId: selectedIntegration,
          options: {
            includeBlocks: true,
            includeProperties: true
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('Upload completed successfully!');
        setProgress(100);
        onUploadComplete(result.uploadId);
      } else {
        setStatus(\`Upload failed: \${result.error}\`);
      }
    } catch (error) {
      setStatus(\`Upload error: \${error.message}\`);
    } finally {
      setIsUploading(false);
    }
  };

  function extractNotionId(url: string): string {
    const match = url.match(/notion\\.so\\/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
    return match ? match[1].replace(/-/g, '') : '';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Notion Content</CardTitle>
        <CardDescription>
          Upload pages or databases from Notion to TimeKeeper OS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="integration">Integration</Label>
            <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
              <SelectTrigger>
                <SelectValue placeholder="Select integration" />
              </SelectTrigger>
              <SelectContent>
                {integrations.map((integration) => (
                  <SelectItem key={integration.id} value={integration.id}>
                    {integration.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="upload-type">Content Type</Label>
            <Select value={uploadType} onValueChange={setUploadType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notion-url">Notion URL</Label>
            <Input
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              placeholder="https://notion.so/your-page-or-database"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Paste the URL of the Notion page or database
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            {status || 'Enter Notion URL to upload'}
          </div>

          {isUploading && (
            <Progress value={progress} className="w-full" />
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedIntegration || !notionUrl || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
\`\`\`

### Notion Content Browser
\`\`\`tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotionBrowserProps {
  integrationId: string;
}

interface NotionItem {
  id: string;
  title: string;
  type: 'page' | 'database';
  url: string;
  lastEdited: string;
  childCount: number;
}

export function NotionBrowser({ integrationId }: NotionBrowserProps) {
  const [items, setItems] = useState<NotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<NotionItem | null>(null);

  useEffect(() => {
    loadNotionItems();
  }, [integrationId]);

  const loadNotionItems = async () => {
    try {
      const response = await fetch(\`/api/notion/items?integrationId=\${integrationId}\`);
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load Notion items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (item: NotionItem) => {
    try {
      const response = await fetch(\`/api/notion/upload/\${item.type}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [item.type === 'page' ? 'pageId' : 'databaseId']: item.id,
          integrationId
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Upload completed successfully!');
      } else {
        alert(\`Upload failed: \${result.error}\`);
      }
    } catch (error) {
      alert(\`Upload error: \${error.message}\`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading Notion content...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Notion Content</CardTitle>
          <CardDescription>
            Browse and upload content from your Notion workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className=\`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 \${
                    selectedItem?.id === item.id ? 'bg-blue-50 border-blue-200' : ''
                  }\`
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.type} • {item.childCount} items
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === 'page' ? 'default' : 'secondary'}>
                        {item.type}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpload(item);
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedItem.title}</CardTitle>
            <CardDescription>
              {selectedItem.type} • Last edited: {new Date(selectedItem.lastEdited).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpload(selectedItem)}
                    className="flex-1"
                  >
                    Upload to TimeKeeper OS
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedItem.url, '_blank')}
                  >
                    Open in Notion
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Type: {selectedItem.type}</div>
                  <div>ID: {selectedItem.id}</div>
                  <div>Child items: {selectedItem.childCount}</div>
                  <div>Last edited: {new Date(selectedItem.lastEdited).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
\`\`\`

## 2. Backend Services

### Notion Service Base Class
\`\`\`typescript
import { Client } from '@notionhq/client';
import { db } from '@/lib/db';
import { encryptToken, decryptToken } from '@/lib/crypto';
import { generateId } from '@/lib/utils';

export class NotionServiceBase {
  protected client: Client;
  protected integration: any;

  constructor(integration: any) {
    this.integration = integration;
    this.client = new Client({
      auth: decryptToken(integration.token)
    });
  }

  protected async verifyAccess(): Promise<boolean> {
    try {
      await this.client.users.me({});
      return true;
    } catch (error) {
      return false;
    }
  }

  protected async logOperation(operation: string, details: any): Promise<void> {
    await db.notionOperationLog.create({
      data: {
        id: generateId(),
        integrationId: this.integration.id,
        operation,
        details,
        timestamp: new Date()
      }
    });
  }

  protected async handleError(error: Error, context: string): Promise<never> {
    await this.logOperation('error', {
      context,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
\`\`\`

### Page Processing Service
\`\`\`typescript
import { NotionServiceBase } from './base-service';

export class NotionPageService extends NotionServiceBase {
  async processPage(pageId: string): Promise<{
    content: any;
    hash: string;
    metadata: any;
  }> {
    try {
      // Get page data
      const page = await this.client.pages.retrieve({ page_id: pageId });

      // Get page blocks
      const blocks = await this.client.blocks.children.list({
        block_id: pageId
      });

      // Process page content
      const content = await this.processPageContent(page, blocks);

      // Generate hash
      const hash = await this.generateContentHash(content);

      // Extract metadata
      const metadata = {
        pageId,
        title: this.getPageTitle(page),
        lastEdited: page.last_edited_time,
        createdTime: page.created_time,
        url: page.url,
        blockCount: blocks.results.length,
        properties: page.properties
      };

      await this.logOperation('page_processed', { pageId, hash });

      return { content, hash, metadata };
    } catch (error) {
      await this.handleError(error, 'process_page');
    }
  }

  private async processPageContent(page: any, blocks: any): Promise<any> {
    const processedBlocks = [];

    for (const block of blocks.results) {
      const processedBlock = await this.processBlock(block);
      processedBlocks.push(processedBlock);
    }

    return {
      id: page.id,
      title: this.getPageTitle(page),
      blocks: processedBlocks,
      properties: page.properties,
      lastEdited: page.last_edited_time
    };
  }

  private async processBlock(block: any): Promise<any> {
    const processed: any = {
      id: block.id,
      type: block.type,
      has_children: block.has_children
    };

    switch (block.type) {
      case 'paragraph':
        processed.content = this.extractRichText(block.paragraph.rich_text);
        break;

      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        processed.content = this.extractRichText(block[block.type].rich_text);
        processed.level = parseInt(block.type.split('_')[1]);
        break;

      case 'bulleted_list_item':
      case 'numbered_list_item':
        processed.content = this.extractRichText(block[block.type].rich_text);
        break;

      case 'to_do':
        processed.content = this.extractRichText(block.to_do.rich_text);
        processed.checked = block.to_do.checked;
        break;

      case 'code':
        processed.content = this.extractRichText(block.code.rich_text);
        processed.language = block.code.language;
        break;

      case 'image':
        processed.type = 'image';
        processed.url = block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;
        processed.caption = this.extractRichText(block.image.caption);
        break;

      default:
        processed.content = 'Unsupported block type';
    }

    // Process children if any
    if (block.has_children) {
      const children = await this.client.blocks.children.list({
        block_id: block.id
      });
      processed.children = await Promise.all(
        children.results.map((child: any) => this.processBlock(child))
      );
    }

    return processed;
  }

  private extractRichText(richText: any[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  private getPageTitle(page: any): string {
    const titleProperty = page.properties.title || page.properties.Name;
    if (titleProperty && titleProperty.title) {
      return this.extractRichText(titleProperty.title);
    }
    return 'Untitled Page';
  }

  private async generateContentHash(content: any): Promise<string> {
    const crypto = require('crypto');
    const contentString = JSON.stringify(content);
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }
}
\`\`\`

### Database Processing Service
\`\`\`typescript
import { NotionServiceBase } from './base-service';

export class NotionDatabaseService extends NotionServiceBase {
  async processDatabase(databaseId: string): Promise<{
    content: any;
    hash: string;
    metadata: any;
  }> {
    try {
      // Get database schema
      const database = await this.client.databases.retrieve({
        database_id: databaseId
      });

      // Query all entries
      const entries = await this.queryAllEntries(databaseId);

      // Process database content
      const content = await this.processDatabaseContent(database, entries);

      // Generate hash
      const hash = await this.generateContentHash(content);

      // Extract metadata
      const metadata = {
        databaseId,
        title: this.getDatabaseTitle(database),
        lastEdited: database.last_edited_time,
        createdTime: database.created_time,
        url: database.url,
        entryCount: entries.length,
        properties: database.properties,
        views: database.views || []
      };

      await this.logOperation('database_processed', { databaseId, hash, entryCount: entries.length });

      return { content, hash, metadata };
    } catch (error) {
      await this.handleError(error, 'process_database');
    }
  }

  private async queryAllEntries(databaseId: string): Promise<any[]> {
    const entries = [];
    let hasMore = true;
    let nextCursor: string | undefined;

    while (hasMore) {
      const response = await this.client.databases.query({
        database_id: databaseId,
        start_cursor: nextCursor,
        page_size: 100
      });

      entries.push(...response.results);
      hasMore = response.has_more;
      nextCursor = response.next_cursor;
    }

    return entries;
  }

  private async processDatabaseContent(database: any, entries: any[]): Promise<any> {
    const processedEntries = [];

    for (const entry of entries) {
      const processedEntry = await this.processDatabaseEntry(entry, database.properties);
      processedEntries.push(processedEntry);
    }

    return {
      id: database.id,
      title: this.getDatabaseTitle(database),
      properties: database.properties,
      entries: processedEntries,
      entryCount: entries.length
    };
  }

  private async processDatabaseEntry(entry: any, schema: any): Promise<any> {
    const processed: any = {
      id: entry.id,
      createdTime: entry.created_time,
      lastEditedTime: entry.last_edited_time,
      properties: {}
    };

    // Process each property
    for (const [key, property] of Object.entries(schema)) {
      const entryProperty = entry.properties[key];
      processed.properties[key] = await this.processProperty(entryProperty, property);
    }

    return processed;
  }

  private async processProperty(entryProperty: any, schemaProperty: any): Promise<any> {
    if (!entryProperty) return null;

    switch (schemaProperty.type) {
      case 'title':
        return this.extractRichText(entryProperty.title);

      case 'rich_text':
        return this.extractRichText(entryProperty.rich_text);

      case 'number':
        return entryProperty.number;

      case 'select':
        return entryProperty.select?.name || null;

      case 'multi_select':
        return entryProperty.multi_select?.map((item: any) => item.name) || [];

      case 'date':
        return entryProperty.date?.start || null;

      case 'people':
        return entryProperty.people?.map((person: any) => ({
          id: person.id,
          name: person.name,
          avatarUrl: person.avatar_url
        })) || [];

      case 'files':
        return entryProperty.files?.map((file: any) => ({
          name: file.name,
          url: file.type === 'external' ? file.external.url : file.file.url,
          type: file.type
        })) || [];

      case 'checkbox':
        return entryProperty.checkbox;

      case 'url':
        return entryProperty.url;

      case 'email':
        return entryProperty.email;

      case 'phone_number':
        return entryProperty.phone_number;

      case 'formula':
        return this.processFormulaProperty(entryProperty.formula, schemaProperty.formula);

      case 'relation':
        return entryProperty.relation?.map((rel: any) => rel.id) || [];

      case 'rollup':
        return this.processRollupProperty(entryProperty.rollup, schemaProperty.rollup);

      case 'created_time':
        return entryProperty.created_time;

      case 'created_by':
        return {
          id: entryProperty.created_by.id,
          name: entryProperty.created_by.name,
          avatarUrl: entryProperty.created_by.avatar_url
        };

      case 'last_edited_time':
        return entryProperty.last_edited_time;

      case 'last_edited_by':
        return {
          id: entryProperty.last_edited_by.id,
          name: entryProperty.last_edited_by.name,
          avatarUrl: entryProperty.last_edited_by.avatar_url
        };

      default:
        return null;
    }
  }

  private extractRichText(richText: any[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  private getDatabaseTitle(database: any): string {
    const titleProperty = database.properties.title;
    if (titleProperty && titleProperty.title) {
      return this.extractRichText(titleProperty.title);
    }
    return 'Untitled Database';
  }

  private async processFormulaProperty(formula: any, schema: any): Promise<any> {
    if (formula.type === 'string') return formula.string;
    if (formula.type === 'number') return formula.number;
    if (formula.type === 'boolean') return formula.boolean;
    if (formula.type === 'date') return formula.date?.start || null;
    return null;
  }

  private async processRollupProperty(rollup: any, schema: any): Promise<any> {
    if (rollup.type === 'number') return rollup.number;
    if (rollup.type === 'date') return rollup.date?.start || null;
    if (rollup.type === 'array') return rollup.array || [];
    return null;
  }

  private async generateContentHash(content: any): Promise<string> {
    const crypto = require('crypto');
    const contentString = JSON.stringify(content);
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }
}
\`\`\`

## 3. CLI Tools

### Notion CLI Tool
\`\`\`bash
#!/bin/bash

# TimeKeeper OS Notion CLI Tool

set -e

COMMAND="$1"
INTEGRATION_ID="$2"
NOTION_URL="$3"

if [ -z "$COMMAND" ]; then
    echo "Usage: $0 <command> [integration_id] [notion_url]"
    echo "Commands:"
    echo "  list-integrations - List all Notion integrations"
    echo "  create-integration - Create new Notion integration"
    echo "  upload-page <integration_id> <notion_url> - Upload a Notion page"
    echo "  upload-database <integration_id> <notion_url> - Upload a Notion database"
    echo "  sync <integration_id> - Sync all content from integration"
    echo "  search <integration_id> <query> - Search Notion content"
    exit 1
fi

case "$COMMAND" in
    "list-integrations")
        echo "Fetching Notion integrations..."
        RESPONSE=$(curl -s -X GET "http://localhost:3000/api/notion/integrations" \\
            -H "Authorization: Bearer $TIMEKEEPER_TOKEN")

        if echo "$RESPONSE" | jq -e '.integrations' > /dev/null 2>&1; then
            echo "Available integrations:"
            echo "$RESPONSE" | jq -r '.integrations[] | "ID: \(.id) | Name: \(.name) | Status: \(.status)"'
        else
            ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
            echo "Error: $ERROR_MSG"
            exit 1
        fi
        ;;

    "create-integration")
        echo "Creating new Notion integration..."
        echo "Enter integration details:"
        read -p "Name: " NAME
        read -p "Notion Token: " NOTION_TOKEN
        read -p "Workspace ID: " WORKSPACE_ID

        RESPONSE=$(curl -s -X POST "http://localhost:3000/api/notion/integration" \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer $TIMEKEEPER_TOKEN" \\
            -d "{
                \\"name\\": \\"$NAME\\",
                \\"token\\": \\"$NOTION_TOKEN\\",
                \\"workspaceId\\": \\"$WORKSPACE_ID\\"
            }")

        if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
            INTEGRATION_ID=$(echo "$RESPONSE" | jq -r '.integrationId')
            echo "Integration created successfully!"
            echo "Integration ID: $INTEGRATION_ID"
        else
            ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
            echo "Error: $ERROR_MSG"
            exit 1
        fi
        ;;

    "upload-page")
        if [ -z "$INTEGRATION_ID" ] || [ -z "$NOTION_URL" ]; then
            echo "Usage: $0 upload-page <integration_id> <notion_url>"
            exit 1
        fi

        echo "Uploading Notion page..."
        PAGE_ID=$(extractNotionId "$NOTION_URL")

        RESPONSE=$(curl -s -X POST "http://localhost:3000/api/notion/upload/page" \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer $TIMEKEEPER_TOKEN" \\
            -d "{
                \\"pageId\\": \\"$PAGE_ID\\",
                \\"integrationId\\": \\"$INTEGRATION_ID\\",
                \\"options\\": {
                    \\"includeBlocks\\": true,
                    \\"includeProperties\\": true
                }
            }")

        if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
            UPLOAD_ID=$(echo "$RESPONSE" | jq -r '.uploadId')
            BLOCKCHAIN_TX=$(echo "$RESPONSE" | jq -r '.blockchainTx')
            echo "Page uploaded successfully!"
            echo "Upload ID: $UPLOAD_ID"
            echo "Blockchain Transaction: $BLOCKCHAIN_TX"
        else
            ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
            echo "Error: $ERROR_MSG"
            exit 1
        fi
        ;;

    "upload-database")
        if [ -z "$INTEGRATION_ID" ] || [ -z "$NOTION_URL" ]; then
            echo "Usage: $0 upload-database <integration_id> <notion_url>"
            exit 1
        fi

        echo "Uploading Notion database..."
        DATABASE_ID=$(extractNotionId "$NOTION_URL")

        RESPONSE=$(curl -s -X POST "http://localhost:3000/api/notion/upload/database" \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer $TIMEKEEPER_TOKEN" \\
            -d "{
                \\"databaseId\\": \\"$DATABASE_ID\\",
                \\"integrationId\\": \\"$INTEGRATION_ID\\",
                \\"options\\": {
                    \\"includeEntries\\": true,
                    \\"includeSchema\\": true
                }
            }")

        if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
            UPLOAD_ID=$(echo "$RESPONSE" | jq -r '.uploadId')
            BLOCKCHAIN_TX=$(echo "$RESPONSE" | jq -r '.blockchainTx')
            ENTRY_COUNT=$(echo "$RESPONSE" | jq -r '.entryCount')
            echo "Database uploaded successfully!"
            echo "Upload ID: $UPLOAD_ID"
            echo "Blockchain Transaction: $BLOCKCHAIN_TX"
            echo "Entries Processed: $ENTRY_COUNT"
        else
            ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
            echo "Error: $ERROR_MSG"
            exit 1
        fi
        ;;

    "sync")
        if [ -z "$INTEGRATION_ID" ]; then
            echo "Usage: $0 sync <integration_id>"
            exit 1
        fi

        echo "Syncing Notion content..."
        RESPONSE=$(curl -s -X POST "http://localhost:3000/api/notion/sync" \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer $TIMEKEEPER_TOKEN" \\
            -d "{
                \\"integrationId\\": \\"$INTEGRATION_ID\\",
                \\"force\\": false
            }")

        if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
            SYNCED_ITEMS=$(echo "$RESPONSE" | jq -r '.syncedItems')
            NEXT_SYNC=$(echo "$RESPONSE" | jq -r '.nextSync')
            echo "Sync completed successfully!"
            echo "Items synced: $SYNCED_ITEMS"
            echo "Next sync: $NEXT_SYNC"
        else
            ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
            echo "Error: $ERROR_MSG"
            exit 1
        fi
        ;;

    "search")
        if [ -z "$INTEGRATION_ID" ] || [ -z "$NOTION_URL" ]; then
            echo "Usage: $0 search <integration_id> <query>"
            exit 1
        fi

        QUERY="$NOTION_URL"
        echo "Searching Notion content..."
        RESPONSE=$(curl -s -X GET "http://localhost:3000/api/notion/search?integrationId=$INTEGRATION_ID&q=$QUERY" \\
            -H "Authorization: Bearer $TIMEKEEPER_TOKEN")

        if echo "$RESPONSE" | jq -e '.uploads' > /dev/null 2>&1; then
            echo "Search results:"
            echo "$RESPONSE" | jq -r '.uploads[] | "Title: \(.title) | Type: \(.type) | URL: \(.metadata.url)"'
        else
            ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
            echo "Error: $ERROR_MSG"
            exit 1
        fi
        ;;

    *)
        echo "Unknown command: $COMMAND"
        exit 1
        ;;
esac

function extractNotionId() {
    local url="$1"
    echo "$url" | sed -n 's/.*notion\\.so\\/\\([a-f0-9]\\{32\\}\\).*/\\1/p'
}
\`\`\``;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
        <div>
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="br-BR">Português (BR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Integration Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{integrations.length}</div>
            <div className="text-sm text-muted-foreground">{t.integrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {uploadItems.filter(u => u.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">{t.uploaded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {notionPages.length}
            </div>
            <div className="text-sm text-muted-foreground">{t.notionPages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {uploadItems.filter(u => u.type === "database").length}
            </div>
            <div className="text-sm text-muted-foreground">{t.databases}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="uploader">{t.uploader}</TabsTrigger>
          <TabsTrigger value="integrations">{t.integrations}</TabsTrigger>
          <TabsTrigger value="documentation">{t.documentation}</TabsTrigger>
          <TabsTrigger value="examples">{t.examples}</TabsTrigger>
          <TabsTrigger value="conduct">{t.codeOfConduct}</TabsTrigger>
        </TabsList>

        <TabsContent value="uploader" className="mt-6">
          <div className="space-y-6">
            {/* Current Upload Progress */}
            {isUploading && currentUpload && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">{t.uploading}</Badge>
                    {currentUpload.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <div className="text-sm text-muted-foreground">
                      {t.uploadProgress.replace('{uploadProgress}', uploadProgress.toString())}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t.uploadNotionContent}</CardTitle>
                <CardDescription>
                  {t.uploadDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notion-token">{t.notionToken}</Label>
                    <Input
                      value={notionToken}
                      onChange={(e) => setNotionToken(e.target.value)}
                      placeholder="secret_*****************************"
                      type="password"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.notionTokenHint}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="upload-type">{t.contentType}</Label>
                    <Select value={uploadType} onValueChange={setUploadType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">{t.page}</SelectItem>
                        <SelectItem value="database">{t.database}</SelectItem>
                        <SelectItem value="block">{t.block}</SelectItem>
                        <SelectItem value="workspace">{t.workspace}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notion-url">{t.notionUrl}</Label>
                    <Input
                      value={notionUrl}
                      onChange={(e) => setNotionUrl(e.target.value)}
                      placeholder="https://notion.so/your-page-or-database"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.notionUrlHint}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">{t.description}</Label>
                    <Input
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder={t.uploadDescriptionPlaceholder}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sync-enabled"
                      checked={syncEnabled}
                      onCheckedChange={setSyncEnabled}
                    />
                    <Label htmlFor="sync-enabled">{t.enableSync}</Label>
                  </div>

                  {syncEnabled && (
                    <div>
                      <Label htmlFor="sync-interval">{t.syncInterval}</Label>
                      <Select value={syncInterval} onValueChange={setSyncInterval}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">{t.minutes15}</SelectItem>
                          <SelectItem value="30">{t.minutes30}</SelectItem>
                          <SelectItem value="60">{t.hour1}</SelectItem>
                          <SelectItem value="120">{t.hours2}</SelectItem>
                          <SelectItem value="360">{t.hours6}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={
                      isUploading ||
                      !notionToken ||
                      !notionUrl
                    }
                    className="w-full"
                  >
                    {isUploading ? t.uploadingButton : t.uploadContentButton}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload History */}
            <Card>
              <CardHeader>
                <CardTitle>{t.uploadHistory}</CardTitle>
                <CardDescription>
                  {t.recentUploads}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadItems.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant={getUploadTypeColor(item.type)}>
                              {item.type}
                            </Badge>
                            <Badge variant={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                        {item.description && (
                          <CardDescription>{item.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <div>{t.size.replace('{size}', item.size)}</div>
                            <div>{t.pages.replace('{pageCount}', item.pageCount ? item.pageCount.toString() : 'N/A')}</div>
                            <div>{t.uploadedDate.replace('{uploadDate}', new Date(item.uploadDate).toLocaleString())}</div>
                            {item.lastSynced && (
                              <div>{t.lastSynced.replace('{lastSynced}', new Date(item.lastSynced).toLocaleString())}</div>
                            )}
                            {item.notionUrl && (
                              <div>
                                <a
                                  href={item.notionUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {t.viewInNotion}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {item.status === "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSync(item.id)}
                              >
                                {t.sync}
                              </Button>
                            )}
                            {item.status === "syncing" && (
                              <Progress value={item.progress} className="w-24" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <div className="space-y-6">
            {/* Integrations List */}
            <Card>
              <CardHeader>
                <CardTitle>{t.notionIntegrations}</CardTitle>
                <CardDescription>
                  {t.connectedWorkspaces}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <Card key={integration.id} className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant={getIntegrationStatusColor(integration.status)}>
                            {integration.status}
                          </Badge>
                        </div>
                        <CardDescription>{t.workspaceId.replace('{workspaceId}', integration.workspaceId)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">{t.pages.replace(': {pageCount}', '')}</div>
                            <div className="text-muted-foreground">{integration.pageCount}</div>
                          </div>
                          <div>
                            <div className="font-medium">{t.databases}</div>
                            <div className="text-muted-foreground">{integration.databaseCount}</div>
                          </div>
                          <div>
                            <div className="font-medium">{t.lastSync}</div>
                            <div className="text-muted-foreground">
                              {new Date(integration.lastSync).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{t.status}</div>
                            <div className="text-muted-foreground">{integration.status}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notion Pages Browser */}
            <Card>
              <CardHeader>
                <CardTitle>{t.notionContentBrowser}</CardTitle>
                <CardDescription>
                  {t.browseNotionContent}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notionPages.map((page) => (
                    <Card key={page.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{page.title}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant={page.type === "page" ? "default" : "secondary"}>
                              {page.type}
                            </Badge>
                            {page.isArchived && (
                              <Badge variant="outline">{t.archived}</Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription>
                          {t.lastEdited.replace('{lastEdited}', new Date(page.lastEdited).toLocaleString())}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <div>{t.childItems.replace('{childCount}', page.childCount.toString())}</div>
                            <div>{t.type.replace('{type}', page.type)}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(page.url, '_blank')}
                            >
                              {t.openInNotion}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setNotionUrl(page.url);
                                setUploadType(page.type);
                                setActiveTab("uploader");
                              }}
                            >
                              {t.upload}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.documentationTab}</CardTitle>
              <CardDescription>
                {t.completeDocumentation}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <pre className="whitespace-pre-wrap text-sm">{documentationContent}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.codeExamples}</CardTitle>
              <CardDescription>
                {t.implementationSamples}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <pre className="whitespace-pre-wrap text-sm">{examplesContent}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conduct" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.codeOfConductTab}</CardTitle>
              <CardDescription>
                {t.communityGuidelines}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <pre className="whitespace-pre-wrap text-sm">{codeOfConductContent}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>{t.connectNewWorkspace}</div>
              <div>{t.uploadPagesAndDatabases}</div>
              <div>{t.configureSync}</div>
              <div>{t.browseContent}</div>
              <div>{t.searchContent}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.systemTools}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <a href="/aurum-grid-uploader">{t.aurumGridUploader}</a>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <a href="/spaceship-dashboard">{t.spaceshipDashboard}</a>
              </Button>
              <div className="text-xs text-muted-foreground">
                {t.aurumGridDescription}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.systemStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{t.notionApiStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{t.blockchainServiceStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{t.syncServiceStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{t.storageUsed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}