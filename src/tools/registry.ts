import type Database from '@ansvar/mcp-sqlite';
import { searchProvisions } from './search-provisions.js';
import { getProvision } from './get-provision.js';
import { compareRequirements } from './compare-requirements.js';
import { getDataSubjectRights } from './data-subject-rights.js';
import { getBreachNotificationRules } from './breach-notification.js';
import { getCrossBorderTransferRules } from './cross-border-transfers.js';
import { getDpaInfo } from './dpa-info.js';
import { listSources } from './list-sources.js';
import { about } from './about.js';
import { checkDataFreshness } from './check-data-freshness.js';

export const TOOL_DEFINITIONS = [
  {
    name: 'search_provisions',
    description:
      'Full-text search across data protection provisions from all 7 LATAM jurisdictions (Brazil, Argentina, Colombia, Chile, Uruguay, Mexico, Costa Rica)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', minLength: 1, description: 'Search query (e.g., "consent", "data breach", "transfer")' },
        country: {
          type: 'string',
          description: 'Filter by country code: BR, AR, CO, CL, UY, MX, CR',
          enum: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
        },
        topic: {
          type: 'string',
          description: 'Filter by topic (e.g., "consent", "rights", "transfers", "breach", "sanctions")',
        },
        limit: { type: 'number', description: 'Max results (default 10, max 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_provision',
    description:
      'Retrieve a single article/provision from a specific country\'s data protection law',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country: {
          type: 'string',
          description: 'Country code: BR, AR, CO, CL, UY, MX, CR',
          enum: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
        },
        article: { type: 'string', description: 'Article reference (e.g., "Art. 7", "Art. 15")' },
      },
      required: ['country', 'article'],
    },
  },
  {
    name: 'compare_requirements',
    description:
      'Compare data protection requirements across multiple LATAM jurisdictions on a specific topic',
    inputSchema: {
      type: 'object' as const,
      properties: {
        countries: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
          },
          description: 'Array of country codes to compare',
        },
        topic: {
          type: 'string',
          description: 'Topic to compare (e.g., "consent", "rights", "transfers", "breach", "sanctions")',
        },
      },
      required: ['countries', 'topic'],
    },
  },
  {
    name: 'get_data_subject_rights',
    description:
      'Get the data subject rights recognized by a specific LATAM jurisdiction\'s data protection law',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country: {
          type: 'string',
          description: 'Country code: BR, AR, CO, CL, UY, MX, CR',
          enum: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
        },
      },
      required: ['country'],
    },
  },
  {
    name: 'get_breach_notification_rules',
    description:
      'Get breach notification timelines, reporting authorities, and thresholds for a LATAM jurisdiction',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country: {
          type: 'string',
          description: 'Country code: BR, AR, CO, CL, UY, MX, CR',
          enum: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
        },
      },
      required: ['country'],
    },
  },
  {
    name: 'get_cross_border_transfer_rules',
    description:
      'Get cross-border data transfer rules including adequacy mechanisms, SCCs equivalents, and BCRs for a LATAM jurisdiction',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country: {
          type: 'string',
          description: 'Country code: BR, AR, CO, CL, UY, MX, CR',
          enum: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
        },
      },
      required: ['country'],
    },
  },
  {
    name: 'get_dpa_info',
    description:
      'Get data protection authority information: name, contact, website, and enforcement powers',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country: {
          type: 'string',
          description: 'Country code: BR, AR, CO, CL, UY, MX, CR',
          enum: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
        },
      },
      required: ['country'],
    },
  },
  {
    name: 'list_sources',
    description: 'List all available data sources with record counts and freshness information',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'about',
    description: 'Server metadata: version, coverage, tool list, and statistics',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'check_data_freshness',
    description: 'Check data currency across all sources and flag stale datasets',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

export function handleToolCall(db: Database, name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'search_provisions':
      return searchProvisions(db, args as any);
    case 'get_provision':
      return getProvision(db, args as any);
    case 'compare_requirements':
      return compareRequirements(db, args as any);
    case 'get_data_subject_rights':
      return getDataSubjectRights(db, args as any);
    case 'get_breach_notification_rules':
      return getBreachNotificationRules(db, args as any);
    case 'get_cross_border_transfer_rules':
      return getCrossBorderTransferRules(db, args as any);
    case 'get_dpa_info':
      return getDpaInfo(db, args as any);
    case 'list_sources':
      return listSources(db);
    case 'about':
      return about(db);
    case 'check_data_freshness':
      return checkDataFreshness(db);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
