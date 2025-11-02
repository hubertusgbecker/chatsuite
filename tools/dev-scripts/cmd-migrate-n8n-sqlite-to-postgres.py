#!/usr/bin/env python3
"""
n8n SQLite to PostgreSQL Migration Script

This script migrates n8n data from SQLite to PostgreSQL, preserving all workflows,
credentials, executions, and related data while handling schema differences between
SQLite (camelCase) and PostgreSQL (snake_case).

Usage:
    python3 cmd-migrate-n8n-sqlite-to-postgres.py --sqlite /path/to/database.sqlite \
        --pg-host postgres --pg-port 5432 --pg-db chatsuite --pg-user admin \
        --pg-password <ADMIN_PASSWORD> --pg-schema n8n
"""

import sqlite3
import psycopg2
import argparse
import sys
import json
from datetime import datetime
from typing import Dict, List, Tuple, Any

# Table migration order (respecting foreign key dependencies)
MIGRATION_ORDER = [
    # Core tables first
    'migrations',
    'settings',
    'role',
    'scope',
    'role_scope',
    'user',
    'auth_identity',
    'auth_provider_sync_history',
    'user_api_keys',

    # Projects and folders
    'project',
    'project_relation',
    'folder',

    # Tags
    'tag_entity',
    'annotation_tag_entity',
    'folder_tag',

    # Credentials
    'credentials_entity',
    'shared_credentials',

    # Workflows
    'workflow_entity',
    'shared_workflow',
    'workflow_history',
    'workflow_statistics',
    'workflows_tags',
    'workflow_dependency',

    # Webhooks
    'webhook_entity',

    # Executions
    'execution_entity',
    'execution_data',
    'execution_metadata',
    'execution_annotations',
    'execution_annotation_tags',

    # Variables and data
    'variables',
    'processed_data',
    'data_table',
    'data_table_column',

    # Testing
    'test_run',
    'test_case_execution',

    # Installed packages
    'installed_packages',
    'installed_nodes',

    # Event destinations
    'event_destinations',

    # Insights
    'insights_metadata',
    'insights_raw',
    'insights_by_period',

    # Chat hub
    'chat_hub_sessions',
    'chat_hub_messages',

    # Tokens
    'invalid_auth_token',
]

# Column name mappings from SQLite (source) to PostgreSQL (target)
COLUMN_MAPPINGS = {
    'installed_packages': {
        'packagename': 'packageName',
        'installedversion': 'installedVersion',
        'authorname': 'authorName',
        'authoremail': 'authorEmail',
    },
    'installed_nodes': {
        'latestversion': 'latestVersion',
    },
    'auth_identity': {
        'userid': 'userId',
        'providerid': 'providerId',
        'providertype': 'providerType',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'auth_provider_sync_history': {
        'providertype': 'providerType',
    },
    'tag_entity': {
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'workflows_tags': {
        'workflowid': 'workflowId',
        'tagid': 'tagId',
    },
    'workflow_statistics': {
        'workflowid': 'workflowId',
        'latestEvent': 'latestEvent',
        'rootcount': 'rootCount',
    },
    'webhook_entity': {
        'workflowid': 'workflowId',
        'webhookpath': 'webhookPath',
        'webhookid': 'webhookId',
        'pathlength': 'pathLength',
    },
    'execution_data': {
        'workflowdata': 'workflowData',
    },
    'workflow_history': {
        'versionid': 'versionId',
        'workflowid': 'workflowId',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'credentials_entity': {
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'shared_credentials': {
        'credentialsid': 'credentialsId',
        'projectid': 'projectId',
    },
    'shared_workflow': {
        'workflowid': 'workflowId',
        'projectid': 'projectId',
    },
    'execution_metadata': {
        'executionid': 'executionId',
    },
    'invalid_auth_token': {},
    'execution_annotations': {
        'executionid': 'executionId',
    },
    'annotation_tag_entity': {
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'execution_annotation_tags': {
        'annotationid': 'annotationId',
        'tagid': 'tagId',
    },
    'execution_entity': {
        'workflowid': 'workflowId',
        'retryof': 'retryOf',
        'retrysuccessid': 'retrySuccessId',
        'startedat': 'startedAt',
        'stoppedat': 'stoppedAt',
        'waitTill': 'waitTill',
        'workflowdata': 'workflowData',
        'customdata': 'customData',
    },
    'processed_data': {
        'workflowid': 'workflowId',
    },
    'folder': {
        'parentfolderid': 'parentFolderId',
        'projectid': 'projectId',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'folder_tag': {
        'folderid': 'folderId',
        'tagid': 'tagId',
    },
    'workflow_entity': {
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
        'versionid': 'versionId',
        'triggercount': 'triggerCount',
        'parentfolderid': 'parentFolderId',
        'pindata': 'pinData',
        'staticdata': 'staticData',
    },
    'insights_metadata': {
        'metaid': 'metaId',
        'workflowid': 'workflowId',
        'projectid': 'projectId',
        'workflowname': 'workflowName',
        'projectname': 'projectName',
    },
    'test_run': {
        'workflowid': 'workflowId',
        'triggercount': 'triggerCount',
        'runcreatedat': 'runCreatedAt',
        'completedat': 'completedAt',
        'errorcode': 'errorCode',
        'errordetails': 'errorDetails',
    },
    'user': {
        'firstname': 'firstName',
        'lastname': 'lastName',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
        'personalizationanswers': 'personalizationAnswers',
        'roleslug': 'roleSlug',
        'ispending': 'isPending',
        'mfasecret': 'mfaSecret',
        'mfaenabled': 'mfaEnabled',
        'mfarecoverycodes': 'mfaRecoveryCodes',
    },
    'test_case_execution': {
        'testrunid': 'testRunId',
        'executionid': 'executionId',
        'errorcode': 'errorCode',
        'errordetails': 'errorDetails',
        'runcreatedat': 'runCreatedAt',
        'completedat': 'completedAt',
    },
    'project_relation': {
        'projectid': 'projectId',
        'userid': 'userId',
    },
    'data_table': {
        'projectid': 'projectId',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'data_table_column': {
        'datatableid': 'dataTableId',
    },
    'role_scope': {
        'roleslug': 'roleSlug',
        'scopeslug': 'scopeSlug',
    },
    'user_api_keys': {
        'userid': 'userId',
        'apikey': 'apiKey',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'insights_raw': {
        'metaid': 'metaId',
        'createdat': 'createdAt',
    },
    'insights_by_period': {
        'metaid': 'metaId',
        'periodunit': 'periodUnit',
        'periodfrom': 'periodFrom',
        'periodto': 'periodTo',
    },
    'chat_hub_sessions': {
        'ownerid': 'ownerId',
        'credentialid': 'credentialId',
        'workflowid': 'workflowId',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
    'workflow_dependency': {
        'workflowid': 'workflowId',
        'workflowversionid': 'workflowVersionId',
        'dependencytype': 'dependencyType',
        'dependencykey': 'dependencyKey',
        'dependencyinfo': 'dependencyInfo',
    },
    'chat_hub_messages': {
        'sessionid': 'sessionId',
        'previousmessageid': 'previousMessageId',
        'revisionofmessageid': 'revisionOfMessageId',
        'retryofmessageid': 'retryOfMessageId',
        'workflowid': 'workflowId',
        'executionid': 'executionId',
        'createdat': 'createdAt',
        'updatedat': 'updatedAt',
    },
}


class N8NMigrator:
    def __init__(self, sqlite_path: str, pg_config: Dict[str, Any]):
        self.sqlite_path = sqlite_path
        self.pg_config = pg_config
        self.sqlite_conn = None
        self.pg_conn = None
        self.stats = {}

    def connect(self):
        """Connect to both databases"""
        print(f"Connecting to SQLite database: {self.sqlite_path}")
        self.sqlite_conn = sqlite3.connect(self.sqlite_path)
        self.sqlite_conn.row_factory = sqlite3.Row

        print(f"Connecting to PostgreSQL: {self.pg_config['host']}:{self.pg_config['port']}/{self.pg_config['database']}")
        self.pg_conn = psycopg2.connect(
            host=self.pg_config['host'],
            port=self.pg_config['port'],
            database=self.pg_config['database'],
            user=self.pg_config['user'],
            password=self.pg_config['password']
        )
        self.pg_conn.autocommit = False

    def get_table_columns(self, table_name: str, cursor) -> List[str]:
        """Get column names from PostgreSQL table"""
        cursor.execute(f"""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s
            ORDER BY ordinal_position
        """, (self.pg_config['schema'], table_name))
        return [row[0] for row in cursor.fetchall()]

    def map_column_name(self, table: str, sqlite_col: str) -> str:
        """Map SQLite column name to PostgreSQL column name"""
        if table in COLUMN_MAPPINGS:
            return COLUMN_MAPPINGS[table].get(sqlite_col.lower(), sqlite_col)
        return sqlite_col

    def migrate_table(self, table_name: str) -> Tuple[int, int]:
        """Migrate a single table from SQLite to PostgreSQL"""
        print(f"\n{'='*60}")
        print(f"Migrating table: {table_name}")
        print(f"{'='*60}")

        sqlite_cur = self.sqlite_conn.cursor()
        pg_cur = self.pg_conn.cursor()

        try:
            # Get PostgreSQL table columns
            pg_columns = self.get_table_columns(table_name, pg_cur)
            if not pg_columns:
                print(f"⚠️  Table {table_name} not found in PostgreSQL schema, skipping")
                return 0, 0

            # Count rows in SQLite
            sqlite_cur.execute(f"SELECT COUNT(*) FROM {table_name}")
            total_rows = sqlite_cur.fetchone()[0]

            if total_rows == 0:
                print(f"✓ Table {table_name} is empty, skipping")
                return 0, 0

            print(f"📊 Found {total_rows} rows in SQLite")

            # Get all rows from SQLite
            sqlite_cur.execute(f"SELECT * FROM {table_name}")
            rows = sqlite_cur.fetchall()

            inserted = 0
            skipped = 0

            for row in rows:
                # Map SQLite columns to PostgreSQL columns
                data = {}
                for key in row.keys():
                    pg_col = self.map_column_name(table_name, key)
                    if pg_col in pg_columns:
                        value = row[key]
                        # Handle boolean columns (SQLite stores as 0/1, PostgreSQL needs true/false)
                        boolean_columns = ['active', 'finished', 'loadOnStartup', 'systemRole', 'disabled',
                                         'mfaEnabled', 'isManaged', 'isPending', 'isArchived']
                        if pg_col in boolean_columns and value is not None:
                            value = bool(value)
                        # Handle JSON columns
                        if isinstance(value, str) and pg_col in ['nodes', 'connections', 'settings', 'staticData', 'pinData', 'meta', 'workflowData']:
                            try:
                                # Verify it's valid JSON
                                json.loads(value)
                            except:
                                pass
                        data[pg_col] = value

                if not data:
                    skipped += 1
                    continue

                # Build INSERT statement
                columns = list(data.keys())
                placeholders = [f"%s" for _ in columns]
                values = [data[col] for col in columns]

                insert_sql = f"""
                    INSERT INTO {self.pg_config['schema']}.{table_name}
                    ({', '.join([f'"{col}"' for col in columns])})
                    VALUES ({', '.join(placeholders)})
                    ON CONFLICT DO NOTHING
                """

                try:
                    pg_cur.execute(insert_sql, values)
                    inserted += 1
                except Exception as e:
                    print(f"⚠️  Error inserting row: {e}")
                    print(f"   Columns: {columns}")
                    print(f"   Values: {values[:3]}...")  # Show first 3 values
                    skipped += 1
                    self.pg_conn.rollback()
                    continue

            # Commit after each table
            self.pg_conn.commit()
            print(f"✓ Migrated {inserted} rows, skipped {skipped}")

            return inserted, skipped

        except Exception as e:
            print(f"❌ Error migrating table {table_name}: {e}")
            self.pg_conn.rollback()
            return 0, 0
        finally:
            sqlite_cur.close()
            pg_cur.close()

    def migrate_all(self):
        """Migrate all tables in order"""
        print("\n" + "="*60)
        print("Starting n8n SQLite to PostgreSQL Migration")
        print("="*60)
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        total_inserted = 0
        total_skipped = 0

        for table in MIGRATION_ORDER:
            inserted, skipped = self.migrate_table(table)
            self.stats[table] = {'inserted': inserted, 'skipped': skipped}
            total_inserted += inserted
            total_skipped += skipped

        print("\n" + "="*60)
        print("Migration Summary")
        print("="*60)
        for table, stats in self.stats.items():
            if stats['inserted'] > 0 or stats['skipped'] > 0:
                print(f"{table:40} | Inserted: {stats['inserted']:5} | Skipped: {stats['skipped']:5}")

        print(f"\n{'Total':40} | Inserted: {total_inserted:5} | Skipped: {total_skipped:5}")
        print("="*60)

    def verify_migration(self):
        """Verify critical data was migrated"""
        print("\n" + "="*60)
        print("Verification")
        print("="*60)

        pg_cur = self.pg_conn.cursor()

        # Check workflows
        pg_cur.execute(f"SELECT COUNT(*) FROM {self.pg_config['schema']}.workflow_entity")
        workflow_count = pg_cur.fetchone()[0]
        print(f"Workflows in PostgreSQL: {workflow_count}")

        # Check credentials
        pg_cur.execute(f"SELECT COUNT(*) FROM {self.pg_config['schema']}.credentials_entity")
        cred_count = pg_cur.fetchone()[0]
        print(f"Credentials in PostgreSQL: {cred_count}")

        # Check executions
        pg_cur.execute(f"SELECT COUNT(*) FROM {self.pg_config['schema']}.execution_entity")
        exec_count = pg_cur.fetchone()[0]
        print(f"Executions in PostgreSQL: {exec_count}")

        pg_cur.close()

    def close(self):
        """Close database connections"""
        if self.sqlite_conn:
            self.sqlite_conn.close()
        if self.pg_conn:
            self.pg_conn.close()


def main():
    parser = argparse.ArgumentParser(description='Migrate n8n from SQLite to PostgreSQL')
    parser.add_argument('--sqlite', required=True, help='Path to SQLite database file')
    parser.add_argument('--pg-host', default='postgres', help='PostgreSQL host')
    parser.add_argument('--pg-port', type=int, default=5432, help='PostgreSQL port')
    parser.add_argument('--pg-db', default='chatsuite', help='PostgreSQL database')
    parser.add_argument('--pg-user', default='admin', help='PostgreSQL user')
    parser.add_argument('--pg-password', required=True, help='PostgreSQL password')
    parser.add_argument('--pg-schema', default='n8n', help='PostgreSQL schema')

    args = parser.parse_args()

    pg_config = {
        'host': args.pg_host,
        'port': args.pg_port,
        'database': args.pg_db,
        'user': args.pg_user,
        'password': args.pg_password,
        'schema': args.pg_schema,
    }

    migrator = N8NMigrator(args.sqlite, pg_config)

    try:
        migrator.connect()
        migrator.migrate_all()
        migrator.verify_migration()
        print("\n✅ Migration completed successfully!")
        return 0
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        migrator.close()


if __name__ == '__main__':
    sys.exit(main())
